import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product',
  templateUrl: './product.page.html',
  styleUrls: ['./product.page.scss'],
})
export class ProductPage implements OnInit {
  public product:string;

  constructor(
    private route: ActivatedRoute,
    private db: AngularFirestore
  ) { 
    this.product = route.snapshot.paramMap.get('product');
  }

  ngOnInit() {
  }

}
