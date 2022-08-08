import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, CollectionReference } from '@angular/fire/compat/firestore';
import { NavigationExtras } from '@angular/router';
import { ModalController, NavController, PopoverController } from '@ionic/angular';
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
  public warehouseReceiptCollectionRef: AngularFirestoreCollection;

  constructor(
    private localStorage: Storage,
    private db: AngularFirestore,
    private navController: NavController
  ) { }

  ngOnInit() {
    this.localStorage.get('currentCompany')
    .then(company => {
      this.currentCompany = company;
      return this.localStorage.get('currentPlant');
    })
    .then(plant => {
      this.currentPlant = plant;
      return WarehouseReceiptGroup.getWarehouseReceiptGroupList(this.db, this.currentCompany);
    })
    .then(result => {
      this.warehouseReceiptGroupList = result;
      this.warehouseReceiptCollectionRef = this.db.collection(result[0].getCollectionReference());
    });
  }

  public nav = (route: string): void => {    
    this.navController.navigateForward(route);
  }

}
