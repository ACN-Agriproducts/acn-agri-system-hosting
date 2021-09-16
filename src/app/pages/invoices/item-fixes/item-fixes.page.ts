import { query } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore, DocumentSnapshot } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-item-fixes',
  templateUrl: './item-fixes.page.html',
  styleUrls: ['./item-fixes.page.scss'],
})
export class ItemFixesPage implements OnInit {
  public firestoreId: string;
  public invoiceId: number = 0;
  public invoiceDoc: DocumentSnapshot<any>;
  public invoiceData: any;
  public productList: any[];
  public plantsList: any[];

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

      this.db.doc<any>(`companies/${this.currentCompany}/invoices/${this.firestoreId}`).get().subscribe(document => {
        this.invoiceDoc = document;
        this.invoiceData = document.data();
        this.invoiceId = this.invoiceData.id;
      });

      this.db.collection<any>(`companies/${this.currentCompany}/products`).get().subscribe(query => {
        this.productList = query.docs;
      });

      this.db.collection<any>(`companies/${this.currentCompany}/plants`).get().subscribe(query => {
        this.plantsList = query.docs;
      })
    })
  }

}
