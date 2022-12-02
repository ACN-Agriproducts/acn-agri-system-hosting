import { Firestore, CollectionReference, DocumentData, DocumentReference, QueryDocumentSnapshot, SnapshotOptions, collection, doc, getDoc } from "@angular/fire/firestore";
import { Contract } from "./contract";

import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { Ticket } from "./ticket";

export class Contact extends FirebaseDocInterface {
    caat: string;
    city: string;
    metacontacts: MetaContact[];
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
        this.metacontacts = [];
        this.name = data.name;
        this.state = data.state;
        this.streetAddress = data.streetAddress;
        this.tags = data.tags;
        this.zipCode = data.zipCode;

        data.metacontacts.forEach(metacontact => {
            this.metacontacts.push(this.createMetaContact(metacontact));
        });
    }

    public static converter = {
        toFirestore(data: Contact): DocumentData {
            return {
                caat: data.caat, 
                city: data.city,
                metacontacts: data.metacontacts,
                name: data.name,
                state: data.state,
                streetAddress: data.streetAddress,
                tags: data.tags,
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

    public createMetaContact(metacontact: any): MetaContact {
        return {
            email: metacontact.email,
            isPrimary: metacontact.isPrimary,
            name: metacontact.name,
            phone: metacontact.phone
        };
    }

    public getPrimaryMetaContact(): MetaContact {
        return this.metacontacts.find(metacontact => metacontact.isPrimary);
    }

    public getType(): string | null {
        return this.tags.includes('client') ? "client" :
            this.tags.includes('trucker') ? "trucker" : null;
    }
}

interface MetaContact {
    email: string;
    isPrimary: boolean;
    name: string;
    phone: string;
}