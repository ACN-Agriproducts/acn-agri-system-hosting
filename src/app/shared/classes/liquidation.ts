import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { PriceDiscounts, Ticket, WeightDiscounts } from "./ticket";
import { Contract } from "./contract";
import { Firestore, collection, doc, getDoc, getDocs, onSnapshot, query, CollectionReference, DocumentData, DocumentReference, Query, QueryConstraint, QueryDocumentSnapshot, SnapshotOptions, QuerySnapshot, Unsubscribe } from "@angular/fire/firestore";
import { Mass, units } from "./mass";

type LiquidationStatus = "pending" | "paid" | "cancelled";

export declare type ReportTicket = {
    data: TicketInfo,
    inReport: boolean
}

export const DEFAULT_DISPLAY_UNITS: Map<string, units> = new Map<string, units>([
    ["weight", "lbs"],
    ["moisture", "CWT"],
    ["dryWeight", "CWT"],
    ["damagedGrain", "CWT"],
    ["adjustedWeight", "lbs"],
    ["price", "bu"],
]);

export class Liquidation extends FirebaseDocInterface {
    public date: Date;
    public proofOfPaymentLinks: string[];
    public status: LiquidationStatus;
    public supplementalDocLinks: string[];
    public ticketRefs: DocumentReference<Ticket>[];
    public tickets: TicketInfo[];

    constructor(snapshotOrRef: QueryDocumentSnapshot<any> | DocumentReference<any>) {
        let snapshot;
        if (snapshotOrRef instanceof QueryDocumentSnapshot) {
            snapshot = snapshotOrRef;
        }

        super(snapshot, Liquidation.converter);
        const data = snapshot?.data();

        if (snapshotOrRef instanceof DocumentReference) {
            this.ref = snapshotOrRef;
            
            this.date = new Date();
            this.proofOfPaymentLinks = [];
            this.status = "pending";
            this.supplementalDocLinks = [];
            this.ticketRefs = [];
            this.tickets = [];

            return;
        }

        if (data == undefined) return;

        this.date = data.date.toDate();
        this.proofOfPaymentLinks = data.proofOfPaymentLinks;
        this.status = data.status;
        this.supplementalDocLinks = data.supplementalDocLinks;
        this.ticketRefs = data.ticketRefs;
        this.tickets = data.tickets.map(ticket => ({
            damagedGrain: ticket.damagedGrain,
            dateIn: ticket.dateIn.toDate(),
            dateOut: ticket.dateOut.toDate(),
            displayId: ticket.displayId,
            dryWeightPercent: ticket.dryWeightPercent,
            gross: new Mass(ticket.gross.amount, ticket.gross.defaultUnits),
            id: ticket.id,
            moisture: ticket.moisture,
            net: new Mass(ticket.net.amount, ticket.net.defaultUnits),
            priceDiscounts: new PriceDiscounts(ticket.priceDiscounts),
            ref: ticket.ref.withConverter(Ticket.converter),
            status: ticket.status,
            subId: ticket.subId ?? "",
            tare: new Mass(ticket.tare.amount, ticket.tare.defaultUnits),
            weight: ticket.weight,
            weightDiscounts: new WeightDiscounts(ticket.weightDiscounts),
        }));
    }

    public static converter = {
        toFirestore(data: Liquidation): DocumentData {
            const rawTickets = data.tickets.map(t => {
                const rawData = { ...t };
                Object.keys(t).forEach(key => {
                    if (t[key] instanceof Mass || t[key] instanceof WeightDiscounts || t[key] instanceof PriceDiscounts) {
                        rawData[key] = t[key].getRawData();
                    }
                })
                return rawData;
            });

            return {
                date: data.date,
                proofOfPaymentLinks: data.proofOfPaymentLinks,
                status: data.status,
                supplementalDocLinks: data.supplementalDocLinks,
                ticketRefs: data.ticketRefs,
                tickets: rawTickets
            }
        },
        fromFirestore(snapshot: QueryDocumentSnapshot<any>, options: SnapshotOptions): Liquidation {
            return new Liquidation(snapshot);
        }
    }

    public static getCollectionReference(db: Firestore, company: string, contractRefId: string): CollectionReference<Liquidation> {
        return collection(db, `companies/${company}/contracts/${contractRefId}/liquidations`).withConverter(Liquidation.converter);
    }

