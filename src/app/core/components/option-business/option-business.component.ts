import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-option-business',
  templateUrl: './option-business.component.html',
  styleUrls: ['./option-business.component.scss']
})
export class OptionBusinessComponent implements OnInit, OnDestroy {
  companyList: any;
  private currentSub: Subscription

  constructor(
    private store: Storage,
    private navController: NavController,
    private db: AngularFirestore,
    ) { }

  ngOnInit(): void {
    this.store.get('user').then(val => {
      this.companyList = val.worksAt
    })
  }

  ngOnDestroy(): void {
    if(this.currentSub != null) {
      this.currentSub.unsubscribe();
    }
  }

  public changeCompany(company) {
    this.store.set('currentCompany', company);
    this.store.get('user').then(user => {
      this.currentSub = this.db.doc(`users/${user.uid}/companies/${company}`).valueChanges().subscribe(compDoc => {
        user.currentPermissions = compDoc['permissions']

        this.store.set('user', user);
        location.reload();
      })
    })
  }

  

}
