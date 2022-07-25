import { AngularFirestore, CollectionReference, DocumentData, DocumentReference, DocumentSnapshot, QueryDocumentSnapshot, QuerySnapshot, SnapshotOptions } from "@angular/fire/compat/firestore";
import { AngularFireStorage } from "@angular/fire/compat/storage";
import { FirebaseDocInterface } from "./FirebaseDocInterface";

export class User extends FirebaseDocInterface {
    name: string;
    createdAt: Date;
    type: string;
    position: string;
    email: string;
    pictureURL: string;
    worksAt: string[];

    constructor(snapshot: QueryDocumentSnapshot<any>) {
        super(snapshot, User.converter);
    }

    constructor(data: any) {
        super(data, User.converter)
    }

    public static converter = {
        toFirestore(data: User): DocumentData {
            return {
                createdAt: this.createdAt,
                email: this.email,
                name: this.name,
            }
        },
        fromFirestore(snapshot:QueryDocumentSnapshot<any>, options: SnapshotOptions): User {
            return new User(snapshot);
        }
    }

    public getPictureURL(store: AngularFireStorage): Promise<string> {
        return store.ref(this.pictureURL).getDownloadURL().toPromise();
    }

    public static getDocumentReference(db: AngularFirestore, userID: string) {
        return db.firestore.doc(`users/${userID}`);
    }
}