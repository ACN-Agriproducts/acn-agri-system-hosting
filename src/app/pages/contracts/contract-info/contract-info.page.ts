import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';
import { Storage } from '@ionic/storage';
import { Subscription } from 'rxjs';
import { TicketsTableComponent } from './components/tickets-table/tickets-table.component';

@Component({
  selector: 'app-contract-info',
  templateUrl: './contract-info.page.html',
  styleUrls: ['./contract-info.page.scss'],
})
export class ContractInfoPage implements OnInit, OnDestroy {

  public id: string;
  public type: string;
  public currentCompany: string;
  public currentContract: any;
  public ready:boolean = false;
  private currentSub: Subscription;
  
  constructor(
    private route: ActivatedRoute,
    private localStorage: Storage,
    private db: AngularFirestore
    ) { }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    this.type = this.route.snapshot.paramMap.get('type')
    this.localStorage.get('currentCompany').then(val => {
      this.currentCompany = val;
      this.currentSub = this.db.doc(`companies/${val}/${this.type}Contracts/${this.id}`).valueChanges().subscribe(val => {
        this.currentContract = val;
        this.ready = true;
      })
    })
  }

  ngOnDestroy() {
    if(this.currentSub != null) {
      this.currentSub.unsubscribe();
    }
  }

}
