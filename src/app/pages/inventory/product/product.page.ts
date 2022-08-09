import { Component, OnInit } from '@angular/core';
import { DocumentSnapshot, Firestore } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { Storage } from '@ionic/storage';
import { Product } from '@shared/classes/product';

@Component({
  selector: 'app-product',
  templateUrl: './product.page.html',
  styleUrls: ['./product.page.scss'],
})
export class ProductPage implements OnInit {
  public product:string;
  public currentCompany:string;
  public ready:boolean = false;
  public doc: Product;

  constructor(
    private route: ActivatedRoute,
    private db: Firestore,
    private storage: Storage
  ) { 
    this.product = route.snapshot.paramMap.get('product');
  }

  ngOnInit() {
    this.storage.get("currentCompany").then(company => {
      this.currentCompany = company;

      Product.getProduct(this.db, this.currentCompany, this.product).then(val => {
        this.doc = val;
        this.ready = true;
      })
    })
  }

}
