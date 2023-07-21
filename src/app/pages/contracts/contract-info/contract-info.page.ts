import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Contract } from "@shared/classes/contract";
import { Ticket } from '@shared/classes/ticket';

import { Firestore } from '@angular/fire/firestore';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { DiscountTables } from '@shared/classes/discount-tables';
import { Liquidation } from '@shared/classes/liquidation';

@Component({
  selector: 'app-contract-info',
  templateUrl: './contract-info.page.html',
  styleUrls: ['./contract-info.page.scss'],
})
export class ContractInfoPage implements OnInit, OnDestroy {
  public currentCompany: string;
  public currentContract: Contract;
  public discountTables: DiscountTables;
  public id: string;
  public ready: boolean = false;
  public showLiquidation: boolean = false;
  public ticketList: Ticket[];
  public type: string;
  public liquidations: Liquidation[];
  
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

    Contract.getDocById(this.db, this.currentCompany, this.type == 'purchase', this.id).then(async contract => {
      this.currentContract = contract;
      this.ticketList = await contract.getTickets();
      this.discountTables = await DiscountTables.getDiscountTables(this.db, this.currentCompany, contract.product.id);
      this.liquidations = await Liquidation.getContractLiquidations(this.db, this.currentCompany, contract.ref.id);
      
      this.ready = true;
    });
  }

  ngOnDestroy() { }
}
