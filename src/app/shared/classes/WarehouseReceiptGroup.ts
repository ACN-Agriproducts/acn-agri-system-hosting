import { AngularFirestore, AngularFirestoreCollection, CollectionReference, DocumentData, DocumentReference, Query, QueryDocumentSnapshot, SnapshotOptions } from "@angular/fire/compat/firestore";
import { Observable } from "rxjs";
import { FirebaseDocInterface } from "./FirebaseDocInterface";

export class WarehouseReceiptGroup extends FirebaseDocInterface {
    public closeDate: Date | null;
    public creationDate: Date;
    public expireDate: Date | null;
    public purchaseContract: WarehouseReceiptContract | null;
    public saleContract: WarehouseReceiptContract | null;
    public status: Status;
    public totalBushelQuantity: number;
    public warehouseReceiptIdList: number[];
    public warehouseReceiptList: WarehouseReceipt[];

    public product: string;

    constructor(snapshot: QueryDocumentSnapshot<any>) {
        super(snapshot, WarehouseReceiptGroup.converter);

        const data = snapshot.data();

        this.closeDate = data.closeDate?.toDate();
        this.creationDate = data.creationDate?.toDate();
        this.expireDate = data.expireDate?.toDate();
        this.purchaseContract = data.purchaseContract;
        this.saleContract = data.saleContract;
        this.status = data.status;
        this.totalBushelQuantity = data.totalBushelQuantity;
        this.warehouseReceiptIdList = data.warehouseReceiptIdList;
        this.warehouseReceiptList = [];

        data.warehouseReceiptList.forEach(warehouseReceipt => {
            this.warehouseReceiptList.push(new WarehouseReceipt(warehouseReceipt));
        });

        this.product = this.warehouseReceiptList[0]?.product;
    }

    public static converter = {
        toFirestore(data: WarehouseReceiptGroup): DocumentData {
            return {
                closeDate: data.closeDate,
                creationDate: data.creationDate,
                expireDate: data.expireDate,
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

    public static getWrGroupListValueChanges = (db: AngularFirestore, company: string): Observable<WarehouseReceiptGroup[]> => {
        return db.collection<WarehouseReceiptGroup>(WarehouseReceiptGroup.getWrCollectionReference(db, company)).valueChanges();
    }
}

export class WarehouseReceipt {
    public bushelQuantity: number;
    public startDate: Date;
    public id: number;
    public plant: string;
    public product: string;

    constructor(data: any) {
        this.bushelQuantity = data.bushelQuantity;
        this.startDate = data.startDate?.toDate();
        this.id = data.id;
        this.plant = data.plant;
        this.product = data.product;
    }
}

class WarehouseReceiptContract {
    public base: number;
    public futurePrice: number;
    public id: string;
    public pdfReference: string;
    public startDate: Date;
    public status: Status;

    constructor(data: any) {
        this.base = data.base;
        this.futurePrice = data.futurePrice;
        this.id = data.id;
        this.pdfReference = data.pdfReference;
        this.startDate = data.startDate;
        this.status = data.status;
    }
}

enum Status {
    pending = 'pending',
    active = 'active',
    closed = 'closed',
    cancelled = 'cancelled'
}