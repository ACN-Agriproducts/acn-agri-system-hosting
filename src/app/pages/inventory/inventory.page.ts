import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { firstValueFrom, Observable } from 'rxjs';
import { NewStorageModalComponent } from './components/new-storage-modal/new-storage-modal.component';
import { Plant } from '@shared/classes/plant';
import { Product } from '@shared/classes/product';
import { Firestore } from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.page.html',
  styleUrls: ['./inventory.page.scss'],
})
export class InventoryPage implements OnInit {
  public showArchivedInv: boolean = false;

  public plant$: Observable<Plant>;
  public products$: Observable<Product[]>;

  @ViewChild('InvMenuTrigger') InvMenuTrigger: HTMLElement;
  @ViewChild(MatMenuTrigger) contextMenu: MatMenuTrigger;

  constructor(
    private db: Firestore,
    private modalController: ModalController,
    private fns: Functions,
    public session: SessionInfo
  ) {}

  ngOnInit() {
    this.products$ = Product.getCollectionSnapshot(this.db, this.session.getCompany());
    this.getPlantSnapshot();
  }

  getPlantSnapshot() {
    this.plant$ = Plant.getPlantSnapshot(this.db, this.session.getCompany(), this.session.getPlant());
  }

  public async newStorageModal(): Promise<any> {
    const modal = await this.modalController.create({
      component: NewStorageModalComponent,
      componentProps:{
        plantRef: Plant.getDocReference(this.db, this.session.getCompany(), this.session.getPlant()),
        productList: await firstValueFrom(this.products$),
      }
    });

    return await modal.present();
  }

  public updateProductInv(): void {
    httpsCallable(this.fns, 'helperFunctions-calculateProductValues')({company: this.session.getCompany()});
  }

  public onContextMenu(event: MouseEvent) {
    event.preventDefault();
    this.InvMenuTrigger["nativeElement"].style.left =  event.clientX + 'px';
    this.InvMenuTrigger["nativeElement"].style.top = event.clientY + 'px';
    this.contextMenu.menu.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }

}