    public static getCollectionQuery(
        db: Firestore, 
        company: string, 
        contractRefId: string, 
        ...constraints: QueryConstraint[]
    ): Query<Liquidation> {
        const collectionRef = Liquidation.getCollectionReference(db, company, contractRefId);
        return query(collectionRef, ...constraints);
    }

    public static getLiquidations(
        db: Firestore, 
        company: string, 
        contractRefId: string, 
        ...constraints: QueryConstraint[]
    ): Promise<Liquidation[]> {
        const collectionQuery = Liquidation.getCollectionQuery(db, company, contractRefId, ...constraints);
        return getDocs(collectionQuery).then(result => result.docs.map(qds => qds.data()));
    }

    public static getLiquidationsSnapshot(
        db: Firestore, 
        company: string, 
        contractRefId: string, 
        onNext: (snapshot: QuerySnapshot<Liquidation>) => void,
        ...constraints: QueryConstraint[]
    ): Unsubscribe {
        const collectionQuery = Liquidation.getCollectionQuery(db, company, contractRefId, ...constraints);
        return onSnapshot(collectionQuery, onNext);
    }

    public static async getLiquidationByRefId(
        db: Firestore, 
        company: string, 
        contractRefId: string, 
        refId: string
    ): Promise<Liquidation> {
        const liquidationDoc = await getDoc(doc(db, `companies/${company}/contracts/${contractRefId}/liquidations/${refId}`)
        .withConverter(Liquidation.converter));
        return liquidationDoc.data();
    }

    public static getTicketInfo(ticket: Ticket): TicketInfo {
        if (ticket == null) return;

        return {
            damagedGrain: ticket.damagedGrain ?? 0,
            dateIn: ticket.dateIn,
            dateOut: ticket.dateOut,
            displayId: ticket.displayId,
            dryWeightPercent: ticket.dryWeightPercent ?? 0,
            gross: ticket.gross,
            id: ticket.id,
            moisture: ticket.moisture ?? 0,
            net: ticket.net,
            priceDiscounts: ticket.priceDiscounts,
            ref: ticket.ref.withConverter(Ticket.converter),
            status: ticket.status,
            subId: ticket.subId ?? "",
            tare: ticket.tare,
            weight: ticket.weight,
            weightDiscounts: ticket.weightDiscounts,
        };
    }
}

export class LiquidationTotals {
    public gross: Mass;
    public tare: Mass;
    public net: Mass;
    public adjustedWeight: Mass;
    public beforeFinalDiscounts: number = 0;
    public netToPay: number = 0;
    public weightDiscounts: WeightDiscounts = new WeightDiscounts();
    public priceDiscounts: PriceDiscounts = new PriceDiscounts();

    constructor(tickets?: TicketInfo[], contract?: Contract) {
        if (!tickets || !contract) return;

        this.gross = this.tare = this.net = this.adjustedWeight = new Mass(0, FirebaseDocInterface.session.getDefaultUnit(), contract.productInfo);
        tickets.forEach(ticket => {
            this.gross = this.gross.add(ticket.gross);
            this.tare = this.tare.add(ticket.tare);
            this.net = this.net.add(ticket.net);

            for (const key of Object.keys(ticket.weightDiscounts)) {
                this.weightDiscounts[key] ??= new Mass(0, ticket.net.getUnit(), contract.productInfo);
                this.weightDiscounts[key].amount += ticket.weightDiscounts[key].amount;
            }
            const tempAdjustedWeight = ticket.net.subtract(ticket.weightDiscounts.totalMass());
            this.adjustedWeight = this.adjustedWeight.add(tempAdjustedWeight);

            const tempBeforeFinalDiscounts = contract.price.getPricePerUnit(ticket.net.getUnit(), contract.quantity) * tempAdjustedWeight.get();
            this.beforeFinalDiscounts += tempBeforeFinalDiscounts;

            for (const key of Object.keys(this.priceDiscounts)) {
                this.priceDiscounts[key] += ticket.priceDiscounts[key];
            }
            this.netToPay += tempBeforeFinalDiscounts - ticket.priceDiscounts.total();
        });
    }
}

export interface TicketInfo {
    damagedGrain: number;
    dateIn: Date;
    dateOut: Date;
    displayId: string;
    dryWeightPercent: number;
    gross: Mass;
    id: number;
    moisture: number;
    net: Mass;
    priceDiscounts: PriceDiscounts;
    ref: DocumentReference<Ticket>;
    status: string;
    subId: string;
    tare: Mass;
    weight: number;
    weightDiscounts: WeightDiscounts;
}
