import { AngularFirestore, CollectionReference, DocumentChangeAction, DocumentData, DocumentReference, Query, QueryDocumentSnapshot, SnapshotOptions } from "@angular/fire/compat/firestore";
import { Observable } from "rxjs";
import { Contact } from "./contact";
import { Contract } from "./contract";
import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { Plant } from "./plant";

export class Ticket extends FirebaseDocInterface{
    public clientName: string;
    public comment: string;
    public contractID: number;
    public dateIn: Date;
    public dateOut: Date;
    public discount: number;
    public driver: string;
    public dryWeight: number;
    public dryWeightPercent: number;
    public grade: number;
    public gross: number;
    public id: number;
    public imageLinks: string[];
    public in: boolean;
    public moisture: number;
    public origin: string;
    public original_ticket: string;
    public original_weight: number;
    public pdfLink: string;
    public plague: string;
    public plates: string;
    public PPB: number;
    public productName: string;
    public tank: string;
    public tankId: number;
    public tare: number;
    public truckerId: string;
    public vehicleID: string;
    public void: boolean;
    public voidAcceptor: string;
    public voidReason: string;
    public voidRequest: boolean;
    public voidRequester: string;
    public weight: number;

    constructor(snapshot: QueryDocumentSnapshot<any>) {
        super(snapshot, Ticket.converter);

        const data = snapshot.data();

        this.clientName = data.clientName;
        this.comment = data.comment;
        this.contractID = data.contractID;
        this.dateIn = data.dateIn.toDate();
        this.dateOut = data.dateOut.toDate();
        this.discount = data.discount;
        this.driver = data.driver;
        this.dryWeight = data.dryWeight;
        this.dryWeightPercent = data.dryWeightPercent;
        this.grade = data.grade;
        this.gross = data.gross;
        this.id = data.id;
        this.imageLinks = data.imageLinks;
        this.in = data.in;
        this.moisture = data.moisture;
        this.origin = data.origin;
        this.original_ticket = data.original_ticket;
        this.original_weight = data.original_weight;
        this.pdfLink = data.pdfLink;
        this.plague = data.plague;
        this.plates = data.plates;
        this.PPB = data.PPB;
        this.productName = data.productName;
        this.tank = data.tank;
        this.tankId = data.tankId;
        this.tare = data.tare;
        this.truckerId = data.truckerId;
        this.vehicleID = data.vehicleID;
        this.void = data.void;
        this.voidAcceptor =  data.voidAcceptor;
        this.voidReason = data.voidReason;
        this.voidRequest = data.voidRequest;
        this.voidRequester = data.voidRequester;
        this.weight = data.weight;
    }

    public static converter = {
        toFirestore(data: Ticket): DocumentData {
            return {
                clientName: data.clientName,
                comment: data.comment,
                contractID: data.contractID,
                dateIn: data.dateIn,
                dateOut: data.dateOut,
                discount: data.discount,
                driver: data.driver,
                dryWeight: data.dryWeight,
                dryWeightPercent: data.dryWeightPercent,
                grade: data.grade,
                gross: data.gross,
                id: data.id,
                imageLinks: data.imageLinks,
                in: data.in,
                moisture: data.moisture,
                origin: data.origin,
                original_ticket: data.original_ticket,
                original_weight: data.original_weight,
                pdfLink: data.pdfLink,
                plague: data.plague,
                plates: data.plates,
                PPB: data.PPB,
                productName: data.productName,
                tank: data.tank,
                tankId: data.tankId,
                tare: data.tare,
                truckerId: data.truckerId,
                vehicleID: data.vehicleID,
                void: data.void,
                voidAcceptor: data.voidAcceptor,
                voidReason: data.voidReason,
                voidRequest: data.voidRequest,
                voidRquester: data.voidRequester,
                weight: data.weight
            }
        },
        fromFirestore(snapshot: QueryDocumentSnapshot<any>, options: SnapshotOptions): Ticket {
            return new Ticket(snapshot);
        }
    }

    public getNet(): number{
        return this.gross - this.tare;
    }

    public getContract(db: AngularFirestore): Promise<Contract> {
        const company = this.ref.parent.parent.parent.parent.id;

        return Contract.getDoc(db, company, this.in, this.contractID);
    }

    public getTransport(db: AngularFirestore): Promise<Contact> {
        const company = this.ref.parent.parent.parent.parent.id;

        return Contact.getDoc(db, company, this.truckerId)
    }

    public getPlantReference(): DocumentReference<Plant> {
        return this.ref.parent.parent.withConverter(Plant.converter);
    }

    public getCollectionReference(): CollectionReference<Ticket> {
        return this.ref.parent.withConverter(Ticket.converter);
    }

    public async getPrintDocs(db: AngularFirestore): Promise<[Ticket, Contract, Contact, Contact]> {
        const contract = await this.getContract(db);
        const transport = await this.getTransport(db);
        const client = await contract.getClient();

        return [this, contract, transport, client];
    }

    public static getCollectionReference(db: AngularFirestore, company: string, plant: string): CollectionReference<Ticket> {
        return db.firestore.collection(`companies/${company}/plants/${plant}/tickets`).withConverter(Ticket.converter);
    }

    public static getDocReference(db: AngularFirestore, company: string, plant: string, ticket: string): DocumentReference<Ticket> {
        return db.firestore.doc(`companies/${company}/plants/${plant}/tickets/${ticket}`).withConverter(Ticket.converter);
    }

    /**
     * Returns Documents from the chosen Tickets collection
     * 
     * @param db - Your AngularFirestore instance
     * @param company - Company from which you want to query the tickets from
     * @param plant - Plant from which you want to query the tickets from
     * @param queryFn - Query function for the collection
     */ 
    public static async getTickets(db: AngularFirestore, company: string, plant: string): Promise<Ticket[]>;
    public static async getTickets(db: AngularFirestore, company: string, plant: string, queryFn: <T>(q:CollectionReference<T>) => Query<T>): Promise<Ticket[]>;
    public static async getTickets(db: AngularFirestore, company: string, plant: string, queryFn: <T>(q:CollectionReference<T>) => Query<T> = q => q): Promise<Ticket[]> {
        const collectionReference = queryFn(Ticket.getCollectionReference(db, company, plant));

        const ticketCollectionSnapshot = await collectionReference.get();
        return ticketCollectionSnapshot.docs.map(snap => snap.data());
    }

    public static getTicketSnapshot(db: AngularFirestore, company: string, plant: string, queryFn: <T>(q:CollectionReference<T>) => Query<T> = q => q): Observable<Ticket[]> {
        return db.collection<Ticket>(Ticket.getCollectionReference(db, company, plant), queryFn).valueChanges();
    }
}
