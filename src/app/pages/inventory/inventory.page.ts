import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.page.html',
  styleUrls: ['./inventory.page.scss'],
})
export class InventoryPage implements OnInit {

  currentCompany: string;
  currentPlantName: string;
  currentPlantId: number = 0;
  plantList: any[];
  productList: any[];

  constructor(
    private fb: AngularFirestore,
    private store: Storage
  ) { 
    this.store.get('currentCompany').then(val => {
      this.currentCompany = val;
      this.fb.collection(`companies/${this.currentCompany}/plants`).valueChanges({ idField: 'name' }).subscribe(val => {
        this.plantList = val;
        this.currentPlantName = val[0].name;
        console.log(this.plantList);
      })
      this.fb.collection(`companies/${this.currentCompany}/products`).valueChanges({ idField: 'name' }).subscribe(val => {
        this.productList = val;
      })
    })
  }

  ngOnInit() {
  }

}
