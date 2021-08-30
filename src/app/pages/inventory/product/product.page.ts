import { Component, OnInit } from '@angular/core';
import { AngularFirestore, DocumentSnapshot } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-product',
  templateUrl: './product.page.html',
  styleUrls: ['./product.page.scss'],
})
export class ProductPage implements OnInit {
  public product:string;
  public currentCompany:string;
  public ready:boolean = false;
  public doc: DocumentSnapshot<any>;

  constructor(
    private route: ActivatedRoute,
    private db: AngularFirestore,
    private storage: Storage
  ) { 
    this.product = route.snapshot.paramMap.get('product');
  }

  ngOnInit() {
    this.storage.get("currentCompany").then(company => {
      this.currentCompany = company;

      this.db.doc<any>(`companies/${company}/products/${this.product}`).get().subscribe(val => {
        this.doc = val;
        this.ready = true;
      })
    })
  }

}
