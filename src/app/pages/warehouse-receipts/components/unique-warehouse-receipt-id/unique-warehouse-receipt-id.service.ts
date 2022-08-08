import { Injectable } from '@angular/core';
import { AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { AbstractControl, AsyncValidator, ValidationErrors } from '@angular/forms';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class UniqueWarehouseReceiptIdService implements AsyncValidator {
  private getCollectionFunc: () => [AngularFirestoreCollection, number];

  constructor() { }

  validate(control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    const [warehouseReceiptCollection, quantity] = this.getCollectionFunc();

    return warehouseReceiptCollection.ref.get().then(result => {
      let warehouseReceiptIdList = result.docs[0].get('warehouseReceiptIdList');
      
      if (warehouseReceiptIdList.includes(control.value)) {
        console.log("Id exists");
        return { idExists: true };
      }
      
      return null;
    });
  }

  public setGetterFunction (func: () => [AngularFirestoreCollection, number]): void {
    this.getCollectionFunc = func;
  }
}
