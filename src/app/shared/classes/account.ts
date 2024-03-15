import { formatDate } from "@angular/common";
import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { CollectionReference, DocumentData, DocumentReference, Firestore, QueryConstraint, QueryDocumentSnapshot, QuerySnapshot, SnapshotOptions, Unsubscribe, collection, getDoc, getDocs, onSnapshot, query } from "@angular/fire/firestore";

const MILLISECONDS_IN_A_DAY = 24 * 60 * 60 * 1000;

export class Account extends FirebaseDocInterface {
    public name: string;
    public accountNumber: string;
    public routingNumbers: { description: string, number: string }[];
    public currentBalance: number;
    public transactionHistory: { [date: string]: number };
    public startingBalance: number; 

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
            this.currentBalance = null;
            this.transactionHistory = {};
            this.startingBalance = null;

            return;
        }

        this.name = data.name;
        this.accountNumber = data.accountNumber;
        this.routingNumbers = data.routingNumbers;
        this.currentBalance = data.currentBalance;
        this.transactionHistory = data.transactionHistory;
        this.startingBalance = data.startingBalance;
    }

    public static converter = {
        toFirestore(data: Account): DocumentData {
            return {
                name: data.name,
                accountNumber: data.accountNumber,
                routingNumbers: data.routingNumbers,
                currentBalance: data.currentBalance,
                transactionHistory: data.transactionHistory,
                startingBalance: data.startingBalance
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

    public static getAccountsSnapshot(db: Firestore, company: string, onNext: (snapshot: QuerySnapshot<Account>) => void, ...constraints: QueryConstraint[]): Unsubscribe {
        const collectionQuery = query(Account.getCollectionReference(db, company), ...constraints);
        return onSnapshot(collectionQuery, onNext);
    }

    public initializeTransactionHistory(): void {
        const newDate = new Date();
        newDate.setHours(0, 0, 0, 0);

        for (let dayIndex = 0; dayIndex < 30; dayIndex++) {
            const dateString = formatDate(new Date(newDate.valueOf() - MILLISECONDS_IN_A_DAY * dayIndex), "d MMM y", "en-US");
            this.transactionHistory[dateString] = this.startingBalance ?? 0;
        }
        this.currentBalance = this.startingBalance;
    }

    public static getAccountByRef(ref: DocumentReference<Account>): Promise<Account> {
        return getDoc(ref).then(doc => doc.data());
    }
    
}
