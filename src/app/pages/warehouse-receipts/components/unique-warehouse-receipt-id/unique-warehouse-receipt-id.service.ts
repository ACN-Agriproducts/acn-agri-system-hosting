import { Injectable } from '@angular/core';
import { AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { AbstractControl, AsyncValidator, ValidationErrors } from '@angular/forms';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class UniqueWarehouseReceiptIdService implements AsyncValidator {
  private getCollectionFunc: () => AngularFirestoreCollection;

  constructor() { }

  validate(control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    const warehouseReceiptCollection = this.getCollectionFunc();

    return warehouseReceiptCollection.ref.where('warehouseReceiptIdList', 'array-contains', control.value).get().then(result => {
      if (!result.empty) {
        return { idExists: true };
      }
      return null;
    })
  }

  public setGetterFunction (func: () => AngularFirestoreCollection): void {
    this.getCollectionFunc = func;
  }
}
