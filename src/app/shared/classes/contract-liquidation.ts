import { CollectionReference, DocumentData, DocumentReference, QueryDocumentSnapshot, SnapshotOptions } from "firebase/firestore";
import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { PriceDiscounts, Ticket, TicketWithDiscounts, WeightDiscounts } from "./ticket";
import { Contract } from "./contract";
import { Firestore, collection } from "@angular/fire/firestore";

type LiquidationStatus = "pending" | "paid" | "cancelled";

export class ContractLiquidation extends FirebaseDocInterface {
    public ticketRefs: DocumentReference<Ticket>[];
    public status: LiquidationStatus;
    public date: Date;
    public proofOfPaymentRefs: string[];
    public supplementalDocumentRefs: string[];

    constructor(snapshotOrRef: QueryDocumentSnapshot<any> | DocumentReference<any>) {
        let snapshot;
        if (snapshotOrRef instanceof QueryDocumentSnapshot) {
            snapshot = snapshotOrRef;
        }

        super(snapshot, ContractLiquidation.converter);
        const data = snapshot?.data();

        if (snapshotOrRef instanceof DocumentReference) {
            this.ref = snapshotOrRef;
            
            this.ticketRefs = [];
            this.status = "pending";
            this.date = new Date();

            return;
        }

        if (data == undefined) return;

        this.ticketRefs = data.ticketRefs;
        this.status = data.status;
        this.date = data.date.toDate();
    }

    public static converter = {
        toFirestore(data: ContractLiquidation): DocumentData {
            return {
                ticketRefs: data.ticketRefs,
                status: data.status,
            }
        },
        fromFirestore(snapshot: QueryDocumentSnapshot<any>, options: SnapshotOptions): ContractLiquidation {
            return new ContractLiquidation(snapshot);
        }
    }

    public static getCollectionReference(db: Firestore, company: string, contractRefId: string): CollectionReference<ContractLiquidation> {
        return collection(db, `companies/${company}/contracts/${contractRefId}/liquidations`).withConverter(ContractLiquidation.converter);
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