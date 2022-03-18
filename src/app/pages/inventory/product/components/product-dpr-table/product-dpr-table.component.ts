import { Component, OnInit, Input, OnDestroy, ViewChild } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, CollectionReference, DocumentData, DocumentSnapshot } from '@angular/fire/compat/firestore';
import { Storage } from '@ionic/storage';
import { Subscription } from 'rxjs';
import { MatDatepicker } from '@angular/material/datepicker';
import * as _moment from 'moment';

import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import * as moment from 'moment';
import { MatTable } from '@angular/material/table';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { AngularFireStorage } from '@angular/fire/compat/storage';

import * as Excel from 'exceljs';

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

  @Input() productDoc: DocumentSnapshot<any>;
  public dprDoc: DocumentData;
  private plantCollectionRef: AngularFirestoreCollection;
  @ViewChild(MatTable) tableView:MatTable<any>;
  
  private workbook: Excel.Workbook;
  private currentCompany: string;
  private month: number;
  private year: number;
  public ready: boolean = false;
  public date: _moment.Moment = moment();
  public columnsToDisplay: string[] = ["Day", "inQuantity", "outQuantity", "adjustment", "endOfDay"];
  public tableData: any[] = [];
  public dprExcelData: {
    summary: number[][],
    liability: number[][],
    openStorageLiability: number[][],
  } = {
    summary: [],
    liability: [],
    openStorageLiability: [],
  }

  public expandedDay: any;

  public currentSub: Subscription;

  constructor(
    private db: AngularFirestore,
    private localStorage: Storage,
    private storage: AngularFireStorage
  ) {
    this.year = moment().year();
    this.month = moment().month() + 1;

    this.date.month(this.month - 1);
    this.date.year(this.year);

    this.localStorage.get("currentCompany").then(company => {
      this.currentCompany = company;
      this.plantCollectionRef = this.db.collection(`companies/${this.currentCompany}/plants`);

      const plantListSub = this.plantCollectionRef.get().subscribe(plantsList => {
        this.currentSub = this.plantCollectionRef.doc(plantsList.docs[0].ref.id).collection("inventory", ref => 
          ref.where("month", "==", this.month)
            .where("year", "==", this.year)
            .where("product", "==", this.productDoc.ref.id)
        ).valueChanges().subscribe(dpr => {
          this.tableData = [];
          this.dprDoc = dpr[0];

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

            const tempSummary = [0, 0, 0]

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
            }

            if(day > 1){
              const lastDay = this.tableData[this.tableData.length-1]
              tempData.endOfDay = lastDay.endOfDay + tempData.inQuantity - tempData.outQuantity + tempData.adjustment;
            } 
            else {
              tempData.endOfDay = this.dprDoc.startingInventory + tempData.inQuantity - tempData.outQuantity + tempData.adjustment;
            }

            this.tableData.push(tempData);
            this.dprExcelData.summary.push(tempSummary);
          }

          this.tableView.renderRows();
          this.ready = true;
        });

        plantListSub.unsubscribe();
      });

      this.storage.ref(`companies/${company}/DPR.xlsx`).getDownloadURL().toPromise().then(url => {
        let xhr = new XMLHttpRequest();
        xhr.responseType = 'arraybuffer';
        xhr.onload = async (event) => {
          this.workbook = new Excel.Workbook();
          await this.workbook.xlsx.load(xhr.response);
        }

        xhr.open('GET', url);
        xhr.send();
      });

    });

  }

  ngOnInit() {
  }

  ngOnDestroy() {
    if(this.currentSub != null) {
      this.currentSub.unsubscribe();
    }
  }

  public chosenYearHandler(normalizedYear: _moment.Moment) {
    this.year = normalizedYear.year();
    this.date.year(this.year);
  }

  public chosenMonthHandler(normalizedMonth: _moment.Moment, datepicker: MatDatepicker<_moment.Moment>) {
    this.month = normalizedMonth.month() + 1;
    this.date.month(normalizedMonth.month());
    datepicker.close();
  }

  public downloadDpr() {
    const productWeight = this.productDoc.data().weight;
    const sheet = this.workbook.getWorksheet('Sheet1');
    sheet.getCell("J3").value = this.productDoc.ref.id;
    sheet.getCell("O3").value = month[this.date.month()];
    sheet.getCell("Q3").value = this.year;
    sheet.getCell("E8").value = this.dprDoc.startingInventory / productWeight;
    sheet.getCell("I8").value = this.dprDoc.startingWarehouseReceipt / productWeight;
    sheet.getCell("L8").value = this.dprDoc.startingOpenStorage / productWeight;

    for(let row = 0; row < 31; row++) {
      // Do summary section
      sheet.getCell(`B${row+10}`).value = this.dprExcelData.summary[row][0] / productWeight;
      sheet.getCell(`C${row+10}`).value = this.dprExcelData.summary[row][1] / productWeight;
      sheet.getCell(`D${row+10}`).value = this.dprExcelData.summary[row][2] / productWeight;
    }

    this.workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.setAttribute("style", "display: none");
      a.href = url;
      a.download = `DPR-${this.year}-${month[this.date.month()]}.xlsx`;
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
