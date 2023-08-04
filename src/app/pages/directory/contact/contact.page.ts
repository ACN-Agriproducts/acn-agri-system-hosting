import { Component, OnInit, ViewChild } from '@angular/core';
import { Firestore, limit, orderBy, Query, query, where } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { IonInfiniteScroll, NavController } from '@ionic/angular';
import { Contact } from '@shared/classes/contact';
import { Contract } from '@shared/classes/contract';
import { FirebaseDocInterface, Pagination } from '@shared/classes/FirebaseDocInterface';
import { units } from '@shared/classes/mass';
import { Ticket } from '@shared/classes/ticket';
import { lastValueFrom, of } from 'rxjs';
import { EditContactDialogComponent } from '../components/edit-contact-dialog/edit-contact-dialog.component';

@Component({
	selector: 'app-contact',
	templateUrl: './contact.page.html',
	styleUrls: ['./contact.page.scss'],
})
export class ContactPage implements OnInit {
	@ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

	private docStep: number = 20;
	public displayUnit: units;
	
	public primaryContact: {
		email: string;
		isPrimary: boolean;
		name: string;
		phone: string;
	};
	public infiniteScrollState: Map<string, boolean> = new Map(
		[
			["contracts", false],
			["tickets", false]
		]
	);

	public contact: Contact;
	public contactType: null | string[] = [];
	public currentCompany: string;
	public currentPlant: string;
	public docsType: string;
	public id: string;
	public ready: boolean = false;
	public contracts: Pagination<FirebaseDocInterface>;
	public tickets: Pagination<FirebaseDocInterface>;

	constructor(
		private db: Firestore,
		private route: ActivatedRoute,
		private session: SessionInfo,
		private snack: SnackbarService,
		private navController: NavController,
		private dialog: MatDialog,
	) { }

	ngOnInit() {
		this.currentCompany = this.session.getCompany();
		this.currentPlant = this.session.getPlant();
		this.id = this.route.snapshot.paramMap.get('id');
		this.displayUnit = this.session.getDisplayUnit();

		Contact.getDoc(this.db, this.currentCompany, this.id)
		.then(async contact => {
			this.contact = contact;
			this.ready = this.contact != null;
			if (!this.ready) throw 'Contact could not be loaded';

			this.primaryContact = this.contact.getPrimaryMetaContact();
			this.contactType = this.contact.getType();
			if (this.contactType == null) { throw 'Type not found' }

			if (this.contactType.includes('client')) {
				await this.getContracts();
			}
			if (this.contactType.includes('trucker')) {
				await this.getTickets();
			}
			this.docsType = this.getDocsType();
		})
		.catch(error => {
			this.snack.open(error, 'error');
		});
	}

	public async getContracts(): Promise<void> {
		const constraints = [
			where("clientName", "==", this.contact.name),
			orderBy('date')
		];

		if (await Contract.getContractCount(this.db, this.currentCompany, false, ...constraints) > 0) {
			const contractQuery = query(Contract.getCollectionReference(
				this.db,
				this.currentCompany
			), ...constraints);

			this.contracts = this.setPagination(this.contracts, contractQuery);
		}
	}

	public async getTickets(): Promise<void> {
		const constraints = [
			where("truckerId", "==", this.id),
			orderBy('dateOut')
		];

		if (await Ticket.getTicketCount(this.db, this.currentCompany, this.currentPlant, ...constraints) > 0) {
			const ticketQuery = query(Ticket.getCollectionReference(
				this.db, 
				this.currentCompany, 
				this.currentPlant
			), ...constraints);

			this.tickets = this.setPagination(this.tickets, ticketQuery);
		}
	}

	public setPagination(
		pagination: Pagination<FirebaseDocInterface>,
		colQuery: Query<FirebaseDocInterface>
	): Pagination<FirebaseDocInterface> {
		if (pagination) pagination.end();
		pagination = new Pagination<FirebaseDocInterface>(colQuery, this.docStep);
		return pagination;
	}

	public openContract(refId: string): void {
		this.navController.navigateForward(`dashboard/contracts/contract-info/${this.docsType}/${refId}`);
	}


	public openTicket(refId: string): void {
		// TBD
	}

	public changeDocuments(event: any): void {
		this.docsType = event.detail.value;
		this.infiniteScroll.disabled = this.infiniteScrollState.get(this.docsType);
	}

	public getDocsType(): string {
		return this.contracts ? "contracts" :
			this.tickets ? "tickets" : "";
	}

	public getCurrentList(): Pagination<FirebaseDocInterface> {
		return this[this.docsType];
	}

	public standardMetacontact = (metacontact: {
		email: string;
		isPrimary: boolean;
		name: string;
		phone: string;
	}) => !metacontact.isPrimary;

	public async edit(): Promise<void> {
		const metacontacts = [];
		this.contact.metacontacts.forEach(metaContact => {
			metacontacts.push({ ...metaContact });
		});
		const contactCopy = { ...this.contact, metacontacts: metacontacts };

		const dialogRef = this.dialog.open(EditContactDialogComponent, {
			autoFocus: false,
			data: contactCopy,
		});
		const newContactData = await lastValueFrom(dialogRef.afterClosed());
		if (newContactData == null) return;

		this.updateContact(newContactData);
	}

	public updateContact(data: Contact): void {
		this.contact.update({
			caat: data.caat,
			city: data.city.toUpperCase(),
			metacontacts: data.metacontacts,
			name: data.name.toUpperCase(),
			state: data.state.toUpperCase(),
			streetAddress: data.streetAddress.toUpperCase(),
			tags: data.tags,
			zipCode: data.zipCode,
		})
		.then(() => {
			this.contact.caat = data.caat;
			this.contact.city = data.city.toUpperCase();
			this.contact.metacontacts = data.metacontacts;
			this.contact.name = data.name.toUpperCase();
			this.contact.state = data.state.toUpperCase();
			this.contact.streetAddress = data.streetAddress.toUpperCase();
			this.contact.tags = data.tags;
			this.contact.zipCode = data.zipCode;

			this.snack.open("Contact successfully updated", "success");
		})
		.catch(error => {
			this.snack.open(error, "error");
		});
	}

	public archive(): void {

	}

	public async infiniteDocuments(event: any) {
		console.log(this.getCurrentList())
		this.getCurrentList()?.getNext(snapshot => {
			console.log(snapshot)
			console.log(snapshot.docs.length);
			event.target.complete();
			if (snapshot.docs.length < this.docStep) {
				this.infiniteScroll.disabled = true;
				this.infiniteScrollState.set(this.docsType, true);
			}
			else {
				this.infiniteScroll.disabled = false;
				this.infiniteScrollState.set(this.docsType, false);
			}
		});
	}

	ngOnDestroy(): void {
		this.contracts?.end();
		this.tickets?.end();
	}
}
