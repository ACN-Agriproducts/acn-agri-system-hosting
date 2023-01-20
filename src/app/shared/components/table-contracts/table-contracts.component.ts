import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CollectionReference, Firestore, getDocs, limit, orderBy, Query, query, QueryConstraint, startAfter } from '@angular/fire/firestore';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { IonInfiniteScroll, NavController } from '@ionic/angular';
import { getCountFromServer, OrderByDirection, QuerySnapshot } from 'firebase/firestore';
import { Contract } from '@shared/classes/contract';
import { MatSelectChange } from '@angular/material/select';
import { TableComponent } from '../table/table.component';

declare type TableType = "" | "infiniteScroll" | "pagination";

export declare type contractColumns = (
  "clientName" | 
  "currentDelivered" | 
  "date" | 
  "delivery_dates" | 
  "grade" | 
  "id" | 
  "loads" | 
  "pricePerBushel" | 
  "product" | 
  "quantity" | 
  "status" | 
  "transport"
);

@Component({
  selector: 'app-table-contracts',
  templateUrl: './table-contracts.component.html',
  styleUrls: ['./table-contracts.component.scss'],
})
export class TableContractsComponent implements OnInit {
  @Input() collRef!: CollectionReference<Contract>;
  // private query: CollectionReference<Contract> | Query<Contract>;

  @Input() columns!: (contractColumns | ColumnInfo)[];
  public displayColumns: ColumnInfo[] = [];

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

  @ViewChild(TableComponent) table: TableComponent;
  
  // public contractCount: number = 0;
  // public contracts: Promise<QuerySnapshot<Contract>>[];
  // public ready: boolean = false;
  
  // public queryConstraints: QueryConstraint[];
  // public sortConstraints: QueryConstraint[];
  public sortDirection: OrderByDirection;
  public sortFieldName: string;

  public defaultWidth: Map<contractColumns, string> = new Map<contractColumns, string>([
    ["clientName", ""],
    ["currentDelivered", "1fr"],
    ["date", "1fr"],
    ["delivery_dates", "1fr"],
    ["grade", ""],
    ["id", ""],
    ["loads", ""],
    ["pricePerBushel", ""],
    ["product", "1fr"],
    ["quantity", "1fr"],
    ["status", "1fr"],
    ["transport", ""],
  ]);

  public defaultMinWidth: Map<contractColumns, string> = new Map<contractColumns, string>([
    ["clientName", ""],
    ["currentDelivered", ""],
    ["date", ""],
    ["delivery_dates", ""],
    ["grade", ""],
    ["id", ""],
    ["loads", ""],
    ["pricePerBushel", ""],
    ["product", ""],
    ["quantity", ""],
    ["status", ""],
    ["transport", ""],
  ]);

  public defaultMaxWidth: Map<contractColumns, string> = new Map<contractColumns, string>([
    ["clientName", ""],
    ["currentDelivered", ""],
    ["date", ""],
    ["delivery_dates", ""],
    ["grade", ""],
    ["id", "50px"],
    ["loads", ""],
    ["pricePerBushel", ""],
    ["product", ""],
    ["quantity", ""],
    ["status", ""],
    ["transport", ""],
  ]);

  constructor(
    private db: Firestore,
    private session: SessionInfo,
    private snack: SnackbarService,
    private navController: NavController,
  ) { }

  ngOnInit() {    
    /* Testing */
    this.collRef = Contract.getCollectionReference(this.db, this.session.getCompany(), true);
    /* Testing */
    
    if (!this.collRef) {
      this.snack.open("Collection Reference is nullish", "error");
      return;
    }
    if (!(this.columns?.length ?? 0 > 0)) {
      this.snack.open("Columns are nullish or empty", "error");
      return;
    }
    
    // limit(undefined) = no limit, limit(null) = error
    this.steps = this.steps ?? undefined;
    this.displayColumns = this.formatColumns();

    // this.contracts = [];
    // this.sortConstraints = this.sort();
    // this.queryConstraints = [limit(this.steps)];

    // this.loadContracts()
    // .then(async () => {
    //   if (this.contracts == null) throw "Contracts are nullish";

    //   this.contractCount = (await getCountFromServer(this.collRef)).data().count;
    //   this.ready = true;
    // })
    // .catch(error => {
    //   this.ready = false;
    //   this.snack.open(error, "error");
    //   console.error(error);
    // });
  }

  ngAfterViewInit() {
    // initial sort
    this.handleSort(this.displayColumns.find(col => col.fieldName === 'date').fieldName);
  }

