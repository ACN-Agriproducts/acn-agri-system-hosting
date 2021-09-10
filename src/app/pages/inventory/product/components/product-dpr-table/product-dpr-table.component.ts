import { Component, OnInit, Input, OnDestroy, ViewChild } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, CollectionReference, DocumentData, DocumentSnapshot } from '@angular/fire/firestore';
import { Storage } from '@ionic/storage';
import { Subscription } from 'rxjs';
import { MatDatepicker } from '@angular/material/datepicker';
import * as _moment from 'moment';

import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import * as moment from 'moment';
import { MatTable } from '@angular/material/table';
import {animate, state, style, transition, trigger} from '@angular/animations';

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
  
  private currentCompany: string;
  private month: number;
  private year: number;
  public ready: boolean = false;
  public date: _moment.Moment = moment();
  public columnsToDisplay: string[] = ["Day", "inQuantity", "outQuantity", "adjustment", "endOfDay"];
  public tableData: any[] = [];

  public expandedDay: any;

  public currentSub: Subscription;

  constructor(
    private db: AngularFirestore,
    private localStorage: Storage
  ) {
    this.year = moment().year();
    this.month = moment().month() + 1;

    this.date.month(this.month);
    this.date.year(this.year);

    console.log(this.month, this.year)

    this.localStorage.get("currentCompany").then(company => {
      this.currentCompany = company;
      this.plantCollectionRef = this.db.collection(`companies/${this.currentCompany}/plants`);

      const plantListSub = this.plantCollectionRef.get().subscribe(plantsList => {
        console.log(this.productDoc);
        this.currentSub = this.plantCollectionRef.doc(plantsList.docs[0].ref.id).collection("inventory", ref => 
          ref.where("month", "==", this.month)
            .where("year", "==", this.year)
            .where("product", "==", this.productDoc.ref.id)
        ).valueChanges().subscribe(dpr => {
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

            if(data[day] != null){
              if(data[day].inQuantity != null){
                tempData.inQuantity = data[day].inQuantity;
              }

              if(data[day].outQuantity != null){
                tempData.outQuantity = data[day].outQuantity;
              }

              if(data[day].adjustment != null){
                tempData.adjustment = data[day].adjustment;
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
              tempData.endOfDay = this.dprDoc.startingInventory;
            }

            this.tableData.push(tempData);
          }

          this.tableView.renderRows();
        });

        plantListSub.unsubscribe();
      })
    })
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
    console.log(normalizedMonth);
    this.month = normalizedMonth.month() + 1;
    this.date.month(this.month);
    datepicker.close();
  }

}
