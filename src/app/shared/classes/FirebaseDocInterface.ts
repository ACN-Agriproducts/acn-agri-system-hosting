import { DocumentReference, QueryDocumentSnapshot, setDoc, updateDoc, deleteDoc } from "@angular/fire/firestore";
import { AngularFirestore } from "@angular/fire/compat/firestore";

export abstract class FirebaseDocInterface {
    ref: DocumentReference;

    constructor(snapshot: QueryDocumentSnapshot<any>, converter: any) {
        this.ref = snapshot.ref.withConverter(converter);
    }

    public set(): Promise<void> {
        return setDoc(this.ref, this);
    }

    public update(data: any): Promise<void> {
        return updateDoc(this.ref, data)
    }

    public delete(): Promise<void> {
        return deleteDoc(this.ref);
    }
}