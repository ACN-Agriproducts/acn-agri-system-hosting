import { ModalController, NavController, PopoverController } from '@ionic/angular';
import { ShowContactModalComponent } from './components/show-contact-modal/show-contact-modal.component';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { OptionsDirectoryComponent } from './components/options-directory/options-directory.component';
import { Subscription } from 'rxjs';
import { Storage } from '@ionic/storage';
import { collectionData, Firestore, orderBy, query } from '@angular/fire/firestore';
import { Contact } from '@shared/classes/contact';
import { SessionInfo } from '@core/services/session-info/session-info.service';

@Component({
  selector: 'app-directory',
  templateUrl: './directory.page.html',
  styleUrls: ['./directory.page.scss'],
})
export class DirectoryPage implements OnInit, OnDestroy {

  public contacts: any[]
  public stringTest: string
  public currentCompany: string
  private currentSub: Subscription;

  constructor(
    private popoverController: PopoverController,
    private db: Firestore,
    private modalController: ModalController,
    private navController: NavController,
    private session: SessionInfo,
  ) { }

  ngOnInit() {
    this.currentCompany = this.session.getCompany();
    this.updateList();
  }

  ngOnDestroy() {
    if(this.currentSub != null) {
      this.currentSub.unsubscribe();
    }
  }

  private updateList = async () => {
    this.currentSub = collectionData(query(Contact.getCollectionReference(this.db, this.currentCompany), orderBy('name'))).subscribe(val => this.contacts = val);
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

  public deleteButton(id: string): void {
    
  }

  public nav = (route: string): void => {
    this.navController.navigateForward(route, {
      replaceUrl: false
    });
  }
}
