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
    
    return warehouseReceiptCollection.ref.where('id', '>=', control.value).limit(1).get().then(result => {
      const resultDocArray = result.docs;
      if (resultDocArray.length === 0) return null;

      let lastControlId = control.value + quantity - 1;
      let firstResultId = resultDocArray[0].get('id');

      if (lastControlId < firstResultId) {
        return null;
      }
      else {
        return { uniqueId: true };
      }
    });
  }

  public setGetterFunction (func: () => [AngularFirestoreCollection, number]): void {
    this.getCollectionFunc = func;
  }
}
