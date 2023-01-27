import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CollectionReference, Firestore } from '@angular/fire/firestore';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { NavController } from '@ionic/angular';
import { OrderByDirection, QueryDocumentSnapshot } from 'firebase/firestore';
import { Contract } from '@shared/classes/contract';
import { TableConfigurableComponent } from '../table-configurable/table-configurable.component';

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

  @Input() columns!: (contractColumns | ColumnInfo)[];
  public displayColumns: ColumnInfo[] = [];

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
    
    // limit(undefined) = no limit, limit(null) = error
    this.steps = this.steps ?? undefined;
    this.displayColumns = this.formatColumns();
  }

  ngAfterViewInit() {
    // initial sort
    this.handleSort(this.displayColumns.find(col => col.fieldName === 'date')?.fieldName);
  }

  public formatColumns(): ColumnInfo[] {
    return this.columns.map(col => typeof col === 'string' ? { fieldName: col } : col);
  }

  public openContract(contract: QueryDocumentSnapshot<Contract>): void {
    const contractType = contract.ref.parent.id.replace("Contracts", '');
    this.navController.navigateForward(
      `dashboard/contracts/contract-info/${contractType}/${contract.ref.id}`
    );
  }

  public fieldTemplate = (column: ColumnInfo): TemplateRef<any> => this[column.fieldName];

  public handleSort(fieldName: string): void {
    [this.sortFieldName, this.sortDirection] = this.table.sort(this.sortFieldName, this.sortDirection, fieldName);
  }

  public openFilterMenu(fieldName: string, event: Event): void {
    this.table.openFilterMenu(fieldName, event);
  }
}

export interface DisplayOptions {
  tableType: TableType;
  fixed: boolean;
  defaultDateFormat?: string;
  dateFormat?: string;
  deliveryDatesFormat?: string;
}

export interface ColumnInfo {
  fieldName: contractColumns;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
}
