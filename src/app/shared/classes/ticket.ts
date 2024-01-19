
import { Firestore, CollectionReference, DocumentData, DocumentReference, QueryDocumentSnapshot, SnapshotOptions, doc, query, QueryConstraint, getDocs, collectionData, collection, getDoc, Query, getCountFromServer, where, limit, orderBy } from "@angular/fire/firestore";
import { Injectable } from "@angular/core";
import { getDownloadURL, ref, Storage } from "@angular/fire/storage";
import { Observable } from "rxjs";
import { Contact } from "./contact";
import { Contract, ProductInfo } from "./contract";
import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { Mass, units } from "./mass";
import { Plant } from "./plant";
import { DiscountTables } from "./discount-tables";
import { Product } from "./product";

type TicketStatus = "none" | "closed" | "active" | "pending" | "paid";
type TicketType = "in" | "out" | "service";

export class Ticket extends FirebaseDocInterface{
    public brokenGrain: number;
    public clientName: string;
    public comment: string;
    public contractID: number;
    public damagedGrain: number;
    public dateIn: Date;
    public dateOut: Date;
    public discount: number;
    public driver: string;
    public dryWeight: Mass;
    public dryWeightPercent: number;
    public foreignMatter: number;
    public grade: number;
    public gross: Mass;
    public id: number;
    public displayId: string;
    public imageLinks: string[];
    public impurities: number;
    public in: boolean;
    public lot: string;
    public moisture: number;
    public needsAttention: boolean;
    public net: Mass;
    public origin: string;
    public original_ticket: string;
    public original_weight: Mass;
    public pdfLink: string;
    public plague: string;
    public plates: string;
    public PPB: number;
    public priceDiscounts: PriceDiscounts;
    public productName: string;
    public status: TicketStatus;
    public tank: string;
    public tankId: number;
    public tare: Mass;
    public truckerId: string;
    public vehicleID: string;
    public void: boolean;
    public voidAcceptor: string;
    public voidReason: string;
    public voidRequest: boolean;
    public voidRequester: string;
    public voidDate: Date;
    public weight: number;
    public weightDiscounts: WeightDiscounts;

    public contractRef: DocumentReference<Contract>;

    public clientRef: DocumentReference<Contact>;
    public clientStreetAddress: string;
    public clientCity: string;
    public clientState: string;
    public clientZipCode: string;

    public transportName: string;
    public transportStreetAddress: string;
    public transportCity: string;
    public transportState: string;
    public transportZipCode: string;
    public transportCaat: string;

    public subId: string;
    public moneyDiscounts: MoneyDiscounts;
    public type: TicketType;

    constructor(snapshot: QueryDocumentSnapshot<any>);
    constructor(ref: DocumentReference<any>);
    constructor(snapshotOrRef: QueryDocumentSnapshot<any> | DocumentReference<any>) {
        let snapshot;
        if(snapshotOrRef instanceof QueryDocumentSnapshot) {
            snapshot = snapshotOrRef
        }
        
        super(snapshot, Ticket.converter);
        const data = snapshot?.data();
        const unit = FirebaseDocInterface.session.getDefaultUnit();

        if(snapshotOrRef instanceof DocumentReference) {
            this.ref = snapshotOrRef;
            this.gross = new Mass(null, unit);
            this.tare = new Mass(null, unit);
            this.net = new Mass(null, unit);
            this.dryWeight = new Mass(null, unit);
            this.weightDiscounts = new WeightDiscounts();
            this.original_weight = new Mass(null, unit);
            this.dateIn = new Date();
            this.status = "pending";

            return;
        }

        this.brokenGrain = data.brokenGrain;
        this.clientName = data.clientName;
        this.comment = data.comment;
        this.contractID = data.contractID;
        this.damagedGrain = data.damagedGrain;
        this.dateIn = data.dateIn.toDate();
        this.dateOut = data.dateOut?.toDate();
        this.discount = data.discount;
        this.driver = data.driver ?? '';
        this.dryWeight = new Mass(data.dryWeight, unit);
        this.dryWeightPercent = data.dryWeightPercent;
        this.foreignMatter = data.foreignMatter;
        this.grade = data.grade;
        this.gross = new Mass(data.gross, unit);
        this.id = data.id; 
        this.displayId = data.id + (data.subId ? "-" + data.subId : '')
        this.imageLinks = data.imageLinks;
        this.impurities = data.impurities;
        this.in = data.in;
        this.lot = data.lot;
        this.moisture = data.moisture;
        this.needsAttention = data.needsAttention;
        this.origin = data.origin;
        this.original_ticket = data.original_ticket;
        this.original_weight = new Mass(data.original_weight, unit);
        this.pdfLink = data.pdfLink;
        this.plague = data.plague;
        this.plates = data.plates;
        this.PPB = data.PPB;
        this.priceDiscounts = new PriceDiscounts(data.priceDiscounts);
        this.productName = data.productName;
        this.status = data.status ?? "closed";
        this.tank = data.tank;
        this.tankId = data.tankId;
        this.tare = new Mass(data.tare, unit);
        this.truckerId = data.truckerId;
        this.vehicleID = data.vehicleID;
        this.void = data.void;
        this.voidAcceptor =  data.voidAcceptor;
        this.voidReason = data.voidReason;
        this.voidRequest = data.voidRequest;
        this.voidRequester = data.voidRequester;
        this.voidDate = data.voidDate?.toDate() ?? null;
        this.weight = data.weight;
        this.weightDiscounts = new WeightDiscounts(data.weightDiscounts);

        this.contractRef = data.contractRef?.withConverter(Contract.converter) || null;

        this.clientRef = data.clientRef;
        this.clientStreetAddress = data.clientStreetAddress;
        this.clientCity = data.clientCity;
        this.clientState = data.clientState;
        this.clientZipCode = data.clientZipCode;

        this.transportName = data.transportName;
        this.transportStreetAddress = data.transportStreetAddress;
        this.transportCity = data.transportCity;
        this.transportState = data.transportState;
        this.transportZipCode = data.transportZipCode;
        this.transportCaat = data.transportCaat;

        this.subId = data.subId;
        this.moneyDiscounts = data.moneyDiscounts ?? {};
        this.type = data.type ?? data.in ? 'in' : 'out';

        this.net = this.gross.subtract(this.tare);
    }

