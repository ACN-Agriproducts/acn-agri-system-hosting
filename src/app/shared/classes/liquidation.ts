import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { PriceDiscounts, ReportTicket, Ticket, WeightDiscounts } from "./ticket";
import { Contract } from "./contract";
import { Firestore, collection, doc, getDoc, getDocs, onSnapshot, query, CollectionReference, DocumentData, DocumentReference, Query, QueryConstraint, QueryDocumentSnapshot, SnapshotOptions, QuerySnapshot, Unsubscribe } from "@angular/fire/firestore";
import { Mass } from "./mass";

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

        this.date = data.date.toDate();
        this.proofOfPaymentLinks = data.proofOfPaymentLinks;
        this.status = data.status;
        this.supplementalDocLinks = data.supplementalDocLinks;
        this.ticketRefs = data.ticketRefs;
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

    public static getLiquidationByRefId(
        db: Firestore, 
        company: string, 
        contractRefId: string, 
        refId: string
    ): Promise<Liquidation> {
        return getDoc(doc(db, `companies/${company}/contracts/${contractRefId}/liquidations/${refId}`)
        .withConverter(Liquidation.converter)).then(result => {
            console.log(result)
            return result.data();
        });
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

    constructor(tickets?: ReportTicket[], contract?: Contract) {
        if (!tickets || !contract) return;

        tickets.forEach(ticket => {
            this.gross += ticket.data.gross.get();
            this.tare += ticket.data.tare.get();
            this.net += ticket.data.net.get();

            // for (const key of Object.keys(this.weightDiscounts)) {
            //     this.weightDiscounts[key].defaultUnits = ticket.data.net.getUnit();
            //     this.weightDiscounts[key].amount += ticket.data.weightDiscounts[key].amount;
            // }
            for (const key of Object.keys(ticket.data.weightDiscounts)) {
                this.weightDiscounts[key] ??= new Mass(0, ticket.data.net.getUnit(), contract.productInfo);
                this.weightDiscounts[key].amount += ticket.data.weightDiscounts[key].amount;
            }
            const tempAdjustedWeight = ticket.data.net.get() - ticket.data.weightDiscounts.total();
            this.adjustedWeight += tempAdjustedWeight;

            const tempBeforeFinalDiscounts = contract.price.getPricePerUnit("lbs", contract.quantity) * tempAdjustedWeight;
            this.beforeFinalDiscounts += tempBeforeFinalDiscounts;

            for (const key of Object.keys(this.priceDiscounts)) {
                this.priceDiscounts[key] += ticket.data.priceDiscounts[key];
            }
            this.netToPay += tempBeforeFinalDiscounts - ticket.data.priceDiscounts.total();
        });
    }
}