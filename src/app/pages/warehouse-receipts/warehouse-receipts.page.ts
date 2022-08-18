import { Component, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { NavController } from '@ionic/angular';
import { WarehouseReceiptGroup } from '@shared/classes/WarehouseReceiptGroup';
import { onSnapshot } from 'firebase/firestore';

@Component({
  selector: 'app-warehouse-receipts',
  templateUrl: './warehouse-receipts.page.html',
  styleUrls: ['./warehouse-receipts.page.scss'],
})
export class WarehouseReceiptsPage implements OnInit {
  public currentCompany: string;
  public currentPlant: string;
  public warehouseReceiptGroupList: WarehouseReceiptGroup[] = [];

  constructor(
    private navController: NavController,
    private db: Firestore,
    private session: SessionInfo
  ) { }

  ngOnInit() {
    this.currentCompany = this.session.getCompany();
    this.currentPlant = this.session.getPlant();

    WarehouseReceiptGroup.getWrGroupListValueChanges(this.db, this.currentCompany)
    .subscribe(list => {
      this.warehouseReceiptGroupList = list;
    });

    
  }

  public nav = (route: string): void => {    
    this.navController.navigateForward(route);
  }
}
