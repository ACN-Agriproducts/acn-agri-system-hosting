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
  public ticketList: Ticket[];
  public contract: Contract;
  public discountTables: DiscountTables;
  public type: string;
  public id: string;

  constructor(
    private db: Firestore,
    private session: SessionInfo,
    private route: ActivatedRoute,
  ) {
    this.type = this.route.snapshot.paramMap.get('type');
    this.id = this.route.snapshot.paramMap.get('id');
    console.log(this.type, this.id)
  }

  ngOnInit() {
    // this.ticketList = Ticket.getTickets(this.db, this.session.getCompany(), this.session.getPlant())
    // this.contract = Contract.getDoc(this.db, this.session.getCompany(), )
  }

}
