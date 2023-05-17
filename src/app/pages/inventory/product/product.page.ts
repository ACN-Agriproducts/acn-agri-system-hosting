import { Component, OnInit } from '@angular/core';
import { Firestore, collection, doc, getDoc, getDocs } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { DiscountTables } from '@shared/classes/discount-tables';
import { Product } from '@shared/classes/product';

@Component({
  selector: 'app-product',
  templateUrl: './product.page.html',
  styleUrls: ['./product.page.scss'],
})
export class ProductPage implements OnInit {
  public product: string;
  public currentCompany: string;
  public ready: boolean = false;
  public doc: Product;

  constructor(
    private route: ActivatedRoute,
    private db: Firestore,
    private session: SessionInfo
  ) { 
    this.product = route.snapshot.paramMap.get('product');
  }

  ngOnInit() {
    this.currentCompany = this.session.getCompany();

    Product.getProduct(this.db, this.currentCompany, this.product)
    .then(productData => {
      this.doc = productData;
      this.ready = true;

      return DiscountTables.getDiscountTables(this.db, this.currentCompany, this.product);
    })
    .then(discountTables => {
      console.log(discountTables);
    });
  }
}
