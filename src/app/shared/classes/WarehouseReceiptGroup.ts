import { Firestore, CollectionReference, DocumentData, QueryDocumentSnapshot, SnapshotOptions, collection, query, QueryConstraint, getDocs, orderBy, collectionData } from "@angular/fire/firestore";
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
        this.purchaseContract = data.purchaseContract ? new WarehouseReceiptContract(data.purchaseContract) : null;
        this.saleContract = data.saleContract ? new WarehouseReceiptContract(data.saleContract) : null;
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

    public static getWrCollectionReference = (db: Firestore, company: string): CollectionReference<WarehouseReceiptGroup> => {
        return collection(db, `companies/${company}/warehouseReceipts`)
        .withConverter(WarehouseReceiptGroup.converter);
    }

    /* public static getWarehouseReceiptGroupList = async (
        db: Firestore, 
        company: string, 
        ...constraints: QueryConstraint[]
    ): Promise<WarehouseReceiptGroup[]> => {

        constraints.push(orderBy('creationDate', 'desc'));
        const wrCollectionQuery = query(WarehouseReceiptGroup.getWrCollectionReference(db, company), ...constraints);

        return getDocs(wrCollectionQuery).then(result => {
            return result.docs.map(doc => doc.data());
        });
    } */

    public static getWrGroupListValueChanges = (db: Firestore, company: string): Observable<WarehouseReceiptGroup[]> => {
        const wrCollectionQuery = query(WarehouseReceiptGroup.getWrCollectionReference(db, company), orderBy('creationDate', 'desc'));
        return collectionData(wrCollectionQuery);
    }
}

export class WarehouseReceipt {
    public bushelQuantity: number;
    public startDate: Date;
    public id: number;
    public plant: string;
    public product: string;
    public isPaid: boolean;

    constructor(data: any) {
        this.bushelQuantity = data.bushelQuantity;
        this.startDate = data.startDate?.toDate();
        this.id = data.id;
        this.plant = data.plant;
        this.product = data.product;
        this.isPaid = data.isPaid;
    }
}

export class WarehouseReceiptContract {
    public basePrice: number;
    public futurePrice: number;
    public id: string;
    public pdfReference: string | null;
    public startDate: Date;
    public status: Status;

    constructor(data: any) {
        this.basePrice = data.basePrice;
        this.futurePrice = data.futurePrice;
        this.id = data.id;
        this.pdfReference = data.pdfReference;
        this.startDate = data.startDate?.toDate();
        this.status = data.status;
    }
}

enum Status {
    pending = 'PENDING',
    active = 'ACTIVE',
    closed = 'CLOSED',
    cancelled = 'CANCELLED'
}