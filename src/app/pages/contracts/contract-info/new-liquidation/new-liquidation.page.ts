import { Component, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Contract } from '@shared/classes/contract';
import { DiscountTables } from '@shared/classes/discount-tables';
import { Ticket } from '@shared/classes/ticket';

@Component({
  selector: 'app-new-liquidation',
  templateUrl: './new-liquidation.page.html',
  styleUrls: ['./new-liquidation.page.scss'],
})
export class NewLiquidationPage implements OnInit {
  public contract: Contract;
  public discountTables: DiscountTables;
  public id: string;
  public ticketList: Ticket[];
  public type: string;
  public ready: boolean = false;

  constructor(
    private db: Firestore,
    private session: SessionInfo,
    private route: ActivatedRoute,
  ) {
    this.type = this.route.snapshot.paramMap.get('type');
    this.id = this.route.snapshot.paramMap.get('id');
  }

  ngOnInit() {
    Contract.getDocById(this.db, this.session.getCompany(), this.type, this.id).then(async contract => {
      this.contract = contract;
      this.ticketList = await contract.getTickets();
      this.discountTables = await DiscountTables.getDiscountTables(this.db, this.session.getCompany(), contract.product.id);
      this.ready = true;
    });
  }

}
