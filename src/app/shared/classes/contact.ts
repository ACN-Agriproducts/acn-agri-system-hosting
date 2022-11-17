import { Firestore, CollectionReference, DocumentData, DocumentReference, QueryDocumentSnapshot, SnapshotOptions, collection, doc, getDoc } from "@angular/fire/firestore";

import { FirebaseDocInterface } from "./FirebaseDocInterface";

export class Contact extends FirebaseDocInterface {
    caat: string;
    city: string;
    metaContacts: MetaContact[];
    name: string;
    state: string;
    streetAddress: string;
    tags: string[];
    zipCode: string;

    constructor(snapshot: QueryDocumentSnapshot<any>) {
        super(snapshot, Contact.converter);
        const data = snapshot.data();

        this.caat = data.caat;
        this.city = data.city;
        this.metaContacts = [];
        this.name = data.name;
        this.state = data.state;
        this.streetAddress = data.streetAddress;
        this.zipCode = data.zipCode;

        data.contacts.forEach(metaContact => {
            this.metaContacts.push(this.createMetaContact(metaContact));
        });
    }

    public static converter = {
        toFirestore(data: Contact): DocumentData {
            return {
                caat: data.caat, 
                city: data.city,
                metaContacts: data.metaContacts,
                name: data.name,
                state: data.state,
                streetAddress: data.streetAddress,
                zipCode: data.zipCode,
            };
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

    public createMetaContact(metaContact: any): MetaContact {
        return {
            email: metaContact.email,
            isPrimary: metaContact.isPrimary,
            name: metaContact.name,
            phone: metaContact.phone
        };
    }
}

interface MetaContact {
    email: string;
    isPrimary: boolean;
    name: string;
    phone: string;
}