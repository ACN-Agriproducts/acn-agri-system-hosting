import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Inventory, Plant } from '@shared/classes/plant';
import { Product } from '@shared/classes/product';
import { firstValueFrom } from 'rxjs';
import { StoragePopoverComponent } from '../storage-popover/storage-popover.component';

@Component({
  selector: 'app-storage-card',
  templateUrl: './storage-card.component.html',
  styleUrls: ['./storage-card.component.scss'],
})
export class StorageCardComponent implements OnInit {
  @Input() tank: Inventory;
  @Input() plant: Plant;
  @Input() products: Product[];

  constructor(
    private popoverController: PopoverController
  ) { }

  ngOnInit() {}

  public async inventoryMenu(ev: any): Promise<void> {
    const popover = await this.popoverController.create({
      component: StoragePopoverComponent,
      event: ev,
      componentProps: {
        plantRef: this.plant.ref,
        storageId: this.plant.inventoryNames.findIndex(name => name == this.tank.name),
        tankList: this.plant.inventory,
        productList: this.products
      }
    });

    return popover.present();
  }
}
