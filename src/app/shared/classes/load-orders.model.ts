import { DocumentData, DocumentReference, QueryDocumentSnapshot, SnapshotOptions } from "@angular/fire/firestore";
import { Contact } from "./contact";
import { Contract } from "./contract";
import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { Price } from "./price";
import { Ticket } from "./ticket";

export class LoadOrder extends FirebaseDocInterface {
    id: number;
    date: Date;
    contractRef: DocumentReference<Contract>;
    clientName: string;
    transportRef: DocumentReference<Contact>;
    transportName: string;
    status: 'pending' | 'closed';
    driver: string;
    freight: Price;
    plants: string[];
    carPlates: string;
    plates: string;
    ticketRef: DocumentReference<Ticket>;
    ticketID: number;

    constructor(snapshot: QueryDocumentSnapshot<any>);
    constructor(ref: DocumentReference<any>);
    constructor(snapshotOrRef: QueryDocumentSnapshot<any> | DocumentReference<any>) {
        let snapshot;
        if(snapshotOrRef instanceof QueryDocumentSnapshot) {
            snapshot = snapshotOrRef
        }
        
        super(snapshot, Ticket.converter);
        const data = snapshot?.data();

        if(!snapshotOrRef || snapshotOrRef instanceof DocumentReference) {
            return;
        }

        this.id = data.id;
        this.date = data.date;
        this.contractRef = data.contractRef.withConverter(Contract.converter);
        this.clientName = data.clientName;
        this.transportRef = data.transportRef.withConverter(Contact.converter);
        this.transportName = data.transportName;
        this.status = data.status;
        this.driver = data.driver;
        this.freight = new Price(data.freight, data.freightUnit);
        this.plants = data.plants;
        this.carPlates = data.carPlates;
        this.plates = data.plates;
        this.ticketRef = data.ticketRef.withConverter(Ticket.converter);
        this.ticketID = data.ticketID;
    }

    public static converter = {
        toFirestore(data: LoadOrder): DocumentData {
            return {
                id: data.id ?? null,
                date: data.date ?? null,
                contractRef: data.contractRef ?? null,
                clientName: data.clientName ?? null,
                transportRef: data.transportRef ?? null,
                transportName: data.transportName ?? null,
                status: data.status ?? null,
                driver: data.driver ?? null,
                freight: data.freight.amount ?? null,
                freightUnit: data.freight.unit ?? null,
                plants: data.plants ?? null,
                carPlates: data.carPlates ?? null,
                plates: data.plates ?? null,
                ticketRef: data.ticketRef ?? null,
                ticketID: data.ticketID ?? null,
            };
        },
        fromFirestore(snapshot: QueryDocumentSnapshot<DocumentData>, options: SnapshotOptions): LoadOrder {
            return new LoadOrder(snapshot);
        }
    }
}