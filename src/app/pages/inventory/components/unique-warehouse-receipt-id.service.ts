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
    
    return warehouseReceiptCollection.ref.where('id', '>=', control.value).limit(quantity).get().then(result => {
      let lastControlId = control.value + quantity;
      let firstResultId = result.docs[0].get('id');

      console.log(`Last Id of New Set: ${lastControlId}\nFirst Id of Retrieved Set:${firstResultId}`);
      console.log(lastControlId <= firstResultId);

      if(lastControlId <= firstResultId) {
        return null;
      }
      else {
        return {UniqueId: true};
      }
    });
  }

  public setGetterFunction (func: () => [AngularFirestoreCollection, number]): void {
    this.getCollectionFunc = func;
  }
}