  public formatColumns(): ColumnInfo[] {
    return this.columns.map(col => typeof col === 'string' ? { fieldName: col } : col);
  }

  public openContract(contract: Contract): void {
    const contractType = contract.ref.parent.id.replace("Contracts", '');
    this.navController.navigateForward(
      `dashboard/contracts/contract-info/${contractType}/${contract.ref.id}`
    );
  }

  // public sort(column: ColumnInfo = this.displayColumns.find(col => col.fieldName === 'date')): QueryConstraint[] {
  //   if (!column) return [];
  //   this.contracts = [];
  //   this.queryConstraints = [limit(this.steps)];

  //   if (this.sortFieldName == column.fieldName) {
  //     this.sortDirection = (this.sortDirection == 'asc' ? 'desc' : 'asc');
  //   }
  //   else {
  //     this.sortDirection = 'desc';
  //     this.sortFieldName = column.fieldName;
  //   }
  //   return [orderBy(this.sortFieldName, this.sortDirection)];
  // }

  // public async loadContracts(): Promise<void> {
  //   this.query = query(
  //     this.collRef, 
  //     ...this.sortConstraints, 
  //     ...this.queryConstraints
  //   );

  //   const nextContracts = getDocs(this.query.withConverter(Contract.converter));
  //   this.contracts.push(nextContracts);
  // }

  // public async handleChange(event: number | MatSelectChange | Event): Promise<void> {
  //   // if (!event) {
  //   //   this.queryConstraints = await this.scrollQuery();
  //   //   this.loadContracts();
  //   // }
  //   if (typeof event === 'number' && this.contracts[event]) return;

  //   this.queryConstraints = event instanceof Event 
  //     ? await this.scrollQuery(event) 
  //     : await this.paginateQuery(event);

  //   if (!this.queryConstraints) return;
  //   this.loadContracts();
  // }

  // public async scrollQuery(event: any): Promise<QueryConstraint[]> {
  //   const constraints: QueryConstraint[] = [limit(this.steps)];
  //   const nextConstraint = await this.nextContractsQuery();

  //   // if (event) {
  //   //   event.target.complete();
  //   //   if (!nextConstraint) {
  //   //     event.target.disabled = true;
  //   //     return;
  //   //   }
  //   // }

  //   event.target.complete();
  //   if (!nextConstraint) {
  //     event.target.disabled = true;
  //     return;
  //   }
    
  //   constraints.unshift(nextConstraint);
  //   return constraints;
  // }

  // public async nextContractsQuery(): Promise<QueryConstraint> {
  //   const currentSnapshot = await this.contracts[this.contracts.length - 1];
  //   const lastDoc = currentSnapshot.docs[currentSnapshot.docs.length - 1];

  //   return lastDoc ? startAfter(lastDoc) : null;
  // }

  // public async paginateQuery(event: number | MatSelectChange): Promise<QueryConstraint[]> {
  //   const constraints: QueryConstraint[] = [];

  //   if (event instanceof MatSelectChange) {
  //     this.contracts = [];
  //     this.steps = event.value;
  //   }
  //   else if (typeof event === 'number' && !this.contracts[event]) {
  //     constraints.push(await this.nextContractsQuery());
  //   }

  //   constraints.push(limit(this.steps));
  //   return constraints;
  // }

  // public handleSort(column: ColumnInfo): void {
  //   this.sortConstraints = this.sort(column);
  //   this.loadContracts();
  // }

  public fieldTemplate = (column: ColumnInfo): TemplateRef<any> => this[column.fieldName];

  // NEW STUFF -------------------------------------------

  // handle the sort from this contract table (parent)
  // set sortFieldName and sortDirection
  // call sort method from configurable table (child)
  public handleSort(fieldName: string): void {
    if (this.sortFieldName == fieldName) {
      this.sortDirection = (this.sortDirection == 'asc' ? 'desc' : 'asc');
    }
    else {
      this.sortDirection = 'desc';
      this.sortFieldName = fieldName;
    }

    this.table.sort(fieldName, this.sortDirection);
  }
  
  // NEW STUFF -------------------------------------------

}

interface FormatOptions {
  defaultDateFormat: string;
  dateFormat: string;
  deliveryDatesFormat: string;
  defaultUnits: string;
  deliveredUnits: string;
  quantityUnits: string; 
}

export interface ColumnInfo {
  fieldName: contractColumns;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
}
