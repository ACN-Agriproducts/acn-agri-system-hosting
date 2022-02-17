import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Subscription } from 'rxjs';
import { ContractLiquidationLongComponent } from './components/contract-liquidation-long/contract-liquidation-long.component';
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
  public ticketList: any[];
  public ticketsReady: boolean = false;
  private currentSub: Subscription;

  @ViewChild(TicketsTableComponent) ticketTable: TicketsTableComponent;
  @ViewChild(ContractLiquidationLongComponent) printableLiquidation: ContractLiquidationLongComponent;
  
  constructor(
    private route: ActivatedRoute,
    private localStorage: Storage,
    private db: AngularFirestore,
    private modalController: ModalController
    ) { }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    this.type = this.route.snapshot.paramMap.get('type')
    this.localStorage.get('currentCompany').then(val => {
      this.currentCompany = val;
      this.currentSub = this.db.doc(`companies/${val}/${this.type}Contracts/${this.id}`).valueChanges().subscribe(val => {
        this.currentContract = val;
        this.currentContract.contractType = this.type + "Contracts";
        this.ready = true;
        this.ticketList = [];

        let ticketCounter = 0;
        this.currentContract.tickets.forEach(ticketRef => {
          const temp = ticketRef as DocumentReference
          temp.get().then(ticket => {
            ticketCounter++;

            if(!ticket.data().void){
              this.ticketList.push(ticket);
            }

            if(ticketCounter == this.currentContract.tickets.length) {
              this.ticketTable.renderComponent(this.ticketList);
              this.ticketsReady = true;
            }
          });
        });
      });
    });
  }

  ngOnDestroy() {
    if(this.currentSub != null) {
      this.currentSub.unsubscribe();
    }
  }

  async presentLiquidation(): Promise<void> {
    const modal = await this.modalController.create({
      component: ContractLiquidationLongComponent,
      componentProps: {
        ticketList: this.ticketList,
        contract: this.currentContract
      }
    });

    return await modal.present();
  }
}
