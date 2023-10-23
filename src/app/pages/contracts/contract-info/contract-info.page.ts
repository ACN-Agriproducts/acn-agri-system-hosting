import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Contract } from "@shared/classes/contract";
import { Ticket } from '@shared/classes/ticket';

import { Firestore, Unsubscribe, onSnapshot, orderBy } from '@angular/fire/firestore';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Liquidation } from '@shared/classes/liquidation';
import { Payment } from '@shared/classes/payment';

@Component({
  selector: 'app-contract-info',
  templateUrl: './contract-info.page.html',
  styleUrls: ['./contract-info.page.scss'],
})
export class ContractInfoPage implements OnInit, OnDestroy {
  public currentCompany: string;
  public currentContract: Contract;
  public id: string;
  public ready: boolean = false;
  public ticketList: Ticket[];
  public type: string;
  public liquidations: Liquidation[];
  public payments: Payment[];
  public unsubs: Unsubscribe[];
  public permissions: any;
  
  constructor(
    private route: ActivatedRoute,
    private db: Firestore,
    private snack: SnackbarService,
    private session: SessionInfo,
    ) { }

  ngOnInit() {
    this.type = this.route.snapshot.paramMap.get('type');
    this.id = this.route.snapshot.paramMap.get('id');
    this.currentCompany = this.session.getCompany();
    this.permissions = this.session.getPermissions();

    Contract.getDocById(this.db, this.currentCompany, this.type == 'purchase', this.id).then(async contract => {
      this.currentContract = contract;
      this.ticketList = await contract.getTickets();
      
      this.unsubs = [
        contract.getLiquidationsSnapshot(result => {
          this.liquidations = result.docs.map(qds => qds.data());
        }, orderBy('date', 'asc')),
        Payment.getPaymentsSnapshot(this.db, this.currentCompany, result => {
          this.payments = result.docs.map(qds => qds.data());
        }, orderBy('date', 'asc'))
      ];
      
      this.ready = true;
    });
  }

  ngOnDestroy() {
    this.unsubs.forEach(unsub => unsub());
  }
}
