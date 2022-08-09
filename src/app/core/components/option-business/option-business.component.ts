import { Component, OnInit } from '@angular/core';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';
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
    private db: Firestore,
    ) { }

  ngOnInit(): void {
    this.store.get('user').then(val => {
      this.companyList = val.worksAt
    })
  }

  public changeCompany(company) {
    this.store.set('currentCompany', company);
    this.store.get('user').then(user => {
      getDoc(doc(this.db, `users/${user.uid}/companies/${company}`)).then(compDoc => {
        user.currentPermissions = compDoc.get('permissions');

        this.store.set('user', user);
        location.reload();
      })
    })
  }

  

}
