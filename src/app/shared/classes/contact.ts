import { Firestore, CollectionReference, DocumentData, DocumentReference, QueryDocumentSnapshot, SnapshotOptions, collection, doc, getDoc } from "@angular/fire/firestore";
import { Contract } from "./contract";

import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { Ticket } from "./ticket";

export class Contact extends FirebaseDocInterface {
    caat: string;
    city: string;
    email: string;
    name: string;
    phoneNumber: string;
    state: string;
    streetAddress: string;
    type: string;
    zipCode: string;

    constructor(snapshot: QueryDocumentSnapshot<any>) {
        super(snapshot, Contact.converter);
        const data = snapshot.data();

        this.caat = data.caat;
        this.city = data.city;
        this.email = data.email;
        this.name = data.name;
        this.phoneNumber = data.phoneNumber;
        this.state = data.state;
        this.streetAddress = data.streetAddress;
        this.type = data.type;
        this.zipCode = data.zipCode;
    }

    public static converter = {
        toFirestore(data: Contact): DocumentData {
            return {
                caat: data.caat, 
                city: data.city,
                email: data.email,
                name: data.name,
                phoneNumber: data.phoneNumber,
                state: data.state,
                streetAddress: data.streetAddress,
                type: data.type,
                zipCode: data.zipCode,
            }
        },
        fromFirestore(snapshot: QueryDocumentSnapshot<any>, options: SnapshotOptions): Contact {
            return new Contact(snapshot);
        }
    };

    public getCollectionReference(): CollectionReference<Contact> {
        return this.ref.parent.withConverter(Contact.converter);
    }

    public static getCollectionReference(db: Firestore, company: string): CollectionReference<Contact> {
        return collection(db, `companies/${company}/directory`).withConverter(Contact.converter);
    }

    public static getDocReference(db: Firestore, company: string, contact: string): DocumentReference<Contact> {
        return doc(db, `companies/${company}/directory/${contact}`).withConverter(Contact.converter);
    }

    public static getDoc(db: Firestore, company: string, contact: string): Promise<Contact> {
        return getDoc(Contact.getDocReference(db, company, contact)).then(result => {
            return result.data();
        });
    }
}