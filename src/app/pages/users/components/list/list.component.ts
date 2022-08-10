// import { ShowModalComponent } from './../show-modal/show-modal.component';
import { Component, OnInit } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { Storage } from '@angular/fire/storage';
import { Firestore } from '@angular/fire/firestore';
import { Storage as IonStorage } from '@ionic/storage';
import { Company } from '@shared/classes/company';
import { User } from '@shared/classes/user';
// import { OptionsComponent } from '../options/options.component';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  public listEmployees: User[] = [];
  public filterEmployee: boolean;
  public filterStatus: boolean;
  public filterSalary: boolean;
  constructor(
    private db: Firestore,
    private storage: Storage,
    private localStorage: IonStorage,
    private fns: Functions
  ) { }

  ngOnInit(): void {
    this.localStorage.get('currentCompany').then(async currentCompany => {      
      const company = await Company.getCompany(this.db, currentCompany);
      this.listEmployees = await company.getCompanyUsers(this.fns, this.db);
      this.listEmployees.forEach(async user => {
        user.getPictureURL(this.storage);
      });
    })
  }
  public openOptions = async (ev: any, item) => {
    // console.log(item);
    // ev.preventDefault();
    // const popover = await this.popoverController.create({
    //   component: OptionsComponent,
    //   cssClass: 'my-custom-class',
    //   event: ev,
    //   translucent: true,
    //   componentProps: { data: item }
    // });
    // return await popover.present();
  }
  public openModal = async (event, item) => {
    // const modal = await this.modalController.create({
    //   component: ShowModalComponent,
    //   cssClass: 'showModal-employee',
    //   componentProps: { dataMovil: item }
    // });
    // return await modal.present();
  }
}
