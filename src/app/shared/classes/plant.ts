import { AngularFirestore, CollectionReference, DocumentData, DocumentReference, QueryDocumentSnapshot, SnapshotOptions } from "@angular/fire/compat/firestore";

import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { Ticket } from "./ticket";


export class Plant extends FirebaseDocInterface {
    public inventory: Inventory[];
    public inventoryNames: string[];
    public nextInTicket: number;
    public nextOutTicket: number;

    constructor(snapshot: QueryDocumentSnapshot<any>) {
        super(snapshot, Plant.converter);
        const data = snapshot.data();

        this.inventory = [];
        this.inventoryNames = data.inventoryNames;
        this.nextInTicket = data.nextInTicket;
        this.nextOutTicket = data.nextOutTicket;

        data.inventory.forEach(inv => {
            this.inventory.push(new Inventory(inv));
        });
    }

    public static converter = {
        toFirestore(data: Plant): DocumentData {
            return {
                inventory: data.inventory,
                inventoryNames: data.inventoryNames,
                nextInTicket: data.nextInTicket,
                nextOutTicket: data.nextOutTicket
            }
        },
        fromFirestore(snapshot: QueryDocumentSnapshot<any>, options: SnapshotOptions): Plant {
            return new Plant(snapshot);
        }
    }

    public getCollectionReference(): CollectionReference<Plant> {
        return this.ref.parent.withConverter(Plant.converter);
    }

    public getTicketCollectionReference(): CollectionReference<Ticket> {
        return this.ref.collection('tickets').withConverter(Ticket.converter);
    }

    public getTicketReference(ticket: string): DocumentReference<Ticket> {
        return this.ref.collection('tickets').doc(ticket).withConverter(Ticket.converter);
    }

    public static getCollectionReference(db: AngularFirestore, company: string): CollectionReference<Plant> {
        return db.firestore.collection(`companies/${company}/plants`).withConverter(Plant.converter);
    }

    public static getDocReference(db: AngularFirestore, company: string, plant: string): DocumentReference<Plant> {
        return db.firestore.doc(`companies/${company}/plants/${plant}`).withConverter(Plant.converter);
    }
}

class Inventory {
    current: number;
    max: number;
    name: string;
    product: DocumentReference;
    type: string

    constructor(inv: any) {
        this.current = inv.current;
        this.max = inv.max;
        this.name = inv.name;
        this.product = inv.product;
        this.type = inv.type;
    }
}