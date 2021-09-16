import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Storage } from '@ionic/storage';
import { NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';

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
    private navController: NavController
  ) { 
    this.store.get('currentCompany').then(val => {
      this.currentCompany = val;
      var tempSub;
      tempSub = this.fb.collection(`companies/${this.currentCompany}/plants`).valueChanges({ idField: 'name' }).subscribe(val => {
        this.plantList = val;
        this.currentPlantName = val[0].name;
        console.log(this.plantList);
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

}
