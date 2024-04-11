import { L } from "@angular/cdk/keycodes";
import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { Account } from "./account";
import { Status } from "./company";
import { Contact } from "./contact";
import { CollectionReference, DocumentData, DocumentReference, Firestore, QueryConstraint, QueryDocumentSnapshot, QuerySnapshot, SnapshotOptions, collection, onSnapshot, orderBy, query, where } from "@angular/fire/firestore";

export const TRANSACTION_TYPES = ["deposit", "withdrawal", "payment to", "payment from"];

export class Transaction extends FirebaseDocInterface {
    public date: Date;
    public amount: number;
    public status: Status;
    public type: string;
    public description: string;
    public notes: string;

    // Info for account that transaction corresponds to
    public accountRef: DocumentReference<Account>;
    public accountName: string; // or accountNumber, depending on what they want displayed

    // Info for other party involved in transaction (if applicable)
    // Will all be empty if transaction type if deposit or withdrawal
    public clientRef: DocumentReference<Contact>; // optional if they just want to use clientAccountNumber
    public clientName: string; // optional if they just want to use clientAccountNumber
    public clientAccountNumber: string;

    constructor(snapshotOrRef: DocumentReference<any> | QueryDocumentSnapshot<any>) {
        if (snapshotOrRef instanceof DocumentReference) {
            super(null, Transaction.converter);
            this.ref = snapshotOrRef;

            this.date = new Date();
            this.amount = null;
            this.status = "pending";
            this.type = "";
            this.description = "";
            this.notes = "";

            this.accountRef = null;
            this.accountName = "";

            this.clientRef = null;
            this.clientName = "";
            this.clientAccountNumber = "";

            return;
        }

        if (snapshotOrRef instanceof QueryDocumentSnapshot) {
            super(snapshotOrRef, Transaction.converter);
            this.ref = snapshotOrRef.ref;
            const data = snapshotOrRef.data();

            this.date = data.date.toDate();
            this.amount = data.amount;
            this.status = data.status;
            this.type = data.type;
            this.description = data.description;
            this.notes = data.notes;
    
            this.accountRef = data.accountRef;
            this.accountName = data.accountName;
    
            this.clientRef = data.clientRef;
            this.clientName = data.clientName;
            this.clientAccountNumber = data.clientAccountNumber;
    
            return;
        }
    }

    public static converter = {
        toFirestore(data: Transaction): DocumentData {
            return {
                date: data.date,
                amount: data.amount,
                status: data.status,
                type: data.type,
                description: data.description,
                notes: data.notes,

                accountRef: data.accountRef,
                accountName: data.accountName,
                
                clientRef: data.clientRef,
                clientName: data.clientName,
                clientAccountNumber: data.clientAccountNumber,
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

    public setDescription(description: string): void {
        this.description = description || `${this.titleCase(this.type)}  ${this.clientName ?? ""}  ${this.clientAccountNumber ? '#' + this.clientAccountNumber : ""}`.trim();
    }

    public static setDescription(transaction: Transaction): string {
        return `${this.titleCase(transaction.type)}  ${transaction.clientName ?? ""}  ${transaction.clientAccountNumber ? '#' + transaction.clientAccountNumber : ""}`.trim();
    }

    public titleCase(str: string): string {
        return str.toLocaleLowerCase().split(' ').map(word => word.replace(word[0], word[0].toUpperCase())).join(' ');
    }

    public static titleCase(str: string): string {
        return str.toLocaleLowerCase().split(' ').map(word => word.replace(word[0], word[0].toUpperCase())).join(' ');
    }

}
