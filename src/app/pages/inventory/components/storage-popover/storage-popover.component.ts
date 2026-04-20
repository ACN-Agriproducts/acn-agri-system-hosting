import { Component, OnInit, Input } from '@angular/core';
import { collection, DocumentReference, serverTimestamp } from '@angular/fire/firestore';
import { runTransaction, doc } from '@angular/fire/firestore'
import { MatDialog } from '@angular/material/dialog';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { PopoverController } from '@ionic/angular';
import { Inventory, Plant } from '@shared/classes/plant';
import { Product } from '@shared/classes/product';
import { EditInvDialogComponent } from './dialogs/edit-inv-dialog/edit-inv-dialog.component';
import { MoveInvDialogComponent } from './dialogs/move-inv-dialog/move-inv-dialog.component';
import { ZeroOutTankDialogComponent } from './dialogs/zero-out-tank-dialog/zero-out-tank-dialog.component';

@Component({
  selector: 'app-storage-popover',
  templateUrl: './storage-popover.component.html',
  styleUrls: ['./storage-popover.component.scss'],
})
export class StoragePopoverComponent implements OnInit {
  @Input() plantRef: DocumentReference<Plant>;
  @Input() storageId: number;
  @Input() tankList: Inventory[];
  @Input() productList: Product[];

  constructor(
    private dialog: MatDialog,
    private popoverController: PopoverController,
    private session: SessionInfo
    ) { }

  ngOnInit() {}

  public moveInvButton(event: any){
    const dialogRef = this.dialog.open(MoveInvDialogComponent, {
      width: '250px',
      data: {
        tankList: this.tankList,
        currentTank: this.storageId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        runTransaction(this.plantRef.firestore, transaction => {
          return transaction.get(this.plantRef).then(async plant => {
            const inventory = plant.data().getRawInventory();
            const beforeInv = plant.data().getRawInventory();
            const changes = [];

            if(inventory[result.targetTank].product.id != 'none' && inventory[result.targetTank].product.id != inventory[this.storageId].product.id ) {
              return;
            }

            if(inventory[result.targetTank].product.id == 'none') {
              inventory[result.targetTank].product = inventory[this.storageId].product;
              changes.push({
                type: 'Add Product Type',
                tank: inventory[result.targetTank].name,
              });
            }

            if(result.wholeInventory || result.quantityToMove > inventory[this.storageId].current) {
              result.quantityToMove = inventory[this.storageId].current;
              inventory[this.storageId].product = doc(inventory[this.storageId].product.parent, 'none');
              changes.push({
                type: "Remove product type",
                tank: inventory[result.targetTank].name
              });
            }

            inventory[this.storageId].current -= result.quantityToMove;
            inventory[result.targetTank].current += result.quantityToMove;

            changes.push({
              type: "Edit tank",
              tank: inventory[this.storageId].name,
              amount: -result.quantityToMove
            });

            changes.push({
              type: "Edit tank",
              tank: inventory[result.targetTank].name,
              amount: result.quantityToMove
            });

            const logRef = doc(collection(this.plantRef, 'storageLogs'));
            transaction.set(logRef, {
              before: beforeInv,
              after: inventory,
              updatedBy: this.session.getUser().uid,
              updatedOn: serverTimestamp(),
              change: changes,
              updateType: 'Manual'
            })
            
            transaction.update(this.plantRef, { inventory, lastStorageUpdate: logRef });
          })
        })
      }
    });

    this.popoverController.dismiss();
  }

  public editInvButton(event: any) {
    const dialogRef = this.dialog.open(EditInvDialogComponent, {
      width: '250px',
      data:{
        currentProduct: this.tankList[this.storageId].product.id,
        productList: this.productList
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        runTransaction(this.plantRef.firestore, transaction => {
          return transaction.get<Plant>(this.plantRef).then(async plant => {
            const inventory = plant.data().getRawInventory();
            const beforeInv = plant.data().getRawInventory();
            const changes = []
            
            if(result.newProduct){
              inventory[this.storageId].product = doc(inventory[this.storageId].product.parent, result.newProduct);
              changes.push({
                type: 'New Product',
                tank: inventory[this.storageId].name
              })
            }

            if(inventory[this.storageId].current + result.quantity <= 0) {
              inventory[this.storageId].current = 0;
              inventory[this.storageId].product = doc(inventory[this.storageId].product.parent, 'none')
              changes.push({
                type: 'Inventory Empty',
                tank: inventory[this.storageId].name,
                amount: result.quantity
              });
            }
            else {
              inventory[this.storageId].current += result.quantity;
              changes.push({
                type: 'Inventory Edit',
                tank: inventory[this.storageId].name,
                amount: result.quantity
              });
            }

            const logRef = doc(collection(this.plantRef, 'storageLogs'));
            transaction.set(logRef, {
              before: beforeInv,
              after: inventory,
              updatedBy: this.session.getUser().uid,
              updatedOn: serverTimestamp(),
              change: changes,
              updateType: 'Manual'
            })

            transaction.update(this.plantRef, { inventory, lastStorageUpdate: logRef });
          });
        })
      }
    });

    this.popoverController.dismiss();
  }

  public zeroOutButton(event: any) {
    const dialogRef = this.dialog.open(ZeroOutTankDialogComponent, {
      width: '250px',
      data: {
        tankName: this.tankList[this.storageId].name
      }
    });

    dialogRef.afterClosed().subscribe(async result => {
      if(result) {
        runTransaction(this.plantRef.firestore, transaction => {
          return transaction.get(this.plantRef).then(async plant => {
            const beforeInv = plant.data().getRawInventory();
            const inventory = plant.data().getRawInventory();

            inventory[this.storageId].current = 0;
            inventory[this.storageId].product = doc(inventory[this.storageId].product.parent, 'none');
            
            const changes = [{
              type: 'Zero out inventory',
              tank: inventory[this.storageId].name,
              amount: -beforeInv[this.storageId].current
            }]

            const logRef = doc(collection(this.plantRef, 'storageLogs'));
            transaction.set(logRef, {
              before: beforeInv,
              after: inventory,
              updatedBy: this.session.getUser().uid,
              updatedOn: serverTimestamp(),
              change: changes,
              updateType: 'Manual'
            })

            transaction.update(this.plantRef, {inventory, lastStorageUpdate: logRef});
          });
        });
      }
    });

    this.popoverController.dismiss();
  }

  public archiveButton(event: any) { 
    runTransaction(this.plantRef.firestore, async transaction => {
      const plant = (await transaction.get(this.plantRef)).data();
      const beforeInv = plant.getRawInventory();
      const inventory = plant.getRawInventory();

      inventory[this.storageId].archived = !inventory[this.storageId].archived;

      const changes = [{
        type: 'Inventory archive status changed',
        tank: inventory[this.storageId].name,
      }];

      const logRef = doc(collection(this.plantRef, 'storageLogs'));
      transaction.set(logRef, {
        before: beforeInv,
        after: inventory,
        updatedBy: this.session.getUser().uid,
        updatedOn: serverTimestamp(),
        change: changes,
        updateType: 'Manual'
      });

      return transaction.update(this.plantRef, {inventory, lastStorageUpdate: logRef});
    });
  }
}
