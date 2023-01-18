import { collection, Firestore, getDocs, limit, query, CollectionReference, orderBy, QueryDocumentSnapshot, SnapshotOptions, where } from "@angular/fire/firestore";
import { DocumentData } from "rxfire/firestore/interfaces";
import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { Mass } from "./mass";
import { Inventory, Plant } from "./plant";

export class StorageLogs extends FirebaseDocInterface {
    public before: Inventory[];
    public after: Inventory[];
    public updatedBy: string;
    public updatedOn: Date;
    public change: Change[];
    public updateType: string;

    constructor(snapshot: QueryDocumentSnapshot<DocumentData>) {
        super(snapshot, StorageLogs.converter);
        const data = snapshot.data();

        this.before = [];
        this.after = [];
        this.updatedBy = data.updatedBy;
        this.updatedOn = data.updatedOn.toDate();
        this.change = [];
        this.updateType = data.updateType;

        
        data.before.forEach(inv => {
            this.before.push(new Inventory(inv));
        });
        data.after.forEach(inv => {
            this.after.push(new Inventory(inv));
        });
        data.change?.forEach(inv => {
            this.change.push(new Change(inv));
        });
    }

    public static converter = {
        toFirestore(data: StorageLogs): DocumentData {
            return {
                before: data.before,
                after: data.after,
                updatedBy: data.updatedBy,
                updatedOn: data.updatedOn,
                change: data.change,
                updateType: data.updateType,
            }
        },
        fromFirestore(snapshot: QueryDocumentSnapshot<any>, options: SnapshotOptions): StorageLogs {
            return new StorageLogs(snapshot);
        }
    }

    public getCollectionReference(): CollectionReference<StorageLogs> {
        return this.ref.parent.withConverter(StorageLogs.converter);
    }

    public static getCollectionReference(db: Firestore, company: string, plant: string): CollectionReference<StorageLogs> {
        return collection(Plant.getDocReference(db, company, plant), "storageLogs").withConverter(StorageLogs.converter);
    }

    public static getStorageLogListDateRange(db: Firestore, company: string, plant: string, startDate: Date, endDate: Date): Promise<StorageLogs[]> {
        const collectionQuery = query(
            StorageLogs.getCollectionReference(db, company, plant), 
            where("updatedOn", ">=", startDate), 
            where("updatedOn", "<=", endDate),
            orderBy("updatedOn", 'asc'));

        return getDocs(collectionQuery).then(result => {
            return result.docs.map(s => s.data());
        });
    }

    public static getLastStorageLogBeforeDate(db: Firestore, company: string, plant: string, date: Date): Promise<StorageLogs> {
        const collectionQuery = query(
            StorageLogs.getCollectionReference(db, company, plant), 
            where("updatedOn", "<", date), 
            orderBy("updatedOn", 'asc'),
            limit(1));

        return getDocs(collectionQuery).then(result => {
            return result.docs[0]?.data();
        });
    }
}

export class Change {
    type: string;
    tank: string;
    amount?: Mass;

    constructor(data: any) {
        this.type = data.type;
        this.tank = data.tank;
        this.amount = data.amount ? new Mass(data.amount, FirebaseDocInterface.session.getDefaultUnit()) : null;
    }
}