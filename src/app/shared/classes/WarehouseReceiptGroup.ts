import { AngularFirestore, AngularFirestoreCollection, CollectionReference, DocumentData, DocumentReference, Query, QueryDocumentSnapshot, SnapshotOptions } from "@angular/fire/compat/firestore";
import { FirebaseDocInterface } from "./FirebaseDocInterface";

export class WarehouseReceiptGroup extends FirebaseDocInterface {
    public purchaseContract: WarehouseReceiptContract | null;
    public saleContract: WarehouseReceiptContract | null;
    public warehouseReceiptIdList: number[];
    public warehouseReceiptList: WarehouseReceipt[];

    public date: Date;
    public status: WarehouseReceiptStatus;
    public totalBushelQuantity: number;

    constructor(snapshot: QueryDocumentSnapshot<any>) {
        super(snapshot, WarehouseReceiptGroup.converter);

        const data = snapshot.data();

        this.date = data.date?.toDate();
        this.purchaseContract = data.purchaseContract;
        this.saleContract = data.saleContract;
        this.totalBushelQuantity = data.totalBushelQuantity;
        this.warehouseReceiptIdList = data.warehouseReceiptIdList;
        this.warehouseReceiptList = data.warehouseReceiptList;
    }

    public static converter = {
        toFirestore(data: WarehouseReceiptGroup): DocumentData {
            return {
                date: data.date,
                purchaseContract: data.purchaseContract,
                saleContract: data.saleContract,
                totalBushelQuantity: data.totalBushelQuantity,
                warehouseReceiptIdList: data.warehouseReceiptIdList,
                warehouseReceiptList: data.warehouseReceiptList
            }
        },
        fromFirestore(snapshot: QueryDocumentSnapshot<any>, options: SnapshotOptions): WarehouseReceiptGroup {
            return new WarehouseReceiptGroup(snapshot);
        }
    };

    public getWrCollectionReference = (): CollectionReference<WarehouseReceiptGroup> => {
        return this.ref.parent.withConverter(WarehouseReceiptGroup.converter);
    }

    public static getCollectionReference = (db: AngularFirestore, company: string) => {
        return db.firestore.collection(`companies/${company}/warehouseReceipts`)
        .withConverter(WarehouseReceiptGroup.converter);
    }

    public static getWarehouseReceiptGroupList = async (
        db: AngularFirestore,
        company: string,
        queryFn?: <T>(q: Query<T> | CollectionReference<T>) => Query<T>
    ): Promise<WarehouseReceiptGroup[]> => {

        let wrCollectionRef: CollectionReference<WarehouseReceiptGroup> | Query<WarehouseReceiptGroup> 
        = WarehouseReceiptGroup.getCollectionReference(db, company);

        if (queryFn) {
            wrCollectionRef = queryFn<WarehouseReceiptGroup>(wrCollectionRef);
        }
        wrCollectionRef = wrCollectionRef.orderBy('id', 'asc');

        return wrCollectionRef.get().then(result => {
            return result.docs.map(doc => doc.data());
        });
    }
    
}

export class WarehouseReceipt {
    public bushelQuantity: number;
    public date: Date;
    public id: number;
    public plant: string;
    public product: string;
}

class WarehouseReceiptContract {
    public base: number;
    public date: Date;
    public futurePrice: number;
    public id: string;
    public pdfReference: string;
    public status: WarehouseReceiptStatus;
}

enum WarehouseReceiptStatus {
    pending = 'pending',
    active = 'active',
    closed = 'closed',
    cancelled = 'cancelled'
}