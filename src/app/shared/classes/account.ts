import { formatDate } from "@angular/common";
import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { CollectionReference, DocumentData, DocumentReference, Firestore, QueryDocumentSnapshot, QuerySnapshot, SnapshotOptions, Unsubscribe, collection, getDocs, onSnapshot, query } from "@angular/fire/firestore";

const MILLISECONDS_IN_A_DAY = 24 * 60 * 60 * 1000;

export class Account extends FirebaseDocInterface {
    public name: string;
    public accountNumber: string;
    public routingNumbers: { [description: string]: string };
    public balance: number;
    public transactionHistory: { [date: string]: number };
    // public bankName: string; // ???

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
            this.routingNumbers = {};
            this.balance = null;
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

    public static getAccountsSnapshot(db: Firestore, company: string, onNext: (snapshot: QuerySnapshot<Account>) => void, ...constraints): Unsubscribe {
        const collectionQuery = query(Account.getCollectionReference(db, company), ...constraints);
        return onSnapshot(collectionQuery, onNext);
    }

    public initializeTransactionHistory(): void {
        const newDate = new Date();
        newDate.setHours(0, 0, 0, 0);

        for (let dayIndex = 0; dayIndex < 30; dayIndex++) {
            const dateString = formatDate(new Date(newDate.valueOf() - MILLISECONDS_IN_A_DAY * dayIndex), "d MMM y", "en-US");
            this.transactionHistory[dateString] = this.balance ?? 0;
        }
    }
    
}