    public static converter = {
        toFirestore(data: Ticket): DocumentData {
            return {
                brokenGrain: data.brokenGrain ?? null,
                clientName: data.clientName ?? null,
                comment: data.comment ?? null,
                contractID: data.contractID ?? null,
                damagedGrain: data.damagedGrain ?? null,
                dateIn: data.dateIn ?? null,
                dateOut: data.dateOut ?? null,
                discount: data.discount ?? null,
                driver: data.driver ?? null,
                dryWeight: data.dryWeight?.get() ?? null,
                dryWeightPercent: data.dryWeightPercent ?? null,
                foreignMatter: data.foreignMatter ?? null,
                grade: data.grade ?? null,
                gross: data.gross?.get() ?? null,
                id: data.id ?? null,
                imageLinks: data.imageLinks ?? null,
                impurities: data.impurities ?? null,
                in: data.in ?? null,
                lot: data.lot ?? null,
                moisture: data.moisture ?? null,
                needsAttention: data.needsAttention ?? null,
                origin: data.origin ?? null,
                original_ticket: data.original_ticket ?? null,
                original_weight: data.original_weight?.get() ?? null,
                pdfLink: data.pdfLink ?? null,
                plague: data.plague ?? null,
                plates: data.plates ?? null,
                PPB: data.PPB ?? null,
                //priceDiscounts: data.priceDiscounts ?? null,
                productName: data.productName ?? null,
                status: data.status ?? null,
                tank: data.tank ?? null,
                tankId: data.tankId ?? null,
                tare: data.tare?.get() ?? null,
                truckerId: data.truckerId ?? null,
                vehicleID: data.vehicleID ?? null,
                void: data.void ?? null,
                voidAcceptor: data.voidAcceptor ?? null,
                voidReason: data.voidReason ?? null,
                voidRequest: data.voidRequest ?? null,
                voidRquester: data.voidRequester ?? null,
                voidDate: data.voidDate ?? null,
                weight: data.weight ?? null,
                //weightDiscounts: data.weightDiscounts ?? null,

                contractRef: data.contractRef ?? null,

                clientRef: data.clientRef ?? null,
                clientStreetAddress: data.clientStreetAddress ?? null,
                clientCity: data.clientCity ?? null,
                clientState: data.clientState ?? null,
                clientZipCode: data.clientZipCode ?? null,
                
                transportName: data.transportName ?? null,
                transportStreetAddress: data.transportStreetAddress ?? null,
                transportCity: data.transportCity ?? null,
                transportState: data.transportState ?? null,
                transportZipCode: data.transportZipCode ?? null,
                transportCaat: data.transportCaat ?? null,

                subId: data.subId ?? null,
                moneyDiscounts: data.moneyDiscounts ?? null,
                type: data.type ?? null,

            }
        },
        fromFirestore(snapshot: QueryDocumentSnapshot<DocumentData>, options: SnapshotOptions): Ticket {
            return new Ticket(snapshot);
        }
    }

    public getNet(): Mass{
        return new Mass(this.gross.get() - this.tare.get(), this.gross.getUnit());
    }

    public getContractType(): string { 
        return this.in? "purchaseContracts" : "salesContracts";
    }

