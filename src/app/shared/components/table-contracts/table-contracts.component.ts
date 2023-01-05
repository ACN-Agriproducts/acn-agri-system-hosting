import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CollectionReference, Firestore, getDocs, limit, orderBy, Query, query, QueryConstraint, startAfter } from '@angular/fire/firestore';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { NavController } from '@ionic/angular';
import { OrderByDirection, QuerySnapshot } from 'firebase/firestore';
import { Contract } from '@shared/classes/contract';
import { PageEvent } from '@angular/material/paginator';

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
  private query: CollectionReference<Contract> | Query<Contract>;

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
  
  public ready: boolean = false;
  public contracts: Promise<QuerySnapshot<Contract>>[] = [];
  public currentCompany: string;
  public sortConstraints: QueryConstraint[] = [];
  public queryConstraints: QueryConstraint[] = [];
  public contractCount: number = 0;

  public sortFieldName: string;
  public sortDirection: OrderByDirection;

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

    this.columns.forEach(col => {
      if (typeof col === 'string') {
        this.displayColumns.push({ fieldName: col });
        return;
      }
      this.displayColumns.push(col);
    });

    this.changeSort();
    this.changeQuery();
    this.loadContracts()
    .then(() => {
      if (this.contracts == null) throw "Contracts are nullish";
      this.ready = true;
    })
    .catch(error => {
      this.ready = false;
      this.snack.open(error, "error");
      console.error(error);
    });

    // this.sort(this.displayColumns.find(col => col.fieldName === 'date')).then(() => {
    //   if (this.contracts == null) throw "Contracts are nullish";
    //   this.ready = true;
    // })
    // .catch(error => {
    //   this.snack.open(error, "error");
    //   console.error(error);
    //   this.ready = false;
    // });
  }

  public fieldTemplate = (column: ColumnInfo): TemplateRef<any> => this[column.fieldName];

  public sort(column: ColumnInfo): Promise<void> {
    if (!column) {
      this.sortConstraints = [limit(this.steps)];
      return this.getContracts();
    }

    if (this.sortFieldName == column.fieldName) {
      this.sortDirection = (this.sortDirection == "asc" ? "desc" : "asc");
    }
    else {
      this.sortDirection = "desc";
      this.sortFieldName = column.fieldName;
    }

    this.sortConstraints = [orderBy(column.fieldName, this.sortDirection), limit(this.steps)];
    return this.getContracts();
  }

  public openContract(contract: Contract): void {
    const contractType = contract.ref.parent.id.slice(0, -9);
    // salesContracts | purchaseContracts -> sales | purchase
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

  public async getPage1(page: number | PageEvent): Promise<void> {
    console.log(page)
    
    const pageNumber = (typeof page === 'number') ? page : page.pageIndex;
    if (pageNumber < 1) return;

    console.log(this.contracts)
    const previousQuerySnapshot = await this.contracts[pageNumber - 1];
    const lastSnapshot = previousQuerySnapshot.docs[previousQuerySnapshot.docs.length - 1];

    this.contracts.push(getDocs(query(this.query, startAfter(lastSnapshot))));
  }











  public changeSort(column: ColumnInfo = this.displayColumns.find(col => col.fieldName === 'date')) {
    if (!column) {
      return;
    }

    if (this.sortFieldName == column.fieldName) {
      this.sortDirection = (this.sortDirection == 'asc' ? 'desc' : 'asc');
    }
    else {
      this.sortDirection = 'desc';
      this.sortFieldName = column.fieldName;
    }

    this.sortConstraints = [orderBy(column.fieldName, this.sortDirection)];
  }

  public changeQuery(event?: PageEvent | Event) {
    if (!event) {
      this.queryConstraints = [limit(this.steps)];
      return;
    }

    console.log(this.contracts);

    if (this.displayFormat === 'pagination') {
      this.queryConstraints = [limit((event as PageEvent).pageSize)];
    }
  }

  public async loadContracts(): Promise<void> {
    this.query = query(
      this.collRef, 
      ...this.sortConstraints, 
      ...this.queryConstraints
    );

    if (this.displayFormat === 'pagination') {
      this.contracts = [getDocs(this.query.withConverter(Contract.converter))];
    }
    else if (this.displayFormat === 'infiniteScroll') {
      this.contracts.push(getDocs(this.query.withConverter(Contract.converter)));
    }
  }

  public handleSort(column: ColumnInfo) {
    console.log("handle sort", column);
    this.changeSort(column);
    this.loadContracts();
  }

  public handlePage(event: PageEvent | Event) {
    console.log("handle page", event);
    this.changeQuery(event);
    this.loadContracts();
  }

  public async infiniteDocs(event: any) {
    console.log("infinite docs", event);

    // this.dataList.getNext(snapshot => {
    //   event.target.complete();
    //   this.infiniteScroll.disabled = snapshot.docs.length < this.contractStep;
    // });
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

export interface ColumnInfo {
  fieldName: contractColumns;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
}

