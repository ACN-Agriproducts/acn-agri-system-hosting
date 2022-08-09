import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
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

  constructor(
    private localStorage: Storage,
    private navController: NavController,
    private db: AngularFirestore,
  ) { }

  ngOnInit() {
    this.localStorage.get('currentCompany')
    .then(company => {
      this.currentCompany = company;
      return this.localStorage.get('currentPlant');
    })
    .then(plant => {
      this.currentPlant = plant;
      return WarehouseReceiptGroup.getWrGroupListValueChanges(this.db, this.currentCompany);
    })
    .then(result => {
      result.subscribe(list => {
        this.warehouseReceiptGroupList = list.sort((a, b) => a.creationDate.getTime() - b.creationDate.getTime());
      });
    });
  }

  public nav = (route: string): void => {    
    this.navController.navigateForward(route);
  }

}
