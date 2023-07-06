import { Component, Input, OnInit } from '@angular/core';
import { collection, doc, DocumentReference, Firestore, serverTimestamp } from '@angular/fire/firestore';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { ModalController } from '@ionic/angular';
import { Plant } from '@shared/classes/plant';
import { Product } from '@shared/classes/product';
import { runTransaction } from 'firebase/firestore';

@Component({
  selector: 'app-new-storage-modal',
  templateUrl: './new-storage-modal.component.html',
  styleUrls: ['./new-storage-modal.component.scss'],
})
export class NewStorageModalComponent implements OnInit {
  @Input() plantRef: DocumentReference<Plant>;
  @Input() productList: Product[];

  public storageForm: UntypedFormGroup;

  constructor(
    private modalController: ModalController,
    private fb: UntypedFormBuilder,
    private db: Firestore,
    private session: SessionInfo
  ) { }

  ngOnInit() {
    this.storageForm = this.fb.group({
      current: [0, Validators.required],
      max: [0, Validators.required],
      name: [, Validators.required],
      product: [, Validators.required],
      type: [, Validators.required]
    });
  }

  public async submitForm(): Promise<void> {
    return runTransaction(this.db, t => {
      return t.get(this.plantRef).then(async plantDoc => {
        if(!plantDoc.exists){
          throw "Document Does not exist"
        }
        const plant = plantDoc.data();

        // Create plant update object
        let updateDoc = {
          inventory: plant.getRawInventory(),
          inventoryNames: plant.inventoryNames,
          lastStorageUpdate: null
        }

        let submitInv = this.storageForm.getRawValue();

        updateDoc.inventory.push(submitInv);
        updateDoc.inventoryNames.push(submitInv.name);

        // Create storage log object
        const storageLog = {
          before: plant.getRawInventory(),
          after: updateDoc.inventory,
          updatedBy: this.session.getUser().uid,
          updatedOn: serverTimestamp(),
          change: [],
          updateType: 'Manual'
        }

        storageLog.change.push({
          type: "New Tank",
          tank: updateDoc.inventory[updateDoc.inventory.length-1].name
        });

        // Update
        const logRef = doc(collection(this.plantRef, 'storageLogs'));
        updateDoc.lastStorageUpdate = logRef;
        t.set(logRef, storageLog);
        t.update(this.plantRef, updateDoc);
      })
    }).then(() => {
      this.modalController.dismiss({dismissed:true});
    });
  }
}
