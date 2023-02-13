import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CollectionReference, Firestore, OrderByDirection, QueryDocumentSnapshot } from '@angular/fire/firestore';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { NavController } from '@ionic/angular';
import { Contract } from '@shared/classes/contract';
import { ColumnInfo, DisplayOptions, TableConfigurableComponent } from '../table-configurable/table-configurable.component';

export const contractColumns = [
  "clientName",
  "currentDelivered",
  "date",
  "delivery_dates",
  "grade",
  "id",
  "loads",
  "pricePerBushel",
  "product",
  "quantity",
  "status",
  "transport"
];

export type contractColumn = typeof contractColumns[number];

// export declare type contractColumn = (
//   "clientName" | 
//   "currentDelivered" | 
//   "date" | 
//   "delivery_dates" | 
//   "grade" | 
//   "id" | 
//   "loads" | 
//   "pricePerBushel" | 
//   "product" | 
//   "quantity" | 
//   "status" | 
//   "transport"
// );

@Component({
  selector: 'app-table-contracts',
  templateUrl: './table-contracts.component.html',
  styleUrls: ['./table-contracts.component.scss'],
})
export class TableContractsComponent implements OnInit {
  @Input() collRef!: CollectionReference<Contract>;

  @Input() columns!: (contractColumn | ContractInfo)[];
  public displayColumns: ContractInfo[] = [];
  public templateRefs: Map<contractColumn, TemplateRef<any>> = new Map<contractColumn, TemplateRef<any>>();

  @Input() snapshot?: boolean = false;
  @Input() steps?: number;
  @Input() displayOptions?: DisplayOptions = { tableType: "", fixed: false };

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

  @ViewChild('configTable') public table: TableConfigurableComponent;

  public sortDirection: OrderByDirection;
  public sortFieldName: string;

  public defaultWidth: Map<contractColumn, string> = new Map<contractColumn, string>(
    // [
    //   ["clientName", ""],
    //   ["currentDelivered", "1fr"],
    //   ["date", "1fr"],
    //   ["delivery_dates", "1fr"],
    //   ["grade", ""],
    //   ["id", ""],
    //   ["loads", ""],
    //   ["pricePerBushel", ""],
    //   ["product", "1fr"],
    //   ["quantity", "1fr"],
    //   ["status", "1fr"],
    //   ["transport", ""],
    // ]
  );

  public defaultMinWidth: Map<contractColumn, string> = new Map<contractColumn, string>(
    // [
    //   ["clientName", ""],
    //   ["currentDelivered", ""],
    //   ["date", ""],
    //   ["delivery_dates", ""],
    //   ["grade", ""],
    //   ["id", ""],
    //   ["loads", ""],
    //   ["pricePerBushel", ""],
    //   ["product", ""],
    //   ["quantity", ""],
    //   ["status", ""],
    //   ["transport", ""],
    // ]
  );

  public defaultMaxWidth: Map<contractColumn, string> = new Map<contractColumn, string>(
    // [
    //   ["clientName", ""],
    //   ["currentDelivered", ""],
    //   ["date", ""],
    //   ["delivery_dates", ""],
    //   ["grade", ""],
    //   ["id", "50px"],
    //   ["loads", ""],
    //   ["pricePerBushel", ""],
    //   ["product", ""],
    //   ["quantity", ""],
    //   ["status", ""],
    //   ["transport", ""],
    // ]
  );

  constructor(
    private db: Firestore,
    private navController: NavController,
    private session: SessionInfo,
    private snack: SnackbarService,
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
    
    // limit(null) = error, limit(0) = no data displayed
    // --> limit(undefined) = no limit
    this.steps ||= undefined;
    this.displayColumns = this.formatColumns();

    contractColumns.forEach((column: contractColumn) => {
      this.templateRefs.set(column, null);
      this.defaultWidth.set(column, "1fr");
      this.defaultMinWidth.set(column, "80px");
      this.defaultMaxWidth.set(column, "250px");
    });
  }

  ngAfterViewInit() {
    this.handleSort(this.displayColumns.find(col => col.fieldName === 'date')?.fieldName);

    contractColumns.forEach((column: contractColumn) => {
      this.templateRefs.set(column, this[column]);
    });
  }

  public formatColumns(): ContractInfo[] {
    return this.columns.map(col => typeof col === 'string' ? { fieldName: col } : col);
  }

  public openContract(contract: Contract): void {
    const contractType = contract.ref.parent.id.replace("Contracts", '');
    this.navController.navigateForward(
      `dashboard/contracts/contract-info/${contractType}/${contract.ref.id}`
    );
  }

  public handleSort(fieldName: string): void {
    [this.sortFieldName, this.sortDirection] = this.table.sort(this.sortFieldName, this.sortDirection, fieldName);
  }

  public openFilterMenu(fieldName: string, event: Event): void {
    this.table.openFilterMenu(fieldName, event);
  }
}

export interface ContractInfo extends ColumnInfo {
  fieldName: contractColumn
}
