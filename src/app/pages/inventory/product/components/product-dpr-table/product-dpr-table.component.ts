import { Component, OnInit, Input, OnDestroy, ViewChild } from '@angular/core';
import { DocumentData, DocumentSnapshot, QuerySnapshot } from '@angular/fire/firestore';
import { Storage as IonStorage } from '@ionic/storage';
import { Subscription } from 'rxjs';
import { MatDatepicker } from '@angular/material/datepicker';
import * as _moment from 'moment';
import { Plant } from '@shared/classes/plant';

import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import * as moment from 'moment';
import { MatTable } from '@angular/material/table';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { getDownloadURL, ref, Storage } from '@angular/fire/storage';

import * as Excel from 'exceljs';
import { FormControl } from '@angular/forms';
import { collection, Firestore, getDocs, query, where, limit } from '@angular/fire/firestore';
import { Product } from '@shared/classes/product';
import { SessionInfo } from '@core/services/session-info/session-info.service';

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

@Component({
  selector: 'app-product-dpr-table',
  templateUrl: './product-dpr-table.component.html',
  styleUrls: ['./product-dpr-table.component.scss'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ProductDprTableComponent implements OnInit, OnDestroy {
  @ViewChild(MatDatepicker) matDatePicker: MatDatepicker<_moment.Moment>;

  @Input() productDoc: Product;
  public dprDoc: DocumentData;
  @ViewChild(MatTable) tableView:MatTable<any>;
  
  public workbook: Excel.Workbook;
  private currentCompany: string;
  private currentPlant: string;
  private month: number;
  private year: number;
  public ready: boolean = false;
  public date: FormControl = new FormControl(moment())
  public columnsToDisplay: string[] = ["Day", "inQuantity", "outQuantity", "adjustment", "endOfDay"];
  public tableData: any[] = [];

  public expandedDay: any;

  public currentSub: Subscription;

  constructor(
    private db: Firestore,
    private storage: Storage,
    private session: SessionInfo
  ) {}

  ngOnInit(): void {
    this.year = moment().year();
    this.month = moment().month() + 1;

    this.date.value.month(this.month - 1);
    this.date.value.year(this.year);

    this.currentCompany = this.session.getCompany();
    this.currentPlant = this.session.getPlant();

    this.getDprDoc();
    getDownloadURL(ref(this.storage, `companies/${this.currentCompany}/DPR.xlsx`)).then(url => {
      let xhr = new XMLHttpRequest();
      xhr.responseType = 'arraybuffer';
      xhr.onload = async (event) => {
        this.workbook = new Excel.Workbook();
        await this.workbook.xlsx.load(xhr.response);
      }

      xhr.open('GET', url);
      xhr.send();
    });
  }

  ngOnDestroy() {
    if(this.currentSub != null) {
      this.currentSub.unsubscribe();
    }
  }

  private getDprDoc() {
    const date = this.date.value as _moment.Moment;

    getDocs(query(collection(Plant.getDocReference(this.db, this.currentCompany, this.currentPlant), 'inventory'),
      where("month", "==", date.month() + 1),
      where("year", "==", date.year()),
      where("product", "==", this.productDoc.ref.id),
      limit(1)
    )).then(dpr => {
        this.tableData = [];
        this.dprDoc = dpr.docs[0].data();

        const data = this.dprDoc.tickets as any;
        for(let day = 1; day <= 31; day++){
          let tempData = {
            id: day,
            inQuantity: 0,
            outQuantity: 0,
            adjustment: 0,
            inTickets: [],
            outTickets: [],
            invoices: [],
            endOfDay: 0
          }

          for (let prop in data[day]) {
            if (data[day][prop] != null) tempData[prop] = data[day][prop];
          }

          if(day > 1){
            const lastDay = this.tableData[this.tableData.length-1]
            tempData.endOfDay = lastDay.endOfDay + tempData.inQuantity - tempData.outQuantity + tempData.adjustment;
          } 
          else {
            tempData.endOfDay = this.dprDoc.startingInventory + tempData.inQuantity - tempData.outQuantity + tempData.adjustment;
          }

          this.tableData.push(tempData);
        }

        this.tableView.renderRows();
        this.ready = true;
      });
  }

  public chosenMonthHandler(normalizedMonthAndYear: _moment.Moment, datepicker: MatDatepicker<_moment.Moment>) {
    this.date.value.year(normalizedMonthAndYear.year())
    this.date.value.month(normalizedMonthAndYear.month());
    this.date = new FormControl(normalizedMonthAndYear);
    this.getDprDoc();

    datepicker.close();
  }

  public getDprDocs(): Promise<QuerySnapshot<DocumentData>> {
    const date = this.date.value as _moment.Moment;

    return getDocs(query(collection(Plant.getDocReference(this.db, this.currentCompany, this.currentPlant), 'inventory'),
      where("year", "==", date.year()),
      where("product", "==", this.productDoc.ref.id)));
  }
  
  public getExcelData(dpr: DocumentSnapshot<any>):
  [any, {
    summary: number[][],
    liability: number[][],
    openStorageLiability: number[][],
  }] {
    const tableData = [];
    const dprExcelData: {
      summary: number[][],
      liability: number[][],
      openStorageLiability: number[][],
    } = {
      summary: [],
      liability: [],
      openStorageLiability: [],
    }
    const dprDoc = dpr.data();

    const data = dprDoc.tickets as any;
    for(let day = 1; day <= 31; day++){
      let tempData = {
        id: day,
        inQuantity: 0,
        outQuantity: 0,
        adjustment: 0,
        inTickets: [],
        outTickets: [],
        invoices: [],
        endOfDay: 0
      }

      const tempSummary = [0, 0, 0]
      const tempLiability = [null, null];

      if(data[day] != null){
        if(data[day].inQuantity != null){
          tempData.inQuantity = data[day].inQuantity;
          tempSummary[0] += data[day].inQuantity;
        }

        if(data[day].outQuantity != null){
          tempData.outQuantity = data[day].outQuantity;
          tempSummary[1] += data[day].outQuantity;
        }

        if(data[day].adjustment != null){
          tempData.adjustment = data[day].adjustment;
          tempSummary[2] += data[day].adjustment;
        }

        if(data[day].inTickets != null){
          tempData.inTickets = data[day].inTickets;
        }

        if(data[day].outTickets != null){
          tempData.outTickets = data[day].outTickets;
        }

        if(data[day].invoices != null){
          tempData.invoices = data[day].invoices;
        }

        tempLiability[0] = data[day].issuedWarehouseReceipt ?? null;
        tempLiability[1] = data[day].cancelledWarehouseReceipt ?? null;
      }

      if(day > 1){
        const lastDay = tableData[tableData.length-1]
        tempData.endOfDay = lastDay.endOfDay + tempData.inQuantity - tempData.outQuantity + tempData.adjustment;
      } 
      else {
        tempData.endOfDay = dprDoc.startingInventory + tempData.inQuantity - tempData.outQuantity + tempData.adjustment;
      }

      tableData.push(tempData);
      dprExcelData.summary.push(tempSummary);
      dprExcelData.liability.push(tempLiability);
    }

    return [tableData, dprExcelData];
  }

  public async downloadDpr() {
    const productWeight = this.productDoc.weight;
    //const sheet = this.workbook.getWorksheet('Sheet1');

    const yearSnapshot = await this.getDprDocs();

    yearSnapshot.forEach(docSnap => {
      const [tableData, dprExcelData] = this.getExcelData(docSnap);

      const data = docSnap.data();
      const m: month = data.month - 1
      const monthName = month[m];
      const sheet = this.workbook.getWorksheet(monthName);
    
      sheet.getCell("J3").value = this.productDoc.ref.id;
      sheet.getCell("O3").value = monthName;
      sheet.getCell("Q3").value = this.year;
      sheet.getCell("E8").value = data.startingInventory / productWeight;
      sheet.getCell("I8").value = data.startingWarehouseReceipt / productWeight;
      sheet.getCell("L8").value = data.startingOpenStorage / productWeight;

      for(let row = 0; row < 31; row++) {
        // Do summary section
        sheet.getCell(`B${row+10}`).value = dprExcelData.summary[row][0] / productWeight;
        sheet.getCell(`C${row+10}`).value = dprExcelData.summary[row][1] / productWeight;
        sheet.getCell(`D${row+10}`).value = dprExcelData.summary[row][2] / productWeight;

        sheet.getCell(`G${row+10}`).value = dprExcelData.liability[row][0] / productWeight;
        sheet.getCell(`H${row+10}`).value = dprExcelData.liability[row][1] / productWeight;
      }
    });

    this.workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.setAttribute("style", "display: none");
      a.href = url;
      a.download = `DPR-${this.year}-${this.productDoc.ref.id}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    })
  }
}

enum month {
  JANUARY,
  FEBRUARY,
  MARCH,
  APRIL,
  MAY,
  JUNE,
  JULY,
  AUGUST,
  SEPTEMBER,
  OCTOBER,
  NOVEMBER,
  DECEMBER
}
