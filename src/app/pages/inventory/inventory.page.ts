import { Component, OnDestroy, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ModalController, NavController, PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { NewStorageModalComponent } from './components/new-storage-modal/new-storage-modal.component';
import { StoragePopoverComponent } from './components/storage-popover/storage-popover.component';
import { Plant } from '@shared/classes/plant';
import { Product } from '@shared/classes/product';
import { Firestore } from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { SessionInfo } from '@core/services/session-info/session-info.service';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.page.html',
  styleUrls: ['./inventory.page.scss'],
})
export class InventoryPage implements OnInit, OnDestroy{

  public currentCompany: string;
  public currentPlantName: string;
  public plantList: Plant[];
  public productList: Product[];
  public currentSubs: Subscription[] = [];
  public dataUser: any;
  public permissions: any;

  constructor(
    private db: Firestore,
    private navController: NavController,
    private modalController: ModalController,
    private popoverController: PopoverController,
    private fns: Functions,
    private session: SessionInfo
  ) {}

  ngOnInit() {
    this.dataUser = this.session.getUser();
    this.permissions = this.session.getPermissions();
    this.currentCompany = this.session.getCompany();
    this.currentPlantName = this.session.getPlant();

    var tempSub;
    tempSub = Plant.getCollectionSnapshot(this.db, this.currentCompany).subscribe(val => {
      this.plantList = val;
    })
    this.currentSubs.push(tempSub);

    tempSub = Product.getCollectionSnapshot(this.db, this.currentCompany).subscribe(val => {
      this.productList = val;
    })
    this.currentSubs.push(tempSub);
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
        plantRef: this.getCurrentPlant().ref,
        storageId: storageId,
        tankList: this.getCurrentPlant().inventory,
        productList: this.productList
      }
    });

    return popover.present();
  }

  public async newStorageModal(): Promise<any> {
    const modal = await this.modalController.create({
      component: NewStorageModalComponent,
      componentProps:{
        plantRef: Plant.getDocReference(this.db, this.currentCompany, this.currentPlantName),
        productList: this.productList,
      }
    });

    return await modal.present();
  }

  // public hasReadPermission = (): Boolean => {
  //   return this.permissions?.developer || this.permissions?.admin || this.permissions?.inventory?.warehouseReceiptRead;
  // }

  public getCurrentPlant(): Plant {
    return this.plantList.find(p => p.ref.id == this.currentPlantName);
  }

  public updateProductInv(): void {
    httpsCallable(this.fns, 'helperFunctions-calculateProductValues')({company: this.currentCompany});
  }

}
