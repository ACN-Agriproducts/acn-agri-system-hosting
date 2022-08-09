import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidator, ValidationErrors } from '@angular/forms';
import { Observable } from 'rxjs';
import { CollectionReference, getDocs, limit, query, where } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})

export class UniqueWarehouseReceiptIdService implements AsyncValidator {
  private getCollectionFunc: () => [CollectionReference, number];

  constructor() { }

  validate(control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    const [warehouseReceiptCollection, quantity] = this.getCollectionFunc();
    
    return getDocs(query(warehouseReceiptCollection, where('id', '>=', control.value), limit(1))).then(result => {
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

  public setGetterFunction (func: () => [CollectionReference, number]): void {
    this.getCollectionFunc = func;
  }
}
