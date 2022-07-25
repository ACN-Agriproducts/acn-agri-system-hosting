import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, DocumentReference } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Subscription } from 'rxjs';
import { ContractLiquidationLongComponent } from './components/contract-liquidation-long/contract-liquidation-long.component';
import { TicketsTableComponent } from './components/tickets-table/tickets-table.component';
import { Contract } from "@shared/classes/contract";
import { Ticket } from '@shared/classes/ticket';
import { getFunctions, httpsCallable } from '@angular/fire/functions';
import { utils, WorkBook, writeFile } from 'xlsx';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-contract-info',
  templateUrl: './contract-info.page.html',
  styleUrls: ['./contract-info.page.scss'],
})
export class ContractInfoPage implements OnInit, OnDestroy {

  public id: string;
  public type: string;
  public currentCompany: string;
  public currentContract: Contract;
  public ready:boolean = false;
  public ticketList: Ticket[];
  public ticketDiscountList: {data: Ticket, discounts: any}[];
  public ticketsReady: boolean = false;
  public contractRef: AngularFirestoreDocument;
  public showLiquidation: boolean = false;
  private currentSub: Subscription;

  @ViewChild(ContractLiquidationLongComponent) printableLiquidation: ContractLiquidationLongComponent;
  
  constructor(
    private route: ActivatedRoute,
    private localStorage: Storage,
    private db: AngularFirestore,
    private fns: AngularFireFunctions,
    private snackBar: MatSnackBar
    ) { }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    this.type = this.route.snapshot.paramMap.get('type')
    this.localStorage.get('currentCompany').then(val => {
      this.currentCompany = val;
      Contract.getDocById(this.db, this.currentCompany, this.type == "purchase", this.id).then(contract => {
        this.currentContract = contract;
        this.ready = true;
        this.currentContract.getTickets().then(tickets => {
          this.ticketList = tickets;
          const list:{data: Ticket, discounts: any}[] = [];

          this.ticketList.forEach(t => {
            list.push({data: t, discounts: {infested: 0, inspection:0}});
          })
          this.ticketDiscountList = list;
        });
      });
    });
  }

  ngOnDestroy() {
    if(this.currentSub != null) {
      this.currentSub.unsubscribe();
    }
  }

  onDownloadLiquidation() {
    const table = this.printableLiquidation.getTable();
    const workBook:WorkBook = utils.table_to_book(table);

    writeFile(workBook, `contract-${this.currentContract.id}-liquidation.xlsx`);
  }

  reloadContractTickets() {
    

    this.fns.httpsCallable('contracts-updateTickets')({
      company: this.currentCompany,
      contractId: this.id,
      isPurchase: this.type == "purchase"
    }).toPromise().then(async result => {
      const contract = await Contract.getDocById(this.db, this.currentCompany, this.type == "purchase", this.id);
      const tickets = await contract.getTickets();
      this.ticketList = tickets;
      
      const ticketsToAdd = tickets.filter(t => !this.ticketDiscountList.some(d => d.data.id == t.id));
      this.ticketDiscountList.push(...ticketsToAdd.map(ticket => 
      {
        return {
          data: ticket,
          discounts: {infested: 0, inspection:0}
        }
      }));
    }).catch(error => {
      this.snackBar.open(error, "Dismiss", {duration: 5000});
    });
  }
}
