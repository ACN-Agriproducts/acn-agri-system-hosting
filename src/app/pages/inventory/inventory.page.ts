import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Storage } from '@ionic/storage';
import { ModalController, NavController, PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { NewStorageModalComponent } from './components/new-storage-modal/new-storage-modal.component';
import { StoragePopoverComponent } from './components/storage-popover/storage-popover.component';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.page.html',
  styleUrls: ['./inventory.page.scss'],
})
export class InventoryPage implements OnInit, OnDestroy{

  public currentCompany: string;
  public currentPlantName: string;
  public currentPlantId: number = 0;
  public plantList: any[];
  public productList: any[];
  public currentSubs: Subscription[] = [];
  public dataUser: any;
  public permissions: any;

  constructor(
    private fb: AngularFirestore,
    private store: Storage,
    private navController: NavController,
    private modalController: ModalController,
    private popoverController: PopoverController,
    private localStorage: Storage
  ) { 
    this.store.get('currentCompany').then(async val => {
      this.currentCompany = val;
      this.currentPlantName = await this.store.get("currentPlant");

      var tempSub;
      tempSub = this.fb.collection(`companies/${this.currentCompany}/plants`).valueChanges({ idField: 'name' }).subscribe(val => {
        this.plantList = val;
      })
      this.currentSubs.push(tempSub);

      tempSub = this.fb.collection(`companies/${this.currentCompany}/products`).valueChanges({ idField: 'name' }).subscribe(val => {
        this.productList = val;
      })
      this.currentSubs.push(tempSub);
    })
  }

  ngOnInit() {
    this.localStorage.get('user').then(data => {
      this.dataUser = data;
      this.permissions = data.currentPermissions;
    });
  }

  ngOnDestroy() {
    for(const sub of this.currentSubs) {
      sub.unsubscribe();
    }
  }

  public nav(path:string): void {
    this.navController.navigateForward(path);
  }

  public async inventoryMenu(ev: any, storageId: number): Promise<void> {
    const popover = await this.popoverController.create({
      component: StoragePopoverComponent,
      event: ev,
      componentProps: {
        plantRef: this.fb.doc(`companies/${this.currentCompany}/plants/${this.currentPlantName}`).ref,
        storageId: storageId,
        tankList: this.plantList.find(p => p.name == this.currentPlantName).inventory,
        productList: this.productList
      }
    });

    return popover.present();
  }

  public async newStorageModal(): Promise<any> {
    const modal = await this.modalController.create({
      component: NewStorageModalComponent,
      componentProps:{
        plantRef: this.fb.doc(`companies/${this.currentCompany}/plants/${this.currentPlantName}`).ref,
        productList: this.productList,
      }
    });

    return await modal.present();
  }

  // public hasReadPermission = (): Boolean => {
  //   return this.permissions?.developer || this.permissions?.admin || this.permissions?.inventory?.warehouseReceiptRead;
  // }

}
