import { collection, CollectionReference, doc, DocumentData, DocumentReference, Firestore, QueryDocumentSnapshot, SnapshotOptions, getDocs, docData, collectionData, getDoc } from "@angular/fire/firestore";
import { Observable } from "rxjs";

import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { Mass } from "./mass";
import { Ticket } from "./ticket";


export class Plant extends FirebaseDocInterface {
    public inventory: Inventory[];
    public inventoryNames: string[];
    public nextInTicket: number;
    public nextOutTicket: number;
    public lastStorageUpdate: DocumentReference;
    public address: string;

    constructor(snapshot: QueryDocumentSnapshot<DocumentData>) {
        super(snapshot, Plant.converter);
        const data = snapshot.data();

        this.inventory = [];
        this.inventoryNames = data.inventoryNames;
        this.nextInTicket = data.nextInTicket;
        this.nextOutTicket = data.nextOutTicket;
        this.lastStorageUpdate = data.lastStorageUpdate;
        this.address = data.address;

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
                nextOutTicket: data.nextOutTicket,
                lastStorageUpdate: data.lastStorageUpdate,
                address: data.address
            }
        },
        fromFirestore(snapshot: QueryDocumentSnapshot<any>, options: SnapshotOptions): Plant {
            return new Plant(snapshot);
        }
    }

    public getRawInventory() {
        const inventory = [];

        this.inventory.forEach(tank => {
            inventory.push(tank.getRawData());
        })

        return inventory;
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

    public static getPlant(db: Firestore, company: string, plant: string): Promise<Plant> {
        return getDoc(this.getDocReference(db, company, plant)).then(snap => {
            return snap.data();
        })
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
    current: Mass;
    max: Mass;
    name: string;
    product: DocumentReference;
    type: string

    constructor(inv: any) {
        this.current = new Mass(inv.current, FirebaseDocInterface.session.getDefaultUnit());
        this.max = new Mass(inv.max, FirebaseDocInterface.session.getDefaultUnit());
        this.name = inv.name;
        this.product = inv.product;
        this.type = inv.type;
    }

    public getRawData() {
        const data = {};
        
        Object.keys(this).forEach(key => {
            if(key === "current" || key === "max") {
                data[key] = this[key].get();
            }
            else {
                data[key] = this[key];
            }
        });

        return data;
    }
}