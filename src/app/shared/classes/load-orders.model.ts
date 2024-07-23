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
    status: string;
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

        if(snapshotOrRef instanceof DocumentReference) {
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
                id: data.id,
                date: data.date,
                contractRef: data.contractRef,
                clientName: data.clientName,
                transportRef: data.transportRef,
                transportName: data.transportName,
                status: data.status,
                driver: data.driver,
                freight: data.freight.amount,
                freightUnit: data.freight.unit,
                plants: data.plants,
                carPlates: data.carPlates,
                plates: data.plates,
                ticketRef: data.ticketRef,
                ticketID: data.ticketID,
            };
        },
        fromFirestore(snapshot: QueryDocumentSnapshot<DocumentData>, options: SnapshotOptions): LoadOrder {
            return new LoadOrder(snapshot);
        }
    }
}