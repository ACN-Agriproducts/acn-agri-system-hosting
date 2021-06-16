import { ModalController, NavController, PopoverController } from '@ionic/angular';
import { ShowContactModalComponent } from './components/show-contact-modal/show-contact-modal.component';
import { Component, OnInit } from '@angular/core';
import { OptionsDirectoryComponent } from './components/options-directory/options-directory.component';
import { AngularFirestore } from '@angular/fire/firestore'
import { Observable } from 'rxjs';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-directory',
  templateUrl: './directory.page.html',
  styleUrls: ['./directory.page.scss'],
})
export class DirectoryPage implements OnInit {

  contacts: any[]
  stringTest: string
  currentCompany: string

  constructor(
    private popoverController: PopoverController,
    private modalController: ModalController,
    private store: AngularFirestore,
    private navController: NavController,
    private localStore: Storage
  ) { 
    this.localStore.get('currentCompany').then(val => {
      this.currentCompany = val;
      this.updateList();
    })
   }

  ngOnInit() {
  }

  private updateList = async () => {
    this.store.collection(`companies/${this.currentCompany}/directory`, col => 
      col.orderBy('name')
    ).valueChanges({idField: 'docId'})
      .subscribe(val => this.contacts = val);
  }

  public openOptions = async (ev: any) => {
    ev.preventDefault();
    const popover = await this.popoverController.create({
      component: OptionsDirectoryComponent,
      cssClass: 'my-custom-class',
      event: ev,
      translucent: true,
    });
    return await popover.present();
  }

  public openContactModal = async (index) => {
    const modal = await this.modalController.create({
      component: ShowContactModalComponent,
      cssClass: 'modal-contact',
      swipeToClose: true,
      componentProps: {
        data: this.contacts[index]
      }
    });
    return await modal.present();
  }

  public openNewContact(){
    this.navController.navigateForward('dashboard/directory/new')
  }

  public editButton(id: string) {
    this.navController.navigateForward(`dashboard/directory/edit-contact/${id}`)
  }
}
