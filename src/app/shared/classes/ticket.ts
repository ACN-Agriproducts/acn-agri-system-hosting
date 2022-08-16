import { Firestore, CollectionReference, DocumentData, DocumentReference, QueryDocumentSnapshot, SnapshotOptions, doc, query, QueryConstraint, getDocs, collectionData, collection, getDoc } from "@angular/fire/firestore";
import { getDownloadURL, ref, Storage } from "@angular/fire/storage";
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
    public lot: string;
    public moisture: number;
    public needsAttention: boolean;
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
        this.lot = data.lot;
        this.moisture = data.moisture;
        this.needsAttention = data.needsAttention;
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
                lot: data.lot,
                moisture: data.moisture,
                needsAttention: data.needsAttention,
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
        fromFirestore(snapshot: QueryDocumentSnapshot<DocumentData>, options: SnapshotOptions): Ticket {
            return new Ticket(snapshot);
        }
    }

    public getNet(): number{
        return this.gross - this.tare;
    }

    public getContract(db: Firestore): Promise<Contract> {
        const company = this.ref.parent.parent.parent.parent.id;

        return Contract.getDoc(db, company, this.in, this.contractID);
    }

    public getTransport(db: Firestore): Promise<Contact> {
        const company = this.ref.parent.parent.parent.parent.id;

        return Contact.getDoc(db, company, this.truckerId)
    }

    public getPlantReference(): DocumentReference<Plant> {
        return this.ref.parent.parent.withConverter(Plant.converter);
    }

    public getPlant(): Promise<Plant> {
        return getDoc(this.getPlantReference()).then(snap => {
            return snap.data();
        });
    }

    public getCollectionReference(): CollectionReference<Ticket> {
        return this.ref.parent.withConverter(Ticket.converter);
    }

    public async getPdfLink(storage: Storage): Promise<string> {
        if(!this.pdfLink) return "";
        
        return getDownloadURL(ref(storage, this.pdfLink));
    }

    public async getImageLinks(storage: Storage): Promise<string[]> {
        const promises = this.imageLinks.map(link => getDownloadURL(ref(storage, link)))
        return Promise.all(promises);
    }

    /**
     * 
     * @param db - Firestore instance
     * @returns A promise to return an array containing [Ticket, Contract, Transport, Client]
     */
    public async getPrintDocs(db: Firestore): Promise<[Ticket, Contract, Contact, Contact]> {
        const contract = await this.getContract(db);
        const transport = await this.getTransport(db);
        const client = await contract.getClient();

        return [this, contract, transport, client];
    }

    public static getCollectionReference(db: Firestore, company: string, plant: string): CollectionReference<Ticket> {
        return collection(db, `companies/${company}/plants/${plant}/tickets`).withConverter(Ticket.converter);
    }

    public static getDocReference(db: Firestore, company: string, plant: string, ticket: string): DocumentReference<Ticket> {
        return doc(db, `companies/${company}/plants/${plant}/tickets/${ticket}`).withConverter(Ticket.converter);
    }

    /**
     * Returns Documents from the chosen Tickets collection
     * 
     * @param db - Your Firestore instance
     * @param company - Company from which you want to query the tickets from
     * @param plant - Plant from which you want to query the tickets from
     * @param queryFn - Query function for the collection
     */ 
    public static async getTickets(db: Firestore, company: string, plant: string): Promise<Ticket[]>;
    public static async getTickets(db: Firestore, company: string, plant: string, ...constraints: QueryConstraint[]): Promise<Ticket[]>;
    public static async getTickets(db: Firestore, company: string, plant: string, ...constraints: QueryConstraint[]): Promise<Ticket[]> {
        const collectionReference = query(Ticket.getCollectionReference(db, company, plant), ...constraints);

        const ticketCollectionData = await getDocs(collectionReference);
        return ticketCollectionData.docs.map(snap => snap.data());
    }

    public static getTicketSnapshot(db: Firestore, company: string, plant: string, ...constraints: QueryConstraint[]): Observable<Ticket[]> {
        const collectionQuery = query(Ticket.getCollectionReference(db, company, plant), ...constraints);
        return collectionData(collectionQuery);
    }
}
