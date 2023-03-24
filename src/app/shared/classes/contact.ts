import { Firestore, CollectionReference, DocumentData, DocumentReference, QueryDocumentSnapshot, SnapshotOptions, collection, doc, getDoc } from "@angular/fire/firestore";
import { Contract } from "./contract";

import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { Ticket } from "./ticket";

export class Contact extends FirebaseDocInterface {
    private _curp: string;
    public caat: string;
    public city: string;
    public metacontacts: MetaContact[];
    public name: string;
    public publicDeedDate: Date;
    public publicDeedId: string;
    public rfc: string;
    public state: string;
    public streetAddress: string;
    public tags: string[];
    public zipCode: string;

    constructor(snapshot: QueryDocumentSnapshot<any>) {
        super(snapshot, Contact.converter);
        const data = snapshot.data();

        this._curp = data._curp;
        this.caat = data.caat;
        this.city = data.city;
        this.metacontacts = [];
        this.name = data.name;
        this.publicDeedDate = data.publicDeedDate;
        this.publicDeedId = data.publicDeedId;
        this.rfc = data.rfc;
        this.state = data.state;
        this.streetAddress = data.streetAddress;
        this.tags = data.tags;
        this.zipCode = data.zipCode;

        data.metacontacts?.forEach(metacontact => {
            this.metacontacts.push(this.createMetaContact(metacontact));
        });
    }

    public static converter = {
        toFirestore(data: Contact): DocumentData {
            return {
                _curp: data._curp,
                caat: data.caat,
                city: data.city,
                metacontacts: data.metacontacts,
                name: data.name,
                publicDeedDate: data.publicDeedDate,
                publicDeedId: data.publicDeedId,
                rfc: data.rfc,
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

    public getType(): string[] | null {
        const tagsInclude: string[] = [];

        if (this.tags.includes('client')) tagsInclude.push('client');
        if (this.tags.includes('trucker')) tagsInclude.push('trucker');

        if (tagsInclude.length === 0) {
            return null;
        }

        return tagsInclude;
    }

    public set curp(newCurp: string) {
        if (newCurp.length !== 18) {
            console.warn("CURP must be 18 digits");
            return;
        }
        this._curp = newCurp;
    }

    public get curp(): string {
        return this._curp;
    }
}

interface MetaContact {
    email: string;
    isPrimary: boolean;
    name: string;
    phone: string;
}