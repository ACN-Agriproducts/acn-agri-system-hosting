import { Component, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { ProductionOrder } from '@shared/classes/production-order';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-production-orders',
  templateUrl: './production-orders.page.html',
  styleUrls: ['./production-orders.page.scss'],
})
export class ProductionOrdersPage implements OnInit {
  orderList$: Observable<ProductionOrder[]>;

  constructor(
    private db: Firestore,
    private session: SessionInfo,
  ) { }

  ngOnInit() {
    this.orderList$ = ProductionOrder.getListObservable(this.db, this.session.getCompany());
  }

}
