import { query } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore, DocumentSnapshot } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';
import { Storage } from '@ionic/storage';
import { Invoice, inventoryInfo } from '@shared/classes/invoice';
import { Plant } from '@shared/classes/plant';
import { Product } from '@shared/classes/product'


@Component({
  selector: 'app-item-fixes',
  templateUrl: './item-fixes.page.html',
  styleUrls: ['./item-fixes.page.scss'],
})
export class ItemFixesPage implements OnInit {
  public firestoreId: string;
  public invoice: Invoice;
  public productList: Product[];
  public plantsList: Plant[];

  private currentCompany: string = "";
  public ready: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private db: AngularFirestore,
    private localStorage: Storage
  ) {
    this.firestoreId = route.snapshot.paramMap.get('id');
  }

  ngOnInit() {
    this.localStorage.get("currentCompany").then(val => {
      this.currentCompany = val;

      Invoice.getDocById(this.db, this.currentCompany, this.firestoreId).then(invoice => {
        this.invoice = invoice;
      });

      Product.getProductList(this.db, this.currentCompany).then(result => {
        this.productList = result;
      })
      

      Plant.getPlantList(this.db, this.currentCompany).then(result => {
        this.plantsList = result;
      });
    });
  }

  deleteInfo(item: inventoryInfo[], index: number) {
    item.splice(index, 1);
  }

  getPlantInv(plantName: string) {
    const plant = this.plantsList.find(p => p.ref.id == plantName);
    
    if(plant) {
      return plant.inventory;
    }

    return [];
  }

  addInvButton(info: inventoryInfo[]) {
    info.push(new inventoryInfo({}));
  }

  formValid(): boolean {
    for(const item of this.invoice.items) {
      if(!item.affectsInventory) {
        continue;
      }

      if(item.inventoryInfo.length == 0) {
        return false;
      }

      for(const info of item.inventoryInfo) {
        if(info.plant == null || info.product == null || info.quantity == null || info.tank == null) {
          return false;
        }
      }
    }

    return true;
  }

  submit() {
    this.invoice.needsAttention = false;
    this.invoice.set();
  }
}
