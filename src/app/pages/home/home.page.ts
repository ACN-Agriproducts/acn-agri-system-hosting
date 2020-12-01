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

  ngOnInit() {
    this.itemsCollection = this.afs.collection<Item>('companies');
    this.items = this.itemsCollection.valueChanges();
    console.log(this.itemsCollection);
    this.items.subscribe(res => {
      res.map(data => {
        console.log(data.employees);
        data.employees.map((dataRef) => {
          const userDoc = this.afs.doc<any>(dataRef.path);
          // userDoc.collection<any>('users').valueChanges();
          console.log(userDoc);
          
          userDoc.valueChanges().subscribe(datos => {
            console.log(datos);
          });
        })
        // this.items2.subscribe(response => {
        //   console.log(response);
        // })


        // userDoc.collection<any>('employees').valueChanges();


        // user.subscribe(resRef => {
        // const user = userDoc.valueChanges();


        // })
      });
    });


  }

}
