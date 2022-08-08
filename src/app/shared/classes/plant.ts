import { collection, CollectionReference, doc, DocumentData, DocumentReference, Firestore, QueryDocumentSnapshot, SnapshotOptions, getDocs, docData, collectionData } from "@angular/fire/firestore";
import { Observable } from "rxjs";

import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { Ticket } from "./ticket";


export class Plant extends FirebaseDocInterface {
    public inventory: Inventory[];
    public inventoryNames: string[];
    public nextInTicket: number;
    public nextOutTicket: number;

    constructor(snapshot: QueryDocumentSnapshot<DocumentData>) {
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
        return collection(this.ref, 'tickets').withConverter(Ticket.converter) as CollectionReference<Ticket>;
    }

    public getTicketReference(ticket: string): DocumentReference<Ticket> {
        return doc(this.ref, `tickets/${ticket}`).withConverter(Ticket.converter);
        
    }

    public static getCollectionReference(db: Firestore, company: string): CollectionReference<Plant> {
        return collection(db, `companies/${company}/plants`).withConverter(Plant.converter);
    }

    public static getDocReference(db: Firestore, company: string, plant: string): DocumentReference<Plant> {
        return doc(db, `companies/${company}/plants/${plant}`).withConverter(Plant.converter) as DocumentReference<Plant>;
    }

    public static getPlantList(db: Firestore, company: string): Promise<Plant[]> {
        return getDocs(Plant.getCollectionReference(db, company)).then(result => {
            const plantList: Plant[] = [];

            result.docs.forEach(doc => {
                plantList.push(doc.data());
            });

            return plantList;
        });
    }

    public static getPlantSnapshot(db: Firestore, company: string, plant: string): Observable<Plant> {
        return docData(Plant.getDocReference(db, company, plant))
    }

    public static getCollectionSnapshot(db: Firestore, company: string): Observable<Plant[]> {
        return collectionData(Plant.getCollectionReference(db, company));
    }
}

export class Inventory {
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