import { MatSnackBar } from '@angular/material/snack-bar';
import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { OptionsComponent } from '../options/options.component';
import { AngularFirestore } from '@angular/fire/firestore';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {

  public number: boolean;
  public customer: boolean;
  public issue: boolean;
  public paid: boolean;
  public billed: boolean;

  private currentCompany:string;
  public invoiceList: any[];

  constructor(
    private popoverController: PopoverController,
    private snackBar: MatSnackBar,
    private fb: AngularFirestore,
    private localStorage: Storage

    // private clipboard: Clipboard
  ) { }

  ngOnInit(): void {
    this.localStorage.get('currentCompany').then(val => {
      this.currentCompany = val;

      this.fb.collection(`companies/${this.currentCompany}/invoices`).valueChanges({idField: "docId"}).subscribe(list => {
        this.invoiceList = list;
      })
    })
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
}
