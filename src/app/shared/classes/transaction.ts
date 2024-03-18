import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { Account } from "./account";
import { Contact } from "./contact";
import { CollectionReference, DocumentData, DocumentReference, Firestore, QueryConstraint, QueryDocumentSnapshot, QuerySnapshot, SnapshotOptions, collection, onSnapshot, orderBy, query, where } from "@angular/fire/firestore";

export class Transaction extends FirebaseDocInterface {
    public date: Date;
    public amount: number;
    public status: string;
    
    public accountRef: DocumentReference<Account>;
    public clientRef: DocumentReference<Contact>;
    public accountName: string;
    public clientName: string;

    constructor(snapshotOrRef: QueryDocumentSnapshot<any> | DocumentReference<any>) {
        if (snapshotOrRef instanceof DocumentReference) {
            super(null, Transaction.converter);
            this.ref = snapshotOrRef;

            this.date = new Date();
            this.amount = null;
            this.status = "pending";
            this.accountRef = null;
            this.clientRef = null;
            this.accountName = "";
            this.clientName = "";

            return;
        }

        if (snapshotOrRef instanceof QueryDocumentSnapshot) {
            super(snapshotOrRef, Transaction.converter);
            const data = snapshotOrRef.data();

            this.date = data.date.toDate();
            this.amount = data.amount;
            this.status = data.status;
            this.accountRef = data.accountRef;
            this.clientRef = data.clientRef;
            this.accountName = data.accountName;
            this.clientName = data.clientName;
        }
    }

    public static converter = {
        toFirestore(data: Transaction): DocumentData {
            return {
                date: data.date,
                amount: data.amount,
                status: data.status,
                accountRef: data.accountRef,
                clientRef: data.clientRef,
                accountName: data.accountName,
                clientName: data.clientName
            }
        },
        fromFirestore(snapshot: QueryDocumentSnapshot<any>, options: SnapshotOptions): Transaction {
            return new Transaction(snapshot);
        }
    };

    public static getCollectionReference(db: Firestore, company: string): CollectionReference<Transaction> {
        return collection(db, `companies/${company}/transactions`).withConverter(Transaction.converter);
    }

    public static getTransactionsSnapshot(db: Firestore, company: string, onNext: (snapshot: QuerySnapshot<Transaction>) => void, ...constraints: QueryConstraint[]) {
        const collectionQuery = query(Transaction.getCollectionReference(db, company), orderBy("date", "desc"), ...constraints);
        return onSnapshot(collectionQuery, onNext);
    }
}
