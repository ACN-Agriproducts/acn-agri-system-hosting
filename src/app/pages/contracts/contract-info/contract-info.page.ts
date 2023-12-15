import { Component, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Contract } from "@shared/classes/contract";
import { Ticket } from '@shared/classes/ticket';

import { Firestore, Unsubscribe, doc, orderBy } from '@angular/fire/firestore';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Liquidation } from '@shared/classes/liquidation';
import { Payment } from '@shared/classes/payment';
import { MatDialog } from '@angular/material/dialog';
import { SetPaymentDialogComponent } from './components/set-payment-dialog/set-payment-dialog.component';
import { lastValueFrom } from 'rxjs';
import { ContractDialogComponent } from 'src/app/modules/contract-printables/contract-dialog/contract-dialog.component';
import { TranslocoService } from '@ngneat/transloco';

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
  public contractUnsub: Unsubscribe;
  public unsubs: Unsubscribe[] = [];
  public permissions: any;
  public contractChartData: any;
  public totalPaidLiquidations: number = 0;
  public totalPendingLiquidations: number = 0;
  public totalPaidPayments: number = 0;
  public totalPendingPayments: number = 0;

  constructor(
    private route: ActivatedRoute,
    private db: Firestore,
    private snack: SnackbarService,
    private session: SessionInfo,
    private dialog: MatDialog,
    private transloco: TranslocoService
    ) { }

  ngOnInit() {
    this.type = this.route.snapshot.paramMap.get('type');
    this.id = this.route.snapshot.paramMap.get('id');
    this.currentCompany = this.session.getCompany();
    this.permissions = this.session.getPermissions();

    // Contract.getDocById(this.db, this.currentCompany, this.id).then(async contract => {
    //   this.currentContract = contract;
    //   this.ticketList = await contract.getTickets();

    //   this.unsubs.push(contract.getLiquidationsSnapshot(result => {
    //     this.liquidations = result.docs.map(qds => {
    //       const liquidation = qds.data();
    //       liquidation.getTotal(contract);
    //       return liquidation;
    //     });
    //   }, orderBy('date', 'asc')));

    //   this.unsubs.push(contract.getPaymentsSnapshot(result => {
    //     this.payments = result.docs.map(qds => qds.data());
    //   }, orderBy('date', 'asc')));

    //   this.ready = true;
    // });

    this.unsubs.push(Contract.getSnapshotById(this.db, this.currentCompany, this.id, async doc => {
      this.currentContract = doc.data();
      this.ticketList = await this.currentContract.getTickets();
      
      this.contractChartData = {
        toBeDelivered: (this.currentContract.quantity.getMassInUnit("bu") - this.currentContract.currentDelivered.getMassInUnit("bu")) * this.currentContract.pricePerBushel, 
        totalLiquidations: this.currentContract.totalLiquidations, 
        totalPayments: this.currentContract.totalPayments,
        totalPaidLiquidations: 0,
        totalPendingLiquidations: 0,
        totalPaidPayments: 0,
        totalPendingPayments: 0,
      };

      this.unsubs.push(this.currentContract.getLiquidationsSnapshot(result => {
        this.liquidations = result.docs.map(qds => {
          const liquidation = qds.data();
          liquidation.getTotal(this.currentContract);
          return liquidation;
        });

        const totalPaidLiquidations = this.liquidations.filter(l => l.status === "paid").reduce((prev, curr) => prev + curr.total, 0);
        const totalPendingLiquidations = this.liquidations.filter(l => l.status === "pending").reduce((prev, curr) => prev + curr.total, 0);

        this.contractChartData = { ...this.contractChartData, totalPaidLiquidations, totalPendingLiquidations };
      }, orderBy('date', 'asc')));
  
      this.unsubs.push(this.currentContract.getPaymentsSnapshot(result => {
        this.payments = result.docs.map(qds => qds.data());

        const totalPaidPayments = this.payments.filter(p => p.status === "paid").reduce((prev, curr) => prev + curr.amount, 0);
        const totalPendingPayments = this.payments.filter(p => p.status === "pending").reduce((prev, curr) => prev + curr.amount, 0);

        this.contractChartData = { ...this.contractChartData, totalPaidPayments, totalPendingPayments };
      }, orderBy('date', 'asc')));

      this.ready = true;
    }));
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
  }

  openContract() {
    this.dialog.open(ContractDialogComponent, {
      data: this.currentContract,
      panelClass: "borderless-dialog",
      minWidth: "80%",
      maxWidth: "100%",
      height: "75vh"
    });
  }
  
}
