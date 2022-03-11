import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, DocumentReference } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Subscription } from 'rxjs';
import { ContractLiquidationLongComponent } from './components/contract-liquidation-long/contract-liquidation-long.component';
import { TicketsTableComponent } from './components/tickets-table/tickets-table.component';
import { Contract } from "@shared/classes/contract";
import { Ticket } from '@shared/classes/ticket';

@Component({
  selector: 'app-contract-info',
  templateUrl: './contract-info.page.html',
  styleUrls: ['./contract-info.page.scss'],
})
export class ContractInfoPage implements OnInit, OnDestroy {

  public id: string;
  public type: string;
  public currentCompany: string;
  public currentContract: Contract;
  public ready:boolean = false;
  public ticketList: Ticket[];
  public ticketDiscountList: {data: Ticket, discounts: any}[];
  public ticketsReady: boolean = false;
  public contractRef: AngularFirestoreDocument;
  public showLiquidation: boolean = false;
  private currentSub: Subscription;

  @ViewChild(ContractLiquidationLongComponent) printableLiquidation: ContractLiquidationLongComponent;
  
  constructor(
    private route: ActivatedRoute,
    private localStorage: Storage,
    private db: AngularFirestore,
    ) { }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    this.type = this.route.snapshot.paramMap.get('type')
    this.localStorage.get('currentCompany').then(val => {
      this.currentCompany = val;
      Contract.getDocById(this.db, this.currentCompany, this.type == "purchase", this.id).then(contract => {
        this.currentContract = contract;
        this.ready = true;
        this.currentContract.getTickets().then(tickets => {
          this.ticketList = tickets;
          const list:{data: Ticket, discounts: any}[] = [];

          this.ticketList.forEach(t => {
            list.push({data: t, discounts: {}});
          })
          this.ticketDiscountList = list;
        });
      });
    });
  }

  ngOnDestroy() {
    if(this.currentSub != null) {
      this.currentSub.unsubscribe();
    }
  }
}
