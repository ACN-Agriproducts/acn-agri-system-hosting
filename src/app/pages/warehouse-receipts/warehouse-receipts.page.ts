import { Component, OnInit } from '@angular/core';
import { Firestore, orderBy, where } from '@angular/fire/firestore';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { NavController } from '@ionic/angular';
import { Pagination } from '@shared/classes/FirebaseDocInterface';
import { WarehouseReceiptGroup } from '@shared/classes/WarehouseReceiptGroup';

@Component({
  selector: 'app-warehouse-receipts',
  templateUrl: './warehouse-receipts.page.html',
  styleUrls: ['./warehouse-receipts.page.scss'],
})
export class WarehouseReceiptsPage implements OnInit {
  public currentCompany: string;
  public currentPlant: string;
  public warehouseReceiptGroupList: WarehouseReceiptGroup[] = [];
  public paginator: Pagination<WarehouseReceiptGroup>;
  public statusFilter: string[] = ["PENDING", "ACTIVE", "CLOSED", "CANCELLED"];

  constructor(
    private navController: NavController,
    private db: Firestore,
    private session: SessionInfo
  ) { }

  ngOnInit() {
    this.currentCompany = this.session.getCompany();
    this.currentPlant = this.session.getPlant();
    this.getWarehouseReceipts();
  }

  public getWarehouseReceipts = (): void => {
    WarehouseReceiptGroup.getGroupList(
      this.db, 
      this.currentCompany, 
      where("status", "in", this.statusFilter), 
      orderBy('createdAt', 'desc')
    )
    .then(val => {
      this.warehouseReceiptGroupList = val;
    });
  }

  public nav = (route: string): void => {
    this.navController.navigateForward(route, {
      replaceUrl: true
    });
  }

  public statusFilterChange = (event: any): void => {
    this.statusFilter = event.detail.value.split(',');
    this.getWarehouseReceipts();
  }

  ngOndestroy() {
  }
}
