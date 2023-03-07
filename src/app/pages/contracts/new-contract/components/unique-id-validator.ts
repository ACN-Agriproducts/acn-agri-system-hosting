import { Injectable } from '@angular/core';
import { Firestore, query, where, getCountFromServer } from '@angular/fire/firestore';
import { AbstractControl, AsyncValidator, ValidationErrors } from '@angular/forms';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Contract } from '@shared/classes/contract';
import { from, map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UniqueIdValidator implements AsyncValidator {
    private getContractType: () => string;

    constructor(
        private session: SessionInfo,
        private db: Firestore
    ) {}

    validate(control: AbstractControl): Observable<ValidationErrors | null> {
        const contractType = this.getContractType();

        const colQuery = query(Contract.getCollectionReference(this.db, this.session.getCompany()), where("type", "==", contractType), where("id", "==", control.value));
        return from(getCountFromServer(colQuery)).pipe(
            map((snap: any) => (snap.data().count as number)>0 ? {idIsTaken: true} : null)
        )
    }

    setGetterFunction(func: () => string): void {
        this.getContractType = func;
    }
}
