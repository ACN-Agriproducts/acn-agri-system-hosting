import { Injectable } from "@angular/core";
import { AngularFirestoreCollection } from "@angular/fire/compat/firestore";
import { AbstractControl, AsyncValidator, ValidationErrors } from "@angular/forms";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })

export class UniqueContractId implements AsyncValidator{
    private getCollectionFunc: () => AngularFirestoreCollection;

    constructor() {}

    validate(
        control: AbstractControl
    ) : Promise<ValidationErrors | null> | Observable<ValidationErrors | null> 
    {
        const contractsCollections = this.getCollectionFunc();
        return contractsCollections.ref
            .where('id', '==', control.value)
            .limit(1)
            .get().then(result => {
                if(result.empty) {
                    return null;
                }
                else { 
                    return {UniqueId: true};
                }
            });
    }

    setGetterFunction(func: () => AngularFirestoreCollection): void {
        this.getCollectionFunc = func;
    }
}
