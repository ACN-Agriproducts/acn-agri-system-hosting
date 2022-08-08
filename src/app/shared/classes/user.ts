import { CollectionReference, doc, DocumentData, DocumentReference, DocumentSnapshot, Firestore, QueryDocumentSnapshot, QuerySnapshot, SnapshotOptions } from "@angular/fire/firestore";
import { AngularFireStorage } from "@angular/fire/compat/storage";
import { FirebaseDocInterface } from "./FirebaseDocInterface";

export class User extends FirebaseDocInterface {
    name: string;
    createdAt: Date;
    type: string;
    position: string;
    email: string;
    pictureURL: string;
    pictureRef: string;
    worksAt: string[];

    constructor(snapshotOrData: QueryDocumentSnapshot<any> | any) {
        super(snapshotOrData, User.converter);
        let data;

        if('metadata' in snapshotOrData) data = snapshotOrData.data();
        else data = snapshotOrData;

        this.name = data.name;
        this.createdAt = data.createdAt;
        this.type = data.type;
        this.position = data.position;
        this.email = data.email;
        this.pictureRef = data.pictureURL;
        this.worksAt = data.worksAt;
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
        return store.ref(this.pictureRef).getDownloadURL().toPromise().then(url => {
            this.pictureURL = url;
            return url;
        });
    }

    public static getDocumentReference(db: Firestore, userID: string) {
        return doc(db, `users/${userID}`);
    }
}