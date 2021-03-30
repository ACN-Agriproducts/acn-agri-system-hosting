import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, DocumentReference } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
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
  private itemDoc: AngularFirestoreDocument<Item>;
  private itemsCollection: AngularFirestoreCollection<Item>;
  items: Observable<Item[]>;
  items2: Observable<any>;
  constructor(private afs: AngularFirestore) {

  }

  ngOnInit() {}

}
