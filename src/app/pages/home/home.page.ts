import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { doc, DocumentReference, Firestore } from '@angular/fire/firestore';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Contract } from '@shared/classes/contract';
import { ProductMetrics } from '@shared/classes/dashboard-data';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { CompanyService } from '@core/services/company/company.service';
import { DashboardService, ProductChartData } from '@core/services/dashboard/dashboard.service';
import { MatDatepicker } from '@angular/material/datepicker';

import * as moment from 'moment';
import { Moment } from 'moment';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { Mass, units } from '@shared/classes/mass';

export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

export interface Item {
  createdAt: Date;
  employees: DocumentReference[];
  name: string;
  owner: string;
}
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ]
})
export class HomePage implements OnInit {
  public permissions: any;
  public currentCompany: string;

  public contractType: string = '';
  public contractTypeList: Map<string, string>;

  public contract: Contract;
  
  public products: string[];
  public selectedProduct: string;

  public productMetricsMap: ProductMetrics;
  public startDate: Date = new Date();
  public endDate: Date;
  public productChartData: ProductChartData;
  public colorScheme: any = {
    domain: ["#437b40"]
  }

  constructor(
    private session: SessionInfo,
    private db: Firestore,
    private functions: Functions,
    private company: CompanyService,
    private dashboard: DashboardService
  ) {
  }

  ngOnInit() {
    this.permissions = this.session.getPermissions();
    this.currentCompany = this.session.getCompany();
    this.contract = new Contract(doc(Contract.getCollectionReference(this.db, this.currentCompany)));
    this.products = this.company.getProductsNamesList();

    this.selectedProduct = this.products[this.products.length - 1];

    this.setDashboardDataObject();
  }

  focusEventHandler(fieldName: string) {
    console.log(fieldName);
  }

  // testDashboardUpdate() {
  //   httpsCallable(this.functions, 'schedules-dashboardMetricsUpdateLocal')("UPDATE DASHBOARD WITH NEW DOCUMENT");
  // }

  setMonthAndYear(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>, setStart?: boolean): void {
    const ctrlValue = moment();
    ctrlValue.month(normalizedMonthAndYear.month());
    ctrlValue.year(normalizedMonthAndYear.year());

    if (setStart) this.startDate = ctrlValue.toDate();
    else this.endDate = ctrlValue.toDate();

    datepicker.close();
    this.setDashboardDataObject();
  }

  async setDashboardDataObject() {
    const dashboardProductData = await this.dashboard.getDashboardData(this.startDate, this.endDate);
    this.productMetricsMap = dashboardProductData.productMetrics;
    this.productChartData = dashboardProductData.productChartData;
  }
}

@Pipe({ name: 'unitName' })
export class UnitNamePipe implements PipeTransform {
  transform(unit: units): string {
    return Mass.getUnitFullName(unit);
  }
}
