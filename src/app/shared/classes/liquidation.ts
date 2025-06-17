import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { PriceDiscounts, Ticket, WeightDiscounts } from "./ticket";
import { Contract } from "./contract";
import { Firestore, collection, doc, getDoc, getDocs, onSnapshot, query, CollectionReference, DocumentData, DocumentReference, Query, QueryConstraint, QueryDocumentSnapshot, SnapshotOptions, QuerySnapshot, Unsubscribe, Timestamp } from "@angular/fire/firestore";
import { Mass } from "./mass";
import { Status } from "./company";
import { Price } from "./price";
import { Invoice } from "./invoice";
import { FileStorageInfo } from "@shared/components/document-upload-dialog/document-upload-dialog.component";

export type ReportTicket = {
    data: TicketInfo,
    inReport: boolean
}

export class Liquidation extends FirebaseDocInterface {
    public date: Date;
    public status: Status;
    public supplementalDocs: FileStorageInfo[];
    public ticketRefs: DocumentReference<Ticket>[];
    public tickets: TicketInfo[];
    public archived: boolean;

    public total: number;
    public amountPaid: number;

    public invoiceRef: DocumentReference<Invoice> | null;
    public createInvoice: boolean;

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
            this.status = "pending";
            this.supplementalDocs = [];
            this.ticketRefs = [];
            this.tickets = [];
            this.total = 0;
            this.archived = false;
            this.amountPaid = 0;

            return;
        }

        if (data == undefined) return;

        this.date = data.date.toDate();
        this.status = data.status;
        this.supplementalDocs = data.supplementalDocs;
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
            
            adjustedWeight: new Mass(ticket.adjustedWeight?.amount ?? 0, ticket.adjustedWeight?.defaultUnits ?? 0),
            beforeDiscounts: ticket.beforeDiscounts,
            netToPay: ticket.netToPay
        }));
        this.archived = data.archived;
        this.amountPaid = data.amountPaid;
        this.total = data.total;
        this.invoiceRef = data.invoiceRef?.withConverter(Invoice.converter);
        this.createInvoice = data.createInvoice;
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
                status: data.status,
                supplementalDocs: data.supplementalDocs,
                ticketRefs: data.ticketRefs,
                tickets: rawTickets,
                archived: data.archived,
                amountPaid: data.amountPaid,
                total: data.total,
                invoiceRef: data.invoiceRef ?? null,
                createInvoice: data.createInvoice ?? null
            }
        },
        fromFirestore(snapshot: QueryDocumentSnapshot<any>, options: SnapshotOptions): Liquidation {
            return new Liquidation(snapshot);
        }
    }

    public static getCollectionReference(db: Firestore, company: string, contractRefId: string): CollectionReference<Liquidation> {
        return collection(db, `companies/${company}/contracts/${contractRefId}/liquidations`).withConverter(Liquidation.converter);
    }

    public static getLiquidations(db: Firestore, company: string, contractRefId: string,
        ...constraints: QueryConstraint[]
    ): Promise<Liquidation[]> {
        const collectionQuery = query(Liquidation.getCollectionReference(db, company, contractRefId), ...constraints);
        return getDocs(collectionQuery).then(result => result.docs.map(qds => qds.data()));
    }

    public static getLiquidationsSnapshot(db: Firestore, company: string, contractRefId: string,
        onNext: (snapshot: QuerySnapshot<Liquidation>) => void,
        ...constraints: QueryConstraint[]
    ): Unsubscribe {
        const collectionQuery = query(Liquidation.getCollectionReference(db, company, contractRefId), ...constraints);
        return onSnapshot(collectionQuery, onNext);
    }

    public static async getLiquidationByContractId(db: Firestore, company: string, contractRefId: string,
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
            price: ticket.price ? new Price(ticket.price, ticket.net.defaultUnits) : null,
            priceDiscounts: ticket.priceDiscounts,
            ref: ticket.ref.withConverter(Ticket.converter),
            status: ticket.status,
            subId: ticket.subId ?? "",
            tare: ticket.tare,
            weight: ticket.weight,
            weightDiscounts: ticket.weightDiscounts,
            original_weight: ticket.original_weight,

            adjustedWeight: ticket.adjustedWeight ?? null,
            beforeDiscounts: ticket.beforeDiscounts ?? null,
            netToPay: ticket.netToPay ?? null
        };
    }

    public setTotalValue(contract: Contract): void {
        this.total = +(new LiquidationTotals(this.tickets, contract)).netToPay.toFixed(3);
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
    public original_weight: Mass;

    constructor(tickets?: TicketInfo[], contract?: Contract, isSalesLiquidation?: boolean) {
        if (!tickets || !contract) return;

        this.gross = this.tare = this.net = this.adjustedWeight = this.original_weight = new Mass(0, FirebaseDocInterface.session.getDefaultUnit(), contract.productInfo);
        tickets.forEach(ticket => {
            const price = ticket.price ?? contract.price;
            const massToUse = ticket.original_weight?.get() > 0 ? ticket.original_weight : ticket.net;

            this.gross = this.gross.add(ticket.gross);
            this.tare = this.tare.add(ticket.tare);
            this.net = this.net.add(contract.paymentTerms.origin === "client-scale" && contract.type === "purchase" ? massToUse : ticket.net);
            this.original_weight = this.original_weight.add(ticket.original_weight);

            for (const key of Object.keys(ticket.weightDiscounts)) {
                this.weightDiscounts[key] ??= new Mass(0, ticket.net.getUnit(), contract.productInfo);
                this.weightDiscounts[key].amount += this.roundAmount(ticket.weightDiscounts[key].amount, 3);
            }
            const tempAdjustedWeight = ticket.net.subtract(ticket.weightDiscounts.totalMass());
            this.adjustedWeight = this.adjustedWeight.add(tempAdjustedWeight);

            const tempBeforeFinalDiscounts = (price.getPricePerUnit(ticket.net.getUnit(), contract.quantity)) * tempAdjustedWeight.get();
            this.beforeFinalDiscounts += this.roundAmount(tempBeforeFinalDiscounts, 3);

            for (const key of Object.keys(ticket.priceDiscounts)) {
                if (key === 'unitRateDiscounts') continue;
                this.priceDiscounts[key] += this.roundAmount(ticket.priceDiscounts[key], 3);
            }
            for (const key of Object.keys(ticket.priceDiscounts.unitRateDiscounts)) {
                this.priceDiscounts.unitRateDiscounts[key] ??= 0;
                this.priceDiscounts.unitRateDiscounts[key] += this.roundAmount(ticket.priceDiscounts.unitRateDiscounts[key], 3);
            }

            if (isSalesLiquidation) {
                this.netToPay += this.roundAmount((massToUse.get() || ticket.net.get()) * (price.getPricePerUnit(massToUse.getUnit(), contract.quantity)), 3);
            }
            else {
                this.netToPay += this.roundAmount(tempBeforeFinalDiscounts - ticket.priceDiscounts.total(), 3);
            }
        });
    }

    public roundAmount(amount: number, decimalPlaces: number): number {
        const multiplier = Math.pow(10, decimalPlaces);
        return Math.round(amount * multiplier) / multiplier;
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
    price: Price;
    ref: DocumentReference<Ticket>;
    status: string;
    subId: string;
    tare: Mass;
    weight: number;
    weightDiscounts: WeightDiscounts;
    original_weight: Mass;

    adjustedWeight: Mass;
    beforeDiscounts: number;
    netToPay: number;
}
