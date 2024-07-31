import { FileStorageInfo } from "@shared/components/document-upload-dialog/document-upload-dialog.component";
import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { Status } from "./company";
import { Firestore, collection, getDocs, onSnapshot, query, CollectionReference, DocumentData, DocumentReference, Query, QueryConstraint, QueryDocumentSnapshot, SnapshotOptions, QuerySnapshot, Unsubscribe, where } from "@angular/fire/firestore";

export const PAYMENT_TYPES = ["default", "prepay"];
export const PAYMENT_METHODS = ["wire", "check", "credit"];

export class Payment extends FirebaseDocInterface {
    public accountName: string;
    public amount: number;
    public date: Date;
    public notes: string;
    public paidDocuments: PaidDocument[];
    public proofOfPaymentDocs: FileStorageInfo[];
    public status: Status;
    public type: typeof PAYMENT_TYPES[number];
    public paymentMethod: typeof PAYMENT_METHODS[number];

    constructor(snapshotOrRef: QueryDocumentSnapshot<any> | DocumentReference<any>) {
        let snapshot;
        if (snapshotOrRef instanceof QueryDocumentSnapshot) {
            snapshot = snapshotOrRef;
        }

        super(snapshot, Payment.converter);
        const data = snapshot?.data();

        if (snapshotOrRef instanceof DocumentReference) {
            this.ref = snapshotOrRef;

            this.accountName = null;
            this.amount = null;
            this.date = null;
            this.notes = null;
            this.paidDocuments = [];
            this.proofOfPaymentDocs = [];
            this.status = "pending";
            this.type = null;
            this.paymentMethod = null;

            return;
        }

        if (data == undefined) return;

        this.accountName = data.accountName;
        this.amount = data.amount;
        this.date = data.date.toDate();
        this.notes = data.notes;
        this.paidDocuments = data.paidDocuments;
        this.proofOfPaymentDocs = data.proofOfPaymentDocs;
        this.status = data.status;
        this.type = data.type;
        this.paymentMethod = data.paymentMethod;
    }

    public static converter = {
        toFirestore(data: Payment): DocumentData {
            return {
                accountName: data.accountName,
                amount: data.amount,
                date: data.date,
                notes: data.notes,
                paidDocuments: data.paidDocuments,
                proofOfPaymentDocs: data.proofOfPaymentDocs,
                status: data.status,
                type: data.type,
                paymentMethod: data.paymentMethod
            }
        },
        fromFirestore(snapshot: QueryDocumentSnapshot<any>, options: SnapshotOptions): Payment {
            return new Payment(snapshot);
        }
    }

    public static getCollectionReference(db: Firestore, company: string, contractID: string): CollectionReference<Payment> {
        return collection(db, `companies/${company}/contracts/${contractID}/payments`).withConverter(Payment.converter);
    }

    public static getCollectionQuery(
        db: Firestore, 
        company: string,
        contractID: string, 
        ...constraints: QueryConstraint[]
    ): Query<Payment> {
        const collectionRef = Payment.getCollectionReference(db, company, contractID);
        return query(collectionRef, ...constraints);
    }

    public static getPayments(
        db: Firestore, 
        company: string, 
        contractID: string,
        ...constraints: QueryConstraint[]
    ): Promise<Payment[]> {
        const collectionQuery = Payment.getCollectionQuery(db, company, contractID, ...constraints);
        return getDocs(collectionQuery).then(result => result.docs.map(qds => qds.data()));
    }

    public static getPaymentsSnapshot(
        db: Firestore, 
        company: string,
        contractID: string, 
        onNext: (snapshot: QuerySnapshot<Payment>) => void,
        ...constraints: QueryConstraint[]
    ): Unsubscribe {
        const collectionQuery = Payment.getCollectionQuery(db, company, contractID, ...constraints);
        return onSnapshot(collectionQuery, onNext);
    }
}

export interface PaidDocument {
    ref: DocumentReference;
    amount: number;
    id: number | string;
}
