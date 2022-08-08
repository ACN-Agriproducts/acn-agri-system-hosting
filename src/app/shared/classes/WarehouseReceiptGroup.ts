import { AngularFirestore, AngularFirestoreCollection, CollectionReference, DocumentData, DocumentReference, Query, QueryDocumentSnapshot, SnapshotOptions } from "@angular/fire/compat/firestore";
import { FirebaseDocInterface } from "./FirebaseDocInterface";

export class WarehouseReceiptGroup extends FirebaseDocInterface {
    public creationDate: Date;
    public purchaseContract: WarehouseReceiptContract | null;
    public saleContract: WarehouseReceiptContract | null;
    public status: WarehouseReceiptStatus;
    public totalBushelQuantity: number;
    public warehouseReceiptIdList: number[];
    public warehouseReceiptList: WarehouseReceipt[];

    constructor(snapshot: QueryDocumentSnapshot<any>) {
        super(snapshot, WarehouseReceiptGroup.converter);

        const data = snapshot.data();

        this.creationDate = data.creationDate?.toDate();
        this.purchaseContract = data.purchaseContract;
        this.saleContract = data.saleContract;
        this.status = data.status;
        this.totalBushelQuantity = data.totalBushelQuantity;
        this.warehouseReceiptIdList = data.warehouseReceiptIdList;
        this.warehouseReceiptList = data.warehouseReceiptList;
    }

    public static converter = {
        toFirestore(data: WarehouseReceiptGroup): DocumentData {
            return {
                creationDate: data.creationDate,
                purchaseContract: data.purchaseContract,
                saleContract: data.saleContract,
                status: data.status,
                totalBushelQuantity: data.totalBushelQuantity,
                warehouseReceiptIdList: data.warehouseReceiptIdList,
                warehouseReceiptList: data.warehouseReceiptList
            }
        },
        fromFirestore(snapshot: QueryDocumentSnapshot<any>, options: SnapshotOptions): WarehouseReceiptGroup {
            return new WarehouseReceiptGroup(snapshot);
        }
    };

    public getCollectionReference = (): CollectionReference<WarehouseReceiptGroup> => {
        return this.ref.parent.withConverter(WarehouseReceiptGroup.converter);
    }

    public static getWrCollectionReference = (db: AngularFirestore, company: string): CollectionReference<WarehouseReceiptGroup> => {
        return db.firestore.collection(`companies/${company}/warehouseReceipts`)
        .withConverter(WarehouseReceiptGroup.converter);
    }

    public static getWarehouseReceiptGroupList = async (
        db: AngularFirestore,
        company: string,
        queryFn?: <T>(q: Query<T> | CollectionReference<T>) => Query<T>
    ): Promise<WarehouseReceiptGroup[]> => {

        let wrCollectionRef: CollectionReference<WarehouseReceiptGroup> | Query<WarehouseReceiptGroup> 
        = WarehouseReceiptGroup.getWrCollectionReference(db, company);

        if (queryFn) {
            wrCollectionRef = queryFn<WarehouseReceiptGroup>(wrCollectionRef);
        }
        wrCollectionRef = wrCollectionRef.orderBy('creationDate', 'desc');

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