import { MatSnackBar } from '@angular/material/snack-bar';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { OptionsComponent } from '../options/options.component';
import { Storage } from '@ionic/storage';
import { Subscription } from 'rxjs';
import { IonInfiniteScroll } from '@ionic/angular';
import { Invoice } from '@shared/classes/invoice';
import { Firestore, getDocs, limit, orderBy, query, startAt } from '@angular/fire/firestore';
import { Pagination } from '@shared/classes/FirebaseDocInterface';
import { SessionInfo } from '@core/services/session-info/session-info.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit, OnDestroy {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  public number: boolean;
  public customer: boolean;
  public issue: boolean;
  public paid: boolean;
  public billed: boolean;

  private currentCompany:string;
  public paginator: Pagination<Invoice>
  private step: number = 20;

  constructor(
    private popoverController: PopoverController,
    private snackBar: MatSnackBar,
    private db: Firestore,
    private sessions: SessionInfo
    // private clipboard: Clipboard
  ) { }

  ngOnInit(): void {
    this.currentCompany = this.sessions.getCompany();
    this.paginator = new Pagination<Invoice>(query(Invoice.getCollectionReference(this.db, this.currentCompany), orderBy("id", "desc")), this.step);
  }

  ngOnDestroy() {
    this.paginator.end();
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
    this.paginator.getNext(snapshot => {
      event.target.complete();
      if(snapshot.docs.length < this.step) {
        this.infiniteScroll.disabled = true;
      }
    });
  }
}
