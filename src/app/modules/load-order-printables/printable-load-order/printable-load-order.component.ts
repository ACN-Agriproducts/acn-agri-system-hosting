import { Component, Input, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { CompanyService } from '@core/services/company/company.service';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Company } from '@shared/classes/company';
import { LoadOrder } from '@shared/classes/load-orders.model';

@Component({
  selector: 'app-printable-load-order',
  templateUrl: './printable-load-order.component.html',
  styleUrls: ['./printable-load-order.component.scss'],
})
export class PrintableLoadOrderComponent implements OnInit {
  @Input() order: LoadOrder;

  public companyDoc$: Promise<Company>;
  public logoUrl: string;

  constructor(
    private db: Firestore,
    private session: SessionInfo
  ) { }

  ngOnInit() {
    this.companyDoc$ = this.session.getCompanyObject();
    this.companyDoc$.then(async doc => {
      console.log(doc)
      this.logoUrl = await doc.getLogoURL(this.db);
    });
  }

}
