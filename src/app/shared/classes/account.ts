import { CollectionReference, DocumentData, DocumentReference, QueryDocumentSnapshot, SnapshotOptions } from "firebase/firestore";
import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { Firestore, collection, getDocs, query } from "@angular/fire/firestore";

export class Account extends FirebaseDocInterface {
    public name: string;
    public accountNumber: string; // or id ???
    public routingNumbers: string[]; // or routingNums
    public balance: number;
    public transactionHistory: { [date: string]: number };

    constructor(snapshotOrRef: QueryDocumentSnapshot | DocumentReference) {
        let snapshot;

        if (snapshotOrRef instanceof QueryDocumentSnapshot) {
            snapshot = snapshotOrRef;
        }

        super(snapshot, Account.converter);
        const data = snapshot?.data();

        if (snapshotOrRef instanceof DocumentReference) {
            this.ref = snapshotOrRef;

            this.name = "";
            this.accountNumber = "";
            this.routingNumbers = [];
            this.balance = 0;
            this.transactionHistory = {};

            return;
        }

        this.name = data.name;
        this.accountNumber = data.accountNumber;
        this.routingNumbers = data.routingNumbers;
        this.balance = data.balance;
        this.transactionHistory = data.transactionHistory;
    }

    public static converter = {
        toFirestore(data: Account): DocumentData {
            return {
                name: data.name,
                accountNumber: data.accountNumber,
                routingNumbers: data.routingNumbers,
                balance: data.balance,
                transactionHistory: data.transactionHistory,
            }
        },
        fromFirestore(snapshot: QueryDocumentSnapshot, options?: SnapshotOptions): Account {
            return new Account(snapshot);
        }
    }

    public static getCollectionReference(db: Firestore, company: string): CollectionReference<Account> {
        return collection(db, `companies/${company}/accounts`).withConverter(Account.converter);
    }

    public static getAccounts(db: Firestore, company: string, ...constraints): Promise<Account[]> {
        return getDocs(query(this.getCollectionReference(db, company), ...constraints)).then(result => {
            return result.docs.map(snap => snap.data());
        });
    }
    
}
