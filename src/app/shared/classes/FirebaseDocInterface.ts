import { AngularFirestore, DocumentReference, QueryDocumentSnapshot } from "@angular/fire/compat/firestore";

export abstract class FirebaseDocInterface {
    ref: DocumentReference;

    constructor(snapshot: QueryDocumentSnapshot<any>, converter: any) {
        this.ref = snapshot.ref.withConverter(converter);
    }

    public set(db: AngularFirestore): Promise<void> {
        return db.doc(this.ref).set(this);
    }

    public update(db: AngularFirestore, data: any): Promise<void> {
        return db.doc(this.ref).update(data);
    }

    public delete(): Promise<void> {
        return this.ref.delete();
    }
}