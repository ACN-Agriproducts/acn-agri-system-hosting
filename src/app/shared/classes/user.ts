import { doc, DocumentData, DocumentReference, Firestore, getDoc, QueryDocumentSnapshot, SnapshotOptions, collection } from "@angular/fire/firestore";
import { getDownloadURL, ref, Storage } from "@angular/fire/storage";
import { langOpts } from "@core/services/session-info/session-info.service";
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
    language: langOpts;

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
        this.language = data.language;
    }

    public static converter = {
        toFirestore(data: User): DocumentData {
            return {
                createdAt: data.createdAt,
                email: data.email,
                name: data.name,
                type: data.type,
                position: data.position,
                pictureURL: data.pictureURL,
                pictureRef: data.pictureRef,
                worksAt: data.worksAt,
                language: data.language,
                
            }
        },
        fromFirestore(snapshot:QueryDocumentSnapshot<any>, options: SnapshotOptions): User {
            return new User(snapshot);
        }
    }

    public getPictureURL(storage: Storage): Promise<string> {
        return getDownloadURL(ref(storage,this.pictureRef)).then(url => {
            this.pictureURL = url;
            return url;
        });
    }

    public getPermissions(company: string): Promise<any> {
        return getDoc(doc(collection(this.ref, 'companies'), company)).then(val => {
            return val.get('permissions');
        })
    }

    public static getDocumentReference(db: Firestore, userID: string): DocumentReference<User> {
        return doc(db, `users/${userID}`).withConverter(User.converter);
    }

    public static getUser(db: Firestore, userID: string): Promise<User> {
        return getDoc(this.getDocumentReference(db, userID)).then(val => {
            return val.data();
        });
    }

    public static getUserPermissions(db: Firestore, userID: string, company: string): Promise<any> {
        return getDoc(doc(collection(db, 'users', userID, company))).then(val => {
            return val.data();
        });
    }
}