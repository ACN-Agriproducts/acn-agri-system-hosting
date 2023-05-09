import { Firestore, CollectionReference, DocumentData, DocumentReference, QueryDocumentSnapshot, SnapshotOptions, collection, doc, getDoc, updateDoc } from "@angular/fire/firestore";
import { ContactInfo, Contract } from "./contract";


import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { Ticket } from "./ticket";

export class Contact extends FirebaseDocInterface {
    private _curp: string;
    public caat: string;
    public city: string;
    public metacontacts: MetaContact[];
    public name: string;
    public rfc: string;
    public state: string;
    public country: string;
    public streetAddress: string;
    public tags: string[];
    public zipCode: string;
    public notarialAct: string;
    public notarialActDate: Date;

    public bankInfo: BankInfo[];

    constructor(snapshot: QueryDocumentSnapshot<any> | ContactInfo, tags?: string[]) {
        if(!(snapshot instanceof QueryDocumentSnapshot)) {
            super(null, Contact.converter)

            this.metacontacts = [{
                email: snapshot.email,
                isPrimary: true,
                name:  snapshot.clientRep,
                phone: snapshot.phoneNumber
            }];

            this.bankInfo = [];
            this.caat = snapshot.caat;
            this.city = snapshot.city;
            this.name = snapshot.name;
            this.state = snapshot.state;
            this.country = snapshot.country;
            this.streetAddress = snapshot.streetAddress;
            this.zipCode = snapshot.zipCode;
            this.ref = snapshot.ref;
            this.rfc = snapshot.rfc;
            this._curp = snapshot.curp;
            this.notarialAct = snapshot.notarialAct;
            this.notarialActDate = snapshot.notarialActDate;
            this.tags = tags ?? [];
        }

        else {
            super(snapshot, Contact.converter);
            const data = snapshot.data();

            this.bankInfo = data.bankInfo ?? [];
            this._curp = data._curp;
            this.caat = data.caat;
            this.city = data.city;
            this.metacontacts = [];
            this.name = data.name;
            this.rfc = data.rfc;
            this.state = data.state;
            this.country = data.country;
            this.streetAddress = data.streetAddress;
            this.tags = data.tags;
            this.zipCode = data.zipCode;
            this.notarialAct = data.notarialAct;
            this.notarialActDate = data.notarialActDate.toDate();

            data.metacontacts?.forEach(metacontact => {
                this.metacontacts.push(this.createMetaContact(metacontact));
            });
        }
    }

    public static converter = {
        toFirestore(data: Contact): DocumentData {
            return {
                bankInfo: data.bankInfo,
                _curp: data._curp,
                caat: data.caat,
                city: data.city,
                metacontacts: data.metacontacts,
                name: data.name,
                rfc: data.rfc,
                state: data.state,
                country: data.country,
                streetAddress: data.streetAddress,
                tags: data.tags,
                zipCode: data.zipCode,
                notarialAct: data.notarialAct,
                notarialActDate: data.notarialActDate,
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

    public static updateRef(ref: DocumentReference, info: ContactInfo, bankInfo?: BankInfo[]) {
        let updateData: any = {
            caat: info.caat,
            city: info.city,
            name: info.name,
            state: info.state,
            streetAddress: info.streetAddress,
            zipCode: info.zipCode,
            ref: info.ref,
            rfc: info.rfc,
            _curp: info.curp,
            notarialAct: info.notarialAct,
            notarialActDate: info.notarialActDate,
        }

        if(bankInfo) updateData.bankInfo = bankInfo;

        updateDoc(ref, updateData);
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

export interface BankInfo {
    bank: string;
    account: string;
    interBank: string;
}