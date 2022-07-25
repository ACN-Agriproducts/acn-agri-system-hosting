// import { ShowModalComponent } from './../show-modal/show-modal.component';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, DocumentReference } from '@angular/fire/compat/firestore';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { PopoverController, ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Company } from '@shared/classes/company';
import { User } from '@shared/classes/user';
import { Subscription } from 'rxjs';
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
  private currentSubs: Subscription[] = [];
  constructor(
    private popoverController: PopoverController,
    private modalController: ModalController,
    private db: AngularFirestore,
    private storage: AngularFireStorage,
    private localStorage: Storage,
    private fns: AngularFireFunctions
  ) { }

  ngOnInit(): void {
    this.localStorage.get('currentCompany').then(async currentCompany => {      
      const company = await Company.getCompany(this.db, currentCompany);
      this.listEmployees = await company.getCompanyUsers(this.fns, this.db);
      this.listEmployees.forEach(async user => {
        user.pictureURL = await user.getPictureURL(this.storage);
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
