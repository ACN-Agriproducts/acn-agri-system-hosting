import { Component, OnInit, Input } from '@angular/core';
import { DocumentReference } from '@angular/fire/compat/firestore';
import { MatDialog } from '@angular/material/dialog';
import { MoveInvDialogComponent } from './dialogs/move-inv-dialog/move-inv-dialog.component';

@Component({
  selector: 'app-storage-popover',
  templateUrl: './storage-popover.component.html',
  styleUrls: ['./storage-popover.component.scss'],
})
export class StoragePopoverComponent implements OnInit {
  @Input() plantRef: DocumentReference;
  @Input() storageId: number;
  @Input() tankList: any[];

  constructor(
    private dialog: MatDialog,

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

            if(result.wholeInventory) {
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
  }

  public editInvButton(event: any) {

  }

  public zeroOutButton(event: any) {

  }
}
