import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { Status } from "./company";
import { FileStorageInfo } from "./liquidation";
import { Firestore, collection, getDocs, onSnapshot, query, CollectionReference, DocumentData, DocumentReference, Query, QueryConstraint, QueryDocumentSnapshot, SnapshotOptions, QuerySnapshot, Unsubscribe } from "@angular/fire/firestore";

type PaymentType = "pre-paid" | "default";

export class Payment extends FirebaseDocInterface {
    public amount: number;
    public date: Date;
    public notes: string;
    public proofOfPaymentDocs: FileStorageInfo[];
    public status: Status;
    public type: PaymentType;
    public paidDocumentRefs: {
        ref: DocumentReference,
        amount: number
    }[];

    constructor(snapshotOrRef: QueryDocumentSnapshot<any> | DocumentReference<any>) {
        let snapshot;
        if (snapshotOrRef instanceof QueryDocumentSnapshot) {
            snapshot = snapshotOrRef;
        }

        super(snapshot, Payment.converter);
        const data = snapshot?.data();

        if (snapshotOrRef instanceof DocumentReference) {
            this.ref = snapshotOrRef;

            this.amount = 0;
            this.date = new Date();
            this.notes = "";
            this.proofOfPaymentDocs = [];
            this.status = "pending";
            this.type = "default";
            this.paidDocumentRefs = [];

            return;
        }

        if (data == undefined) return;

        this.amount = data.amount;
        this.date = data.date.toDate();
        this.notes = data.notes;
        this.proofOfPaymentDocs = data.proofOfPaymentDocs;
        this.status = data.status;
        this.type = data.type;
        this.paidDocumentRefs = data.paidDocumentRefs;
    }

    public static converter = {
        toFirestore(data: Payment): DocumentData {
            return {
                amount: data.amount,
                date: data.date,
                notes: data.notes,
                proofOfPaymentDocs: data.proofOfPaymentDocs,
                status: data.status,
                type: data.type,
                paidDocumentRefs: data.paidDocumentRefs
            }
        },
        fromFirestore(snapshot: QueryDocumentSnapshot<any>, options: SnapshotOptions): Payment {
            return new Payment(snapshot);
        }
    }

    public static getCollectionReference(db: Firestore, company: string): CollectionReference<Payment> {
        return collection(db, `companies/${company}/payments`).withConverter(Payment.converter);
    }

    public static getCollectionQuery(
        db: Firestore, 
        company: string, 
        ...constraints: QueryConstraint[]
    ): Query<Payment> {
        const collectionRef = Payment.getCollectionReference(db, company);
        return query(collectionRef, ...constraints);
    }

    public static getPayments(
        db: Firestore, 
        company: string, 
        ...constraints: QueryConstraint[]
    ): Promise<Payment[]> {
        const collectionQuery = Payment.getCollectionQuery(db, company, ...constraints);
        return getDocs(collectionQuery).then(result => result.docs.map(qds => qds.data()));
    }

    public static getPaymentsSnapshot(
        db: Firestore, 
        company: string, 
        onNext: (snapshot: QuerySnapshot<Payment>) => void,
        ...constraints: QueryConstraint[]
    ): Unsubscribe {
        const collectionQuery = Payment.getCollectionQuery(db, company, ...constraints);
        return onSnapshot(collectionQuery, onNext);
    }
}
