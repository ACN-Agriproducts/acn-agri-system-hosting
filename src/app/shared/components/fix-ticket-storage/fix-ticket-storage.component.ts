import { Component, Inject, Input, OnInit } from '@angular/core';
import { collection, doc, Firestore, runTransaction, serverTimestamp } from '@angular/fire/firestore';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SessionInfo } from '@core/services/session-info/session-info.service';
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
    @Inject(MAT_DIALOG_DATA) public data: Ticket,
    private db: Firestore,
    private session: SessionInfo
  ) { }

  ngOnInit() {
    this.data.getPlant().then(plant => {
      this.plant = plant;

      this.chosenInv = this.plant.inventory.find(i => i.name == this.data.tank);
    });
  }

  getUpdateDoc(plant: Plant) {
    const updateDoc = [];
    const changes = [];
    const storageLog: any = {
      before: plant.getRawInventory(),
      updatedBy: this.session.getUser().uid,
      updatedOn: serverTimestamp(),
      change: [],
      updatedType: 'Ticket storage fix',
    }

    plant.inventory.forEach((inv, index) => {
      updateDoc.push(inv.getRawData());
      if(inv.name == this.chosenInv.name) {
        updateDoc[index].current += this.data.dryWeight * (this.data.in? 1 : -1)

        changes.push({
          type: `Ticket storage fix`,
          tank: inv.name,
          amount: this.data.dryWeight * (this.data.in? 1 : -1)
        })
      }
    });

    storageLog.after = updateDoc;
    storageLog.change = changes;

    return {
      inventory: updateDoc,
      log: storageLog
    }
  }

  submitChange() {
    runTransaction(this.db, transaction => {
      return transaction.get(this.plant.ref.withConverter(Plant.converter)).then(async plant => {
        const {inventory, log} = this.getUpdateDoc(plant.data());
        const logRef = doc(collection(plant.ref, 'storageLogs'));
        transaction.set(logRef, log);
        transaction.update(plant.ref, {
          inventory,
          lastStorageUpdate: logRef
        });
      });
    });
  }
}
