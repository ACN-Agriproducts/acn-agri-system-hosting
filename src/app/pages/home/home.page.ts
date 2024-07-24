import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs';
import { Plant } from '@shared/classes/plant';
import { doc, DocumentReference, Firestore } from '@angular/fire/firestore';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Contract } from '@shared/classes/contract';
import { Product } from '@shared/classes/product';
import { DashboardData } from '@shared/classes/dashboard-data';
import { Functions, httpsCallable } from '@angular/fire/functions';
export interface Item {
  createdAt: Date;
  employees: DocumentReference[];
  name: string;
  owner: string;
}
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  public permissions: any;
  public currentCompany: string;

  public contractType: string = '';
  public contractTypeList: Map<string, string>;

  public contract: Contract;
  
  public products$: Observable<Product[]>;
  public selectedProduct: Product | "all";
  public dashboardData: DashboardData;

  constructor(
    private session: SessionInfo,
    private db: Firestore,
    private functions: Functions
  ) {
  }

  ngOnInit() {
    this.permissions = this.session.getPermissions();
    this.currentCompany = this.session.getCompany();

    this.contract = new Contract(
      doc(Contract.getCollectionReference(this.db, this.currentCompany))
    );

    this.products$ = Product.getCollectionSnapshot(this.db, this.currentCompany);

    DashboardData.getLatestDashboardMetrics(this.db, this.currentCompany).then(data => {
      this.dashboardData = data;
    });
  }

  focusEventHandler(fieldName: string) {
    console.log(fieldName);
  }

  test() {
    console.log(this.selectedProduct)
  }

  createDashboardManually() {
    this.dashboardData = new DashboardData(doc(DashboardData.getCollectionRef(this.db, this.currentCompany)));
    console.log("Created Dashboard Data:", this.dashboardData);
  }

  setDashboardManually() {
    this.dashboardData.set();
    console.log("Set Dashboard Data:", this.dashboardData);
  }

  testDashboardUpdate() {
    httpsCallable(this.functions, 'schedules-dashboardMetricsUpdateLocal')("UPDATE DASHBOARD WITH NEW DOCUMENT");
  }
}
