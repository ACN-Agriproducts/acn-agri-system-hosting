import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { Status } from "./company";
import { FileStorageInfo } from "./liquidation";
import { Firestore, collection, getDocs, onSnapshot, query, CollectionReference, DocumentData, DocumentReference, Query, QueryConstraint, QueryDocumentSnapshot, SnapshotOptions, QuerySnapshot, Unsubscribe, where } from "@angular/fire/firestore";

type PaymentType = "prepay" | "default";

export class Payment extends FirebaseDocInterface {
    public accountName: string;
    public amount: number;
    public date: Date;
    public notes: string;
    public paidDocumentAmounts: {
        ref: DocumentReference,
        amount: number
    }[];
    public paidDocumentRefs: DocumentReference[];
    public proofOfPaymentDocs: FileStorageInfo[];
    public status: Status;
    public type: PaymentType;
    // FIGURE OUT HOW TO ORGANIZE PAYMENT DOCS IN RELATION TO WHAT THEY REFER TO (WHAT OTHER DOC IS BEING PAID)

    constructor(snapshotOrRef: QueryDocumentSnapshot<any> | DocumentReference<any>) {
        let snapshot;
        if (snapshotOrRef instanceof QueryDocumentSnapshot) {
            snapshot = snapshotOrRef;
        }

        super(snapshot, Payment.converter);
        const data = snapshot?.data();

        if (snapshotOrRef instanceof DocumentReference) {
            this.ref = snapshotOrRef;

            this.accountName = "";
            this.amount = 0;
            this.date = new Date();
            this.notes = "";
            this.paidDocumentAmounts = [];
            this.paidDocumentRefs = [];
            this.proofOfPaymentDocs = [];
            this.status = "pending";
            this.type = "default";

            return;
        }

        if (data == undefined) return;

        this.accountName = data.accountName;
        this.amount = data.amount;
        this.date = data.date.toDate();
        this.notes = data.notes;
        this.paidDocumentAmounts = data.paidDocumentAmounts;
        this.paidDocumentRefs = data.paidDocumentRefs;
        this.proofOfPaymentDocs = data.proofOfPaymentDocs;
        this.status = data.status;
        this.type = data.type;
    }

    public static converter = {
        toFirestore(data: Payment): DocumentData {
            return {
                accountName: data.accountName,
                amount: data.amount,
                date: data.date,
                notes: data.notes,
                paidDocumentAmounts: data.paidDocumentAmounts,
                paidDocumentRefs: data.paidDocumentRefs,
                proofOfPaymentDocs: data.proofOfPaymentDocs,
                status: data.status,
                type: data.type
            }
        },
        fromFirestore(snapshot: QueryDocumentSnapshot<any>, options: SnapshotOptions): Payment {
            return new Payment(snapshot);
        }
    }

    // public static getCollectionReference(db: Firestore, company: string): CollectionReference<Payment> {
    //     return collection(db, `companies/${company}/payments`).withConverter(Payment.converter);
    // }

    // public static getCollectionQuery(
    //     db: Firestore, 
    //     company: string, 
    //     ...constraints: QueryConstraint[]
    // ): Query<Payment> {
    //     const collectionRef = Payment.getCollectionReference(db, company);
    //     return query(collectionRef, ...constraints);
    // }

    // public static getPayments(
    //     db: Firestore, 
    //     company: string, 
    //     ...constraints: QueryConstraint[]
    // ): Promise<Payment[]> {
    //     const collectionQuery = Payment.getCollectionQuery(db, company, ...constraints);
    //     return getDocs(collectionQuery).then(result => result.docs.map(qds => qds.data()));
    // }

    // public static getPaymentsSnapshot(
    //     db: Firestore, 
    //     company: string, 
    //     onNext: (snapshot: QuerySnapshot<Payment>) => void,
    //     ...constraints: QueryConstraint[]
    // ): Unsubscribe {
    //     const collectionQuery = Payment.getCollectionQuery(db, company, ...constraints);
    //     return onSnapshot(collectionQuery, onNext);
    // }
}
