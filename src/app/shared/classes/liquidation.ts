import { CollectionReference, DocumentData, DocumentReference, QueryConstraint, QueryDocumentSnapshot, SnapshotOptions } from "firebase/firestore";
import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { PriceDiscounts, Ticket, TicketWithDiscounts, WeightDiscounts } from "./ticket";
import { Contract } from "./contract";
import { Firestore, collection, getDocs, query } from "@angular/fire/firestore";

type LiquidationStatus = "pending" | "paid" | "cancelled";

export class Liquidation extends FirebaseDocInterface {
    public date: Date;
    public proofOfPaymentLinks: string[];
    public status: LiquidationStatus;
    public supplementalDocLinks: string[];
    public ticketRefs: DocumentReference<Ticket>[];

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

            return;
        }

        if (data == undefined) return;

        this.ticketRefs = data.ticketRefs;
        this.status = data.status;
        this.date = data.date.toDate();
    }

    public static converter = {
        toFirestore(data: Liquidation): DocumentData {
            return {
                date: data.date,
                proofOfPaymentLinks: data.proofOfPaymentLinks,
                status: data.status,
                supplementalDocLinks: data.supplementalDocLinks,
                ticketRefs: data.ticketRefs
            }
        },
        fromFirestore(snapshot: QueryDocumentSnapshot<any>, options: SnapshotOptions): Liquidation {
            return new Liquidation(snapshot);
        }
    }

    public static getCollectionReference(db: Firestore, company: string, contractRefId: string): CollectionReference<Liquidation> {
        return collection(db, `companies/${company}/contracts/${contractRefId}/liquidations`).withConverter(Liquidation.converter);
    }

    public static getLiquidations(db: Firestore, company: string, contractRefId: string, ...constraints: QueryConstraint[]): Promise<Liquidation[]> {
        const collectionRef = Liquidation.getCollectionReference(db, company, contractRefId);
        const collectionQuery = query(collectionRef, ...constraints);
        return getDocs(collectionQuery).then(result => result.docs.map(snap => snap.data()));
    }
}

export class LiquidationTotals {
    public gross: number = 0;
    public tare: number = 0;
    public net: number = 0;
    public adjustedWeight: number = 0;
    public beforeFinalDiscounts: number = 0;
    public netToPay: number = 0;
    public weightDiscounts: WeightDiscounts = new WeightDiscounts();
    public priceDiscounts: PriceDiscounts = new PriceDiscounts();

    constructor(tickets?: TicketWithDiscounts[], contract?: Contract) {
        if (!tickets || !contract) return;

        tickets.forEach(ticket => {
            this.gross += ticket.data.gross.get();
            this.tare += ticket.data.tare.get();
            this.net += ticket.data.net.get();

            for (const key of Object.keys(this.weightDiscounts)) {
                this.weightDiscounts[key].defaultUnits = ticket.data.net.getUnit();
                this.weightDiscounts[key].amount += ticket.weightDiscounts[key].amount;
            }
            const tempAdjustedWeight = ticket.data.net.get() - ticket.weightDiscounts.total();
            this.adjustedWeight += tempAdjustedWeight;

            const tempBeforeFinalDiscounts = contract.price.getPricePerUnit("lbs", contract.quantity) * tempAdjustedWeight;
            this.beforeFinalDiscounts += tempBeforeFinalDiscounts;

            for (const key of Object.keys(this.priceDiscounts)) {
                this.priceDiscounts[key] += ticket.priceDiscounts[key];
            }
            this.netToPay += tempBeforeFinalDiscounts - ticket.priceDiscounts.total();
        });
    }
}