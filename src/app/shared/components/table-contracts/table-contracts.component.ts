import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CollectionReference, Firestore, limit, orderBy, Query, query, QueryConstraint } from '@angular/fire/firestore';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { NavController } from '@ionic/angular';

/* Testing */
import { Contract } from '@shared/classes/contract';
import { getDocs, OrderByDirection, QuerySnapshot, startAfter } from 'firebase/firestore';
/* Testing */

declare type TableType = "" | "infiniteScroll" | "pagination";

@Component({
  selector: 'app-table-contracts',
  templateUrl: './table-contracts.component.html',
  styleUrls: ['./table-contracts.component.scss'],
})
export class TableContractsComponent implements OnInit {
  @Input() collRef!: CollectionReference<Contract>;
  private query: CollectionReference<Contract> | Query<Contract>;

  @Input() columns!: string[];

  @Input() displayFormat?: TableType = "";
  @Input() formatOptions?: FormatOptions;
  @Input() snapshot?: boolean = false;
  @Input() steps?: number;

  @ViewChild('clientName') clientName: TemplateRef<any>;
  @ViewChild('currentDelivered') currentDelivered: TemplateRef<any>;
  @ViewChild('date') date: TemplateRef<any>;
  @ViewChild('delivery_dates') delivery_dates: TemplateRef<any>;
  @ViewChild('grade') grade: TemplateRef<any>;
  @ViewChild('id') id: TemplateRef<any>;
  @ViewChild('loads') loads: TemplateRef<any>;
  @ViewChild('pricePerBushel') pricePerBushel: TemplateRef<any>;
  @ViewChild('product') product: TemplateRef<any>;
  @ViewChild('quantity') quantity: TemplateRef<any>;
  @ViewChild('status') status: TemplateRef<any>;
  @ViewChild('transport') transport: TemplateRef<any>;
  
  public ready: boolean = false;
  public contracts: Promise<QuerySnapshot<Contract>>[];
  public currentCompany: string;
  public sortConstraints: QueryConstraint[] = [];
  public queryConstraints: QueryConstraint[] = [];

  public sortFieldName: string;
  public sortDirection: OrderByDirection;

  constructor(
    private db: Firestore,
    private session: SessionInfo,
    private snack: SnackbarService,
    private navController: NavController,
  ) { }

  ngOnInit() {
    this.currentCompany = this.session.getCompany();
    
    /* Testing */

    this.collRef = Contract.getCollectionReference(this.db, this.currentCompany, true);

    /* Testing */

    if (this.collRef == null) {
      this.snack.open("Collection Reference is nullish", "error");
      return;
    }
    if (this.columns == null || !(this.columns.length > 0)) {
      this.snack.open("Columns are nullish or empty", "error");
      return;
    }

    this.sort('date').then(() => {
      if (this.contracts == null) throw "Contracts are nullish";
      this.ready = true;
    })
    .catch(error => {
      this.snack.open(error, "error");
      this.ready = false;
    });
  }

  public fieldTemplate = (field: string): TemplateRef<any> => this[field];

  public sort(fieldName: string): Promise<void> {
    if (this.sortFieldName == fieldName) {
      this.sortDirection = (this.sortDirection == "asc" ? "desc" : "asc");
    } 
    else {
      this.sortDirection = "desc";
      this.sortFieldName = fieldName;
    }

    this.sortConstraints = [orderBy(fieldName, this.sortDirection)];
    if (this.steps) this.sortConstraints.push(limit(this.steps));

    return this.getContracts();
  }

  public openContract(contract: Contract): void {
    const contractType = contract.ref.parent.id.slice(0, -9); // salesContracts | purchaseContracts -> sales | purchase
    this.navController.navigateForward(`dashboard/contracts/contract-info/${contractType}/${contract.ref.id}`);
  }

  public async getContracts(): Promise<void> {
    this.query = query(
      this.collRef, 
      ...this.queryConstraints, 
      ...this.sortConstraints
    );
    this.contracts = [getDocs(this.query.withConverter(Contract.converter))];
  }

  public async getPage(page: number): Promise<void> {
    if (page < 1) return;

    const previousQuerySnapshot = await this.contracts[page - 1];
    const lastSnapshot = previousQuerySnapshot.docs[previousQuerySnapshot.docs.length - 1];

    this.contracts.push(getDocs(query(this.query, startAfter(lastSnapshot))));
  }
}

interface FormatOptions {
  defaultDateFormat: string;
  dateFormat: string;
  deliveryDatesFormat: string;
  defaultUnits: string;
  deliveredUnits: string;
  quantityUnits: string; 
}