import { MatSnackBar } from '@angular/material/snack-bar';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { OptionsComponent } from '../options/options.component';
import { Storage } from '@ionic/storage';
import { Subscription } from 'rxjs';
import { IonInfiniteScroll } from '@ionic/angular';
import { Invoice } from '@shared/classes/invoice';
import { Firestore, getDocs, limit, orderBy, query, startAt } from '@angular/fire/firestore';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit, OnDestroy {

  public number: boolean;
  public customer: boolean;
  public issue: boolean;
  public paid: boolean;
  public billed: boolean;

  private currentCompany:string;
  public invoiceList: Invoice[];
  private step: number = 20;

  private currentSub: Subscription;

  constructor(
    private popoverController: PopoverController,
    private snackBar: MatSnackBar,
    private db: Firestore,
    private localStorage: Storage

    // private clipboard: Clipboard
  ) { }

  ngOnInit(): void {
    this.localStorage.get('currentCompany').then(val => {
      this.currentCompany = val;
      this.invoiceList = [];
      getDocs(query(Invoice.getCollectionReference(this.db, this.currentCompany),
        orderBy("id", "desc"),
        limit(this.step)))
        .then(result => {
          const tempList = result.docs.map(doc => doc.data());
          this.invoiceList.push(...tempList);
        })
    });
  }

  ngOnDestroy() {
    if(this.currentSub != null) {
      this.currentSub.unsubscribe();
    }
  }

  public openOptions = async (ev, invoice) => {
    ev.preventDefault();
    const options = await this.popoverController.create({
      component: OptionsComponent,
      event: ev,
      componentProps: {invoice: invoice}
    });
    await options.present();
    options.onDidDismiss().then(result => {
      if(result.data){
        this.snackBar.open('Was copied.', 'Ok', {
          duration: 1200,
        });
      }
    });
  }

  public infiniteInvoice(event: any) {
    getDocs(query(Invoice.getCollectionReference(this.db, this.currentCompany),
      orderBy("id", "desc"),
      startAt(this.invoiceList[this.invoiceList.length-1].id-1),
      limit(this.step)))
      .then(result => {
        const tempList = result.docs.map(doc => doc.data());
        this.invoiceList.push(...tempList);
        event.target.complete();

        if(result.docs.length < 20) {
          event.target.disabled = true;
        }
      });
  }
}
