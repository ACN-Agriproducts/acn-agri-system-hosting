import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inventory, Plant } from '@shared/classes/plant';
import { Ticket } from '@shared/classes/ticket';

@Component({
  selector: 'app-fix-ticket-storage',
  templateUrl: './fix-ticket-storage.component.html',
  styleUrls: ['./fix-ticket-storage.component.scss'],
})
export class FixTicketStorageComponent implements OnInit {
  public plant: Plant;
  public chosenInv: Inventory;

  constructor(
    public dialogRef: MatDialogRef<FixTicketStorageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Ticket
  ) { }

  ngOnInit() {
    this.data.getPlant().then(plant => {
      this.plant = plant;

      this.chosenInv = this.plant.inventory.find(i => i.name == this.data.tank);
    });
  }

  getUpdateDoc() {
    const updateDoc = [];

    this.plant.inventory.forEach((inv, index) => {
      updateDoc.push(inv.getRawData());
      if(inv.name == this.chosenInv.name) {
        updateDoc[index].current += this.data.dryWeight * (this.data.in? 1 : -1)
      }
    })

    return {
      inventory: updateDoc
    }
  }
}
