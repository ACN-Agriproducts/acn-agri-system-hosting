import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-option-business',
  templateUrl: './option-business.component.html',
  styleUrls: ['./option-business.component.scss']
})
export class OptionBusinessComponent implements OnInit {
  companyList: any;

  constructor(
    private store: Storage,
    private navController: NavController,
    private db: AngularFirestore
    ) { }

  ngOnInit(): void {
    this.store.get('user').then(val => {
      this.companyList = val.worksAt
    })
  }

  public changeCompany(company) {
    this.store.set('currentCompany', company);
    this.store.get('user').then(user => {
      this.db.doc(`users/${user.uid}/companies/${company}`).valueChanges().subscribe(compDoc => {
        user.currentPermissions = compDoc['permissions']

        this.store.set('user', user);
        location.reload();
      })
    })
  }

}
