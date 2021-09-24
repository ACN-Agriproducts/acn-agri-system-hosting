import { Component, OnInit, Input } from '@angular/core';
import { DocumentReference } from '@angular/fire/compat/firestore';
import { MatDialog } from '@angular/material/dialog';
import { PopoverController } from '@ionic/angular';
import { EditInvDialogComponent } from './dialogs/edit-inv-dialog/edit-inv-dialog.component';
import { MoveInvDialogComponent } from './dialogs/move-inv-dialog/move-inv-dialog.component';
import { ZeroOutTankDialogComponent } from './dialogs/zero-out-tank-dialog/zero-out-tank-dialog.component';

@Component({
  selector: 'app-storage-popover',
  templateUrl: './storage-popover.component.html',
  styleUrls: ['./storage-popover.component.scss'],
})
export class StoragePopoverComponent implements OnInit {
  @Input() plantRef: DocumentReference;
  @Input() storageId: number;
  @Input() tankList: any[];
  @Input() productList: any[];

  constructor(
    private dialog: MatDialog,
    private popoverController: PopoverController
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
        this.plantRef.firestore.runTransaction( transaction => {
          return transaction.get(this.plantRef).then(async plant => {
            let inventory = plant.data().inventory;

            if(inventory[result.targetTank].product.id != 'none' && inventory[result.targetTank].product.id != inventory[this.storageId].product.id ) {
              return;
            }

            if(inventory[result.targetTank].product.id == 'none') {
              inventory[result.targetTank].product = inventory[this.storageId].product;
            }

            if(result.wholeInventory || result.quantityToMove > inventory[this.storageId].current) {
              result.quantityToMove = inventory[this.storageId].current;
              inventory[this.storageId].product = inventory[this.storageId].product.parent.doc('none');
            }

            inventory[this.storageId].current -= result.quantityToMove;
            inventory[result.targetTank].current += result.quantityToMove;
            
            transaction.update(this.plantRef, { inventory })
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
        this.plantRef.firestore.runTransaction(transaction => {
          return transaction.get(this.plantRef).then(async plant => {
            let inventory = plant.data().inventory;
            
            if(result.newProduct){
              inventory[this.storageId].product = inventory[this.storageId].product.parent.doc(result.newProduct);
            }

            if(inventory[this.storageId].current + result.quantity <= 0) {
              inventory[this.storageId].current = 0;
              inventory[this.storageId].product = inventory[this.storageId].product.parent.doc('none')
            }
            else {
              inventory[this.storageId].current += result.quantity;
            }

            transaction.update(this.plantRef, { inventory });
          });
        });
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
        this.plantRef.firestore.runTransaction(transaction => {
          return transaction.get(this.plantRef).then(async plant => {
            let inventory = plant.data().inventory;

            inventory[this.storageId].current = 0;
            inventory[this.storageId].product = inventory[this.storageId].product.parent.doc('none');
    
            transaction.update(this.plantRef, {inventory});
          });
        });
      }
    });

    this.popoverController.dismiss();
  }
}
