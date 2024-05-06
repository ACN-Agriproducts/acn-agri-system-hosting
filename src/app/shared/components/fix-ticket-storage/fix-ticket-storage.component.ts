import { Component, Inject, Input, OnInit } from '@angular/core';
import { collection, doc, Firestore, runTransaction, serverTimestamp } from '@angular/fire/firestore';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
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
  public submitting: boolean = false;

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
      updateType: 'Ticket storage fix',
    }

    plant.inventory.forEach((inv, index) => {
      updateDoc.push(inv.getRawData());
      if(inv.name == this.chosenInv.name) {
        updateDoc[index].current += this.data.net.get() * (this.data.in? 1 : -1)

        changes.push({
          type: `Ticket storage fix`,
          tank: inv.name,
          amount: this.data.net.get() * (this.data.in? 1 : -1)
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
    this.submitting = true;
    runTransaction(this.db, transaction => {
      return transaction.get(this.plant.ref.withConverter(Plant.converter)).then(async plant => {
        const {inventory, log} = this.getUpdateDoc(plant.data());
        const logRef = doc(collection(plant.ref, 'storageLogs'));
        transaction.update(this.data.ref.withConverter(Ticket.converter), {
          needsAttention: false,
          tank: this.chosenInv.name,
          tankId: this.plant.inventory.findIndex(tank => tank.name == this.chosenInv.name)
        });
        transaction.set(logRef, log);
        transaction.update(plant.ref, {
          inventory,
          lastStorageUpdate: logRef
        });
      });
    }).then(() => {
      console.log("Submited!");
      this.dialogRef.close();
    }).catch(() => {
      this.submitting = false;
    });
  }
}
