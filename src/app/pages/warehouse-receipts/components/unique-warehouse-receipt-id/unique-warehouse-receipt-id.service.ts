import { Injectable } from '@angular/core';
import { CollectionReference, getDocs, query, where } from '@angular/fire/firestore';
import { AbstractControl, AsyncValidator, ValidationErrors } from '@angular/forms';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class UniqueWarehouseReceiptIdService implements AsyncValidator {
  private getCollectionFunc: () => CollectionReference;

  constructor() { }

  validate(control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    const wrCollectionQuery = query(this.getCollectionFunc(), where('warehouseReceiptIdList', 'array-contains', control.value));

    return getDocs(wrCollectionQuery).then(result => {
      if (!result.empty) {
        return { idExists: true };
      }
      return null;
    })
  }

  public setGetterFunction (func: () => CollectionReference): void {
    this.getCollectionFunc = func;
  }
}
