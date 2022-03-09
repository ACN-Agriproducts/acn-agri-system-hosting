import { AngularFirestore, DocumentReference, QueryDocumentSnapshot } from "@angular/fire/compat/firestore";

export abstract class FirebaseDocInterface {
    ref: DocumentReference;

    constructor(snapshot: QueryDocumentSnapshot<any>, converter: any) {
        this.ref = snapshot.ref.withConverter(converter);
    }

    public set(): Promise<void> {
        return this.ref.set(this);
    }

    public update(db: AngularFirestore, data: any): Promise<void> {
        return db.doc(this.ref.parent.doc(this.ref.id)).update(data);
    }

    public delete(): Promise<void> {
        return this.ref.delete();
    }
}