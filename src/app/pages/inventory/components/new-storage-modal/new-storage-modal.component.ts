import { Component, Input, OnInit } from '@angular/core';
import { collection, doc, DocumentReference, Firestore } from '@angular/fire/firestore';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { runTransaction } from 'firebase/firestore';

@Component({
  selector: 'app-new-storage-modal',
  templateUrl: './new-storage-modal.component.html',
  styleUrls: ['./new-storage-modal.component.scss'],
})
export class NewStorageModalComponent implements OnInit {
  @Input() plantRef: DocumentReference;
  @Input() productList: any[];

  public storageForm: UntypedFormGroup;

  constructor(
    private modalController: ModalController,
    private fb: UntypedFormBuilder,
    private db: Firestore
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
      return t.get(this.plantRef).then(async plant => {
        if(!plant.exists){
          throw "Document Does not exist"
        }

        let updateDoc = {
          inventory: plant.data().inventory,
          inventoryNames: plant.data().inventoryNames
        }

        let submitInv = this.storageForm.getRawValue();
        submitInv.product = doc(collection(this.plantRef.parent.parent, 'products'), submitInv.product);

        updateDoc.inventory.push(submitInv);
        updateDoc.inventoryNames.push(submitInv.name);

        await t.update(this.plantRef, updateDoc);

        this.modalController.dismiss({dismissed:true});
      })
    })
  }
}