    public getContract(db: Firestore): Promise<Contract> {
        const company = this.ref.parent.parent.parent.parent.id;
        const contractColRef = Contract.getCollectionReference(db, company);

        return this.contractRef ? getDoc(this.contractRef).then(res => res.data()) 
            : getDocs(query(contractColRef, where('tickets', 'array-contains', this.ref), limit(1))).then(result => result.docs[0].data());
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

    public getGenericCopy(): any { 
        const copy: any = {};

        Object.keys(this).forEach(key => {
            if(key == 'ref' || key == 'snapshot' || key == 'net') return;
            copy[key] = this[key] instanceof Mass ? this[key].get() : this[key] ?? null;
        });

        return copy;
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
        const client = await contract.getTicketClient();

        return [this, contract, transport, client];
    }

    public static getCollectionReference(db: Firestore, company: string, plant: string, ...constraints: QueryConstraint[]): Query<Ticket> {
        return query(collection(db, `companies/${company}/plants/${plant}/tickets`), ...constraints).withConverter(Ticket.converter);
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

    public static async getTicketCount(db: Firestore, company: string, plant: string, ...constraints: QueryConstraint[]): Promise<number> {
        const ticketCollQuery = query(Ticket.getCollectionReference(db, company, plant), ...constraints);
        const ticketSnapshot = await getCountFromServer(ticketCollQuery);

        return ticketSnapshot.data().count;
    }

    public static async getActiveTickets(db: Firestore, company: string, plant: string): Promise<Ticket[]> {
        const ticketQuery = Ticket.getCollectionReference(db, company, plant, where('status', '==', 'active'));
        return getDocs(ticketQuery).then(result => {
            return result.docs.map(t => t.data()).sort((a,b) => a.dateIn.getTime() - b.dateIn.getTime());
        });
    }


    public getWeightDiscounts(discountTables: DiscountTables) {
        this.weightDiscounts.getDiscounts(this, discountTables);
    }

    public defineBushels(product: Product | ProductInfo) {
        Object.keys(this).forEach(key => {
            if (this[key] instanceof Mass) {
                (this[key] as Mass).defineBushels(product);
            }
        });
        this.weightDiscounts.defineBushels(product);
    }
}

export class PriceDiscounts {
    public infested: number = 0;
    public musty: number = 0;
    public sour: number = 0;
    public weathered: number = 0;
    public inspection: number = 0;

    constructor(data?: any) {
        if (!data) return;
        Object.keys(data).forEach(key => this[key] = data[key]);
    }

    public total(): number {
        return Object.values(this).reduce((total, currentValue) => total + currentValue, 0);
    }

    public getRawData() {
        return { ...this };
    }
}

const MASS_FIELDS_AND_NAMES = [
    ["brokenGrain", "broken grain"],
    ["damagedGrain", "damage"],
    ["dryWeight", "drying"],
    ["dryWeightPercent", "dry weight percent"],
    ["foreignMatter", "foreign matter"],
    ["gross", "gross"],
    ["impurities", "impurities"],
    ["infested", "infested"],
    ["inspection", "inspection"],
    ["moisture", "moisture"],
    ["musty", "musty"],
    ["net", "net"],
    ["original_weight", "original weight"],
    ["PPB", "PPB"],
    ["sour", "sour"],
    ["tare", "tare"],
    ["weathered", "weathered"],
    ["weight", "weight"],
];

export const WEIGHT_DISCOUNT_FIELDS = [
    "brokenGrain",
    "damagedGrain",
    "dryWeight",
    "dryWeightPercent",
    "foreignMatter",
    "moisture",
    "PPB",
    "impurities",
];

export class WeightDiscounts {
    brokenGrain: Mass;
    damagedGrain: Mass;
    dryWeight: Mass;
    dryWeightPercent: Mass;
    foreignMatter: Mass;
    moisture: Mass;
    PPB: Mass;
    impurities: Mass;

    constructor(data?: any) {
        if (!data) return;
        for (const key of Object.keys(data)) {
            this[key] = new Mass(data[key].amount, data[key].defaultUnits);
        }
    }

    public async getDiscounts(ticket: Ticket, discountTables: DiscountTables): Promise<void> {
        for (const table of (discountTables?.tables ?? [])) {
            const key = table.fieldName;
            const rowData = table.data.find(row => ticket[key] >= row.low && ticket[key] <= row.high);

            this[key] ??= new Mass(0, null);
            this[key].amount = (rowData?.discount ?? 0) * ticket.net.get() / 100;
            this[key].defaultUnits = ticket.net.getUnit();
        }
    }

    public total(): number {
        return Object.values(this).reduce((total, currentValue) => total + currentValue.get(), 0);
    }

    public totalMass(product?: Product | ProductInfo): Mass {
        return Object.values(this).reduce((total: Mass, currentValue: Mass) => total.add(currentValue), new Mass(0, "lbs", product));
    }

    public getRawData(): any {
        const rawData = {};
        for (const key of Object.keys(this)) {
            rawData[key] = (this[key] as Mass).getRawData();
        }
        return rawData;
    }

    public defineBushels(product: Product | ProductInfo): void {
        Object.keys(this).forEach(key => {
            (this[key] as Mass).defineBushels(product);
        });
    }
}

export interface MoneyDiscounts {
    [discount: string]: number;
}