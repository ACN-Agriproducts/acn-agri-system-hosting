import { AngularFirestore, CollectionReference, DocumentData, DocumentReference, QueryDocumentSnapshot, SnapshotOptions } from "@angular/fire/compat/firestore";

export class Ticket {
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

    public ref: DocumentReference;

    constructor(snapshot: QueryDocumentSnapshot<any>) {
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

        this.ref = snapshot.ref;
    }

    public static ticketConverter = {
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

    public static getCollectionReference(db: AngularFirestore, company: string, plant: string): CollectionReference {
        return db.firestore.collection(`companies/${company}/plants/${plant}/tickets`).withConverter(Ticket.ticketConverter);
    }

    public set(db: AngularFirestore): Promise<void> {
        const data = {
            clientName: this.clientName,
            comment: this.comment,
            contractID: this.contractID,
            dateIn: this.dateIn,
            dateOut: this.dateOut,
            discount: this.discount,
            driver: this.driver,
            dryWeight: this.dryWeight,
            deryWeightPercent: this.deryWeightPercent,
            grade: this.grade,
            gross: this.gross,
            id: this.id,
            imageLinks: this.imageLinks,
            in: this.in,
            moisture: this.moisture,
            origin: this.origin,
            original_ticket: this.original_ticket,
            original_weight: this.original_weight,
            pdfLink: this.pdfLink,
            plague: this.plague,
            plates: this.plates,
            PPB: this.PPB,
            productName: this.productName,
            tank: this.tank,
            tankId: this.tankId,
            tare: this.tare,
            truckerId: this.truckerId,
            vehicleID: this.vehicleID,
            weight: this.weight,
        }

        return db.doc(this.ref).set(data);
    }

    public update(db: AngularFirestore, data: any): Promise<void> {
        return db.doc(this.ref).update(data);
    }

    public delete(): Promise<void> {
        return this.ref.delete();
    }
}
