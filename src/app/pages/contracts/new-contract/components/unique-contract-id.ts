import { Injectable } from "@angular/core";
import { AbstractControl, AsyncValidator, ValidationErrors } from "@angular/forms";
import { Observable } from "rxjs";
import { CollectionReference, getDocs, limit, query, where } from '@angular/fire/firestore'

@Injectable({ providedIn: 'root' })

export class UniqueContractId implements AsyncValidator{
    private getCollectionFunc: () => CollectionReference;

    constructor() {}

    validate(
        control: AbstractControl
    ) : Promise<ValidationErrors | null> | Observable<ValidationErrors | null> 
    {
        const contractsCollections = this.getCollectionFunc();
        return getDocs(query(contractsCollections, 
            where('id', '==', control.value),
            limit(1)))
            .then(result => {
                if(result.empty) {
                    return null;
                }
                else { 
                    return {UniqueId: true};
                }
            });
    }

    setGetterFunction(func: () => CollectionReference): void {
        this.getCollectionFunc = func;
    }
}
