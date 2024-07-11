import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs';
import { Plant } from '@shared/classes/plant';
import { doc, DocumentReference, Firestore } from '@angular/fire/firestore';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Contract } from '@shared/classes/contract';
import { Product } from '@shared/classes/product';
export interface Item {
  createdAt: Date;
  employees: DocumentReference[];
  name: string;
  owner: string;
}
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  public permissions: any;
  public currentCompany: string;

  public contractType: string = '';
  public contractTypeList: Map<string, string>;

  public contract: Contract;
  
  public products$: Observable<Product[]>;

  constructor(
    private session: SessionInfo,
    private db: Firestore
  ) {
  }

  ngOnInit() {
    this.permissions = this.session.getPermissions();
    this.currentCompany = this.session.getCompany();

    this.contract = new Contract(
      doc(Contract.getCollectionReference(this.db, this.currentCompany))
    );

    this.products$ = Product.getCollectionSnapshot(this.db, this.currentCompany);
  }

  focusEventHandler(fieldName: string) {
    console.log(fieldName);
  }
}
