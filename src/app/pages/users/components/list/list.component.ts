// import { ShowModalComponent } from './../show-modal/show-modal.component';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, DocumentReference } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { PopoverController, ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Subscription } from 'rxjs';
// import { OptionsComponent } from '../options/options.component';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  public listEmployees = [];
  public filterEmployee: boolean;
  public filterStatus: boolean;
  public filterSalary: boolean;
  private currentSubs: Subscription[] = [];
  constructor(
    private popoverController: PopoverController,
    private modalController: ModalController,
    private db: AngularFirestore,
    private storage: AngularFireStorage,
    private localStorage: Storage
  ) { }

  ngOnInit(): void {
    this.localStorage.get('currentCompany').then(currentCompany => {
      var sub = this.db.doc(`companies/${currentCompany}`).valueChanges().subscribe(companyDoc => {
        this.listEmployees = [];

        companyDoc['employees'].forEach(element => {
          let ref = element as DocumentReference;
        
          ref.get().then(user => {
            ref.collection('companies').doc(currentCompany).get().then(userComp => {
              let status = 'User';
              let pictureURL: string = 'users/avatar.svg';

              if(userComp.data().permissions.developer) {
                status = 'Developer'
              } 
              else if(userComp.data().permissions.owner) {
                status = 'Owner'
              }
              else if(userComp.data().permissions.admin) {
                status = 'Administrator'
              }

              if(user.data().profilePicPath != null) {
                pictureURL = user.data().profilePicPath
              }

              var tempSub = this.storage.ref(pictureURL).getDownloadURL().subscribe(url => {
                this.listEmployees = [];
                this.listEmployees.push({
                  name: user.data().name,
                  createdAt: user.data().createdAt,
                  status: status,
                  employment: userComp.data().position,
                  email: user.data().email,
                  userId: user.id,
                  pictureURL: url
                })
              })
              this.currentSubs.push(tempSub);
              sub.unsubscribe();
            })
          })
        });
      })

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
