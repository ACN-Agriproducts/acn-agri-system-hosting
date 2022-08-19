import { Component, OnInit } from '@angular/core';
import { Firestore, orderBy, query } from '@angular/fire/firestore';
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

  constructor(
    private navController: NavController,
    private db: Firestore,
    private session: SessionInfo
  ) { }

  ngOnInit() {

    this.currentCompany = this.session.getCompany();
    this.currentPlant = this.session.getPlant();

    WarehouseReceiptGroup.getGroupList(this.db, this.currentCompany, orderBy('creationDate', 'desc')).then(val => {
      this.warehouseReceiptGroupList = val;
    });

    // use onSnapshot as well to listen for changes to the group as as whole
    // WarehouseReceiptGroup.onSnapshot(
    //   wrGroupQuery, 
    //   this.warehouseReceiptGroupList
    // );
  }

  public nav = (route: string): void => {    
    this.navController.navigateForward(route);
  }
}
