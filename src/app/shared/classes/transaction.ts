import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { Account } from "./account";
import { Contact } from "./contact";
import { CollectionReference, DocumentData, DocumentReference, Firestore, QueryConstraint, QueryDocumentSnapshot, QuerySnapshot, SnapshotOptions, collection, onSnapshot, orderBy, query, where } from "@angular/fire/firestore";

export class Transaction extends FirebaseDocInterface {
    public date: Date;
    public amount: number;
    public status: string;
    
    // public account: Account;
    // public client: Contact;
    public accountRef: DocumentReference<Account>;
    public clientRef: DocumentReference<Contact>;

    // figure out how you should save/get account and client info needed for a transaction
    // account - DocumentReference / accountName / accountNumber / AccountTransactionInfo (custom interface) ???
    // client - DocumentReference / clientName / ClientTransactionInfo (custom interface) ???

    constructor(snapshotOrRef: QueryDocumentSnapshot<any> | DocumentReference<any>) {
        if (snapshotOrRef instanceof DocumentReference) {
            super(null, Transaction.converter);
            this.ref = snapshotOrRef;

            this.date = new Date();
            this.amount = null;
            this.status = "";
            // this.account = null;
            // this.client = null;
            this.accountRef = null;
            this.clientRef = null;

            return;
        }

        // super(snapshot, Transaction.converter);
        if (snapshotOrRef instanceof QueryDocumentSnapshot) {
            super(snapshotOrRef, Transaction.converter);
            const data = snapshotOrRef.data();

            this.date = data.date.toDate();
            this.amount = data.amount;
            this.status = data.status;
            // this.account = data.account;
            // this.client = data.client;
            this.accountRef = null;
            this.clientRef = null;
        }
    }

    public static converter = {
        toFirestore(data: Transaction): DocumentData {
            return {
                date: data.date,
                amount: data.amount,
                status: data.status,
                // account: data.account,
                // client: data.client,
                accountRef: data.accountRef,
                clientRef: data.clientRef,
            }
        },
        fromFirestore(snapshot: QueryDocumentSnapshot<any>, options: SnapshotOptions): Transaction {
            return new Transaction(snapshot);
        }
    };

    public static getCollectionReference(db: Firestore, company: string): CollectionReference<Transaction> {
        return collection(db, `companies/${company}/transactions`).withConverter(Transaction.converter);
    }

    public static getTransactions(db: Firestore, company: string, onNext: (snapshot: QuerySnapshot<Transaction>) => void, ...constraints: QueryConstraint[]) {
        const collectionQuery = query(Transaction.getCollectionReference(db, company), orderBy("date", "desc"), ...constraints);
        return onSnapshot(collectionQuery, onNext);
    }
}
