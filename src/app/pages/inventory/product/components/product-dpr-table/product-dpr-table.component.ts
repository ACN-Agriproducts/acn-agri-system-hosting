import { Component, OnInit, Input, OnDestroy, ViewChild } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, CollectionReference, DocumentData, DocumentSnapshot } from '@angular/fire/firestore';
import { Storage } from '@ionic/storage';
import { Subscription } from 'rxjs';
import { MatDatepicker } from '@angular/material/datepicker';
import * as _moment from 'moment';

import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import * as moment from 'moment';

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
})
export class ProductDprTableComponent implements OnInit, OnDestroy {
  @ViewChild(MatDatepicker) matDatePicker: MatDatepicker<_moment.Moment>;

  @Input() productDoc: DocumentSnapshot<any>;
  public dprDoc: DocumentData;
  private plantCollectionRef: AngularFirestoreCollection;
  
  private currentCompany: string;
  private month: number;
  private year: number;
  public ready: boolean = false;

  public currentSub: Subscription;

  constructor(
    private db: AngularFirestore,
    private localStorage: Storage
  ) {
    this.year = moment().year();
    this.month = moment().month();

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
        });

        plantListSub.unsubscribe();
      })
    })
  }

  ngOnInit() {}

  ngOnDestroy() {
    if(this.currentSub != null) {
      this.currentSub.unsubscribe();
    }
  }

  public chosenYearHandler(normalizedYear: _moment.Moment) {
    this.year = normalizedYear.year();
  }

  public chosenMonthHandler(normalizedMonth: _moment.Moment, datepicker: MatDatepicker<_moment.Moment>) {
    this.month = normalizedMonth.month();
    datepicker.close();
  }

}
