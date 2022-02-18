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

  currentCompany: string;
  currentPlantName: string;
  currentPlantId: number = 0;
  plantList: any[];
  productList: any[];
  currentSubs: Subscription[] = [];

  constructor(
    private fb: AngularFirestore,
    private store: Storage,
    private navController: NavController,
    private modalController: ModalController,
    private popoverController: PopoverController
  ) { 
    this.store.get('currentCompany').then(val => {
      this.currentCompany = val;
      var tempSub;
      tempSub = this.fb.collection(`companies/${this.currentCompany}/plants`).valueChanges({ idField: 'name' }).subscribe(val => {
        this.plantList = val;
        this.currentPlantName = val[0].name;
      })
      this.currentSubs.push(tempSub);

      tempSub = this.fb.collection(`companies/${this.currentCompany}/products`).valueChanges({ idField: 'name' }).subscribe(val => {
        this.productList = val;
      })
      this.currentSubs.push(tempSub);
    })
  }

  ngOnInit() {
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

}
