import { AngularFirestore, CollectionReference, DocumentData, DocumentReference, QueryDocumentSnapshot, SnapshotOptions } from "@angular/fire/compat/firestore";
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
    public deryWeightPercent: number;
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
        this.deryWeightPercent = data.deryWeightPercent;
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
                deryWeightPercent: data.deryWeightPercent,
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
                weight: data.weight
            }
        },
        fromFirestore(snapshot: QueryDocumentSnapshot<any>, options: SnapshotOptions): Ticket {
            return new Ticket(snapshot);
        }
    }

    getNet(): number{
        return this.gross - this.tare;
    }

    public getPlantReference() {
        return this.ref.parent.parent.withConverter(Plant.converter);
    }

    public getCollectionReference() {
        return this.ref.parent.withConverter(Ticket.converter);
    }

    public static getCollectionReference(db: AngularFirestore, company: string, plant: string): CollectionReference {
        return db.firestore.collection(`companies/${company}/plants/${plant}/tickets`).withConverter(Ticket.converter);
    }

    public static getDocReference(db: AngularFirestore, company: string, plant: string, ticket: string): DocumentReference {
        return db.firestore.doc(`companies/${company}/plants/${plant}/tickets/${ticket}`).withConverter(Ticket.converter);
    }
}
