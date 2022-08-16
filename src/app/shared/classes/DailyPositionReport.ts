import { getDoc } from "@angular/fire/firestore";
import { DocumentReference, QueryDocumentSnapshot, SnapshotOptions } from "firebase/firestore";
import { DocumentData } from "rxfire/firestore/interfaces";
import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { Invoice } from "./invoice";
import { Ticket } from "./ticket";

export class DailyPositionReport extends FirebaseDocInterface {
    month: number;
    year: number;
    product: string;
    startingInventory: number;
    endingInventory: number;
    tickets: Map<number, DPRDay>;
    startingOpenStorage: number;
    endingOpenStorage: number;
    startingWarehouseReceipt: number;

    constructor(snapshot: QueryDocumentSnapshot<any>) {
        super(snapshot, DailyPositionReport.converter);
        const data = snapshot.data();

        this.month = data.month;
        this.year = data.year;
        this.product = data.product;
        this.startingInventory = data.startingInventory;
        this.endingInventory = data.endingInventory;
        this.startingOpenStorage = data.startingOpenStorage;
        this.endingOpenStorage = data.endingOpenStorage;
        this.startingWarehouseReceipt = data.startingWarehouseReceipt;

        this.tickets = new Map<number, DPRDay>();
        for(const key in data.tickets) {
            this.tickets.set(Number.parseInt(key), new DPRDay(data.tickets[key]));
        }
    }

    public static converter = {
        toFirestore(data: DailyPositionReport): DocumentData {
            return {
                month: data.month,
                year: data.year,
                product: data.product,
                startingInventory: data.startingInventory,
                endingInventory: data.endingInventory,
                tickets: data.tickets,
                startingOpenStorage: data.startingOpenStorage,
                endingOpenStorage: data.endingOpenStorage,
                startingWarehouseReceipt: data.startingWarehouseReceipt,
            }
        },
        fromFirestore(snapshot: QueryDocumentSnapshot<DocumentData>, options: SnapshotOptions): DailyPositionReport {
            return new DailyPositionReport(snapshot);
        }
    }
}

export class DPRDay {
    inQuantity: number;
    inTickets: DocumentReference<Ticket>[];
    invoices: DocumentReference<Invoice>[];
    outQuantity: number;
    outTickets: DocumentReference<Ticket>[];
    issuedWarehouseReceipt: number;
    cancelledWarehouseReceipt: number;
    increaseStorageLiability: number;
    decreaseStorageLiability: number;

    constructor(data: DPRDayConstructorData){
        this.inQuantity = data.inQuantity;
        this.inTickets = data.inTickets.map(ref => ref.withConverter(Ticket.converter));
        this.outTickets = data.outTickets.map(ref => ref.withConverter(Ticket.converter));
        this.invoices = data.invoices.map(ref => ref.withConverter(Invoice.converter));
        this.outQuantity = data.outQuantity;
        this.issuedWarehouseReceipt = data.issuedWarehouseReceipt;
        this.cancelledWarehouseReceipt = data.cancelledWarehouseReceipt;
        this.increaseStorageLiability = data.increaseStorageLiability;
        this.decreaseStorageLiability = data.decreaseStorageLiability;
    }

    public getInvoices(): Promise<Invoice[]> {
        return Promise.all(this.invoices.map(ref => getDoc(ref).then(doc => doc.data())));
    }

    public getInTickets(): Promise<Ticket[]> {
        return Promise.all(this.inTickets.map(ref => getDoc(ref).then(doc => doc.data())));
    }

    public getOutTickets(): Promise<Ticket[]> {
        return Promise.all(this.outTickets.map(ref => getDoc(ref).then(doc => doc.data())));
    }
}

interface DPRDayConstructorData {
    inTickets: DocumentReference[];
    outTickets: DocumentReference[];
    invoices: DocumentReference[];
    inQuantity: number;
    outQuantity: number;
    issuedWarehouseReceipt: number;
    cancelledWarehouseReceipt: number;
    increaseStorageLiability: number;
    decreaseStorageLiability: number;
}
