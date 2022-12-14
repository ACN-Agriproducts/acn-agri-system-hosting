import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CollectionReference, Firestore, orderBy, Query, query, QueryConstraint } from '@angular/fire/firestore';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { NavController } from '@ionic/angular';

/* Testing */
import { Contract } from '@shared/classes/contract';
import { getDocs } from 'firebase/firestore';
/* Testing */

declare type TableType = "" | "infiniteScroll" | "pagination";

@Component({
  selector: 'app-table-contracts',
  templateUrl: './table-contracts.component.html',
  styleUrls: ['./table-contracts.component.scss'],
})
export class TableContractsComponent implements OnInit {
  @Input() collRef!: CollectionReference;
  @Input() columns!: string[];

  @Input() displayFormat?: TableType = "";
  @Input() snapshot?: boolean = false;

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
  public contracts: Contract[] = [];
  public currentCompany: string;
  public constraints: QueryConstraint[] = [];

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
      this.snack.open("Collection Reference not found", "error");
      return;
    }
    if (this.columns == null || !(this.columns.length > 0)) {
      this.snack.open("Columns not found", "error");
      return;
    }

    this.constraints = [orderBy('date')];
    this.getContracts().then(() => {
      this.ready = true;
    })
    .catch(error => {
      this.snack.open(error, "error");
      this.ready = false;
    });
  }

  public fieldTemplate = (field: string): TemplateRef<any> => this[field];

  public queryFn(event: any): void {
    console.log("change query\n", event)

  }

  public openContract(contract: Contract): void {
    const contractType = contract.ref.parent.id; // salesContracts | purchaseContracts
    this.navController.navigateForward(`dashboard/contracts/contract-info/${contractType.slice(0, -9)}/${contract.ref.id}`);
  }

  public async getContracts(): Promise<void> {
    if (this.collRef == null) {
      this.snack.open("Collection reference not found", "error");
      return;
    }

    const contractsQuery = query(this.collRef, ...this.constraints) as Query<Contract>;
    this.contracts = (await getDocs(contractsQuery)).docs.map(snap => snap.data());
  }
}
