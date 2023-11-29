import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Contract } from "@shared/classes/contract";
import { Ticket } from '@shared/classes/ticket';

import { Firestore, Unsubscribe, doc, onSnapshot, orderBy, updateDoc } from '@angular/fire/firestore';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Liquidation } from '@shared/classes/liquidation';
import { Payment } from '@shared/classes/payment';
import { MatDialog } from '@angular/material/dialog';
import { SetPaymentDialogComponent } from './components/set-payment-dialog/set-payment-dialog.component';
import { lastValueFrom } from 'rxjs';

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
  public unsubs: Unsubscribe[] = [];
  public permissions: any;
  
  constructor(
    private route: ActivatedRoute,
    private db: Firestore,
    private snack: SnackbarService,
    private session: SessionInfo,
    private dialog: MatDialog,
    ) { }

  ngOnInit() {
    this.type = this.route.snapshot.paramMap.get('type');
    this.id = this.route.snapshot.paramMap.get('id');
    this.currentCompany = this.session.getCompany();
    this.permissions = this.session.getPermissions();

    Contract.getDocById(this.db, this.currentCompany, this.type == 'purchase', this.id).then(async contract => {
      this.currentContract = contract;
      this.ticketList = await contract.getTickets();

      this.unsubs.push(contract.getLiquidationsSnapshot(result => {
        this.liquidations = result.docs.map(qds => {
          const liquidation = qds.data();
          liquidation.getTotal(contract);
          return liquidation;
        });
      }, orderBy('date', 'asc')));

      this.unsubs.push(contract.getPaymentsSnapshot(result => {
        this.payments = result.docs.map(qds => qds.data());
      }, orderBy('date', 'asc')));
      
      this.ready = true;
    });
  }

  ngOnDestroy() {
    this.unsubs.forEach(unsub => unsub());
  }

  async addPayment() {
    const dialogRef = this.dialog.open(SetPaymentDialogComponent, {
      data: {
        payment: new Payment(doc(this.currentContract.getPaymentsCollection())),
        liquidations: this.liquidations,
        readonly: false
      },
      minWidth: "650px"
    });

    const result: Payment = await lastValueFrom(dialogRef.afterClosed());
    if (!result) return;
    
    result.set().then(() => {
      this.snack.open("Payment Set", "success");
    }).catch(e => {
      console.error(e);
      this.snack.open("Failed to Set Payment", "error");
    });

    // ALL LIQUIDATION.STATUS FROM "PENDING" ==> "PAID" WHEN PAYMENT.STATUS CHANGES FROM "PENDING" ==> "PAID"
  }
}
