import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Contract } from "@shared/classes/contract";
import { Ticket } from '@shared/classes/ticket';

import { Firestore, Unsubscribe, doc, onSnapshot, orderBy } from '@angular/fire/firestore';
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

  readonly testData = [
    {
      type: "prepay",
      amount: 500,
      liquidation: [23].toString(),
      proofOfPaymentDocs: []
    },
    {
      type: "prepay",
      amount: 500,
      liquidation: [23].toString(),
      proofOfPaymentDocs: []
    },
    {
      type: "prepay",
      amount: 500,
      liquidation: [23].toString(),
      proofOfPaymentDocs: []
    },
    {
      type: "prepay",
      amount: 500,
      liquidation: [23].toString(),
      proofOfPaymentDocs: []
    },
    {
      type: "prepay",
      amount: 500,
      liquidation: [23].toString(),
      proofOfPaymentDocs: []
    },
    {
      type: "prepay",
      amount: 500,
      liquidation: [23].toString(),
      proofOfPaymentDocs: []
    },
  ];
  
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
    const newPayment = new Payment(doc(this.currentContract.getPaymentsCollection()));

    const dialogRef = this.dialog.open(SetPaymentDialogComponent, {
      data: {
        payment: newPayment,
        liquidations: this.liquidations.filter(l => l.status === "pending")
        // .map(l => ({
        //   ref: l.ref,
        //   total: l.total,
        //   date: l.date
        // }))
        ,
        // contract: this.currentContract
      },
      minWidth: "550px"
    });

    const result = await lastValueFrom(dialogRef.afterClosed());
    if (!result) return;

    
    newPayment.set().then(() => {
      console.log(newPayment)
      this.snack.open("Payment Set", "success");
    }).catch(e => {
      console.error(e);
      this.snack.open("Failed to Set Payment", "error");
    });
  }
}
