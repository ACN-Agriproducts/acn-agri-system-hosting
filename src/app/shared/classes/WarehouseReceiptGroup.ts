import { Firestore, CollectionReference, DocumentData, QueryDocumentSnapshot, SnapshotOptions, collection, query, QueryConstraint, getDocs, orderBy, collectionData, Query } from "@angular/fire/firestore";
import { onSnapshot } from "firebase/firestore";
import { Observable } from "rxjs";
import { FirebaseDocInterface } from "./FirebaseDocInterface";

export class WarehouseReceiptGroup extends FirebaseDocInterface {
    public closedAt: Date | null;
    public createdAt: Date;
    public expiredAt: Date | null;
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

        this.closedAt = data.closedAt?.toDate();
        this.createdAt = data.createdAt?.toDate();
        this.expiredAt = data.expiredAt?.toDate();
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
                closedAt: data.closedAt,
                createdAt: data.createdAt,
                expiredAt: data.expiredAt,
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

    public static getWrGroupListValueChanges = (db: Firestore, company: string): Observable<WarehouseReceiptGroup[]> => {
        const wrCollectionQuery = query(WarehouseReceiptGroup.getWrCollectionReference(db, company), orderBy('createdAt', 'desc'));
        return collectionData(wrCollectionQuery);
    }

    public getRawReceiptList = () => {
        const receiptList = [];

        this.warehouseReceiptList.forEach(receipt => {
            receiptList.push(receipt.getRawData());
        });

        return receiptList;
    }
    
    public static getGroupList(db: Firestore, company: string, ...constraints: QueryConstraint[]): Promise<WarehouseReceiptGroup[]> {
        const colQuery = query(WarehouseReceiptGroup.getWrCollectionReference(db, company), ...constraints);
        return getDocs(colQuery).then(value => {
            return value.docs.map(wrg => wrg.data());
        });
    }

    public static onSnapshot = (
        ref: CollectionReference<WarehouseReceiptGroup> | Query<WarehouseReceiptGroup>, 
        list: WarehouseReceiptGroup[]
    ) => {
        let first = true;
        let cloneList;

        onSnapshot(ref, next => {
            cloneList = JSON.parse(JSON.stringify(list));

            if (first) {
                console.log('FIRST');
                list.push(...next.docs.map(doc => doc.data()));
                first = false;
                return;
            }
            
            next.docChanges().forEach(change => {
                const data = change.doc.data();

                if (change.type === 'added') {
                    list.splice(change.newIndex, 0, data);
                }

                if (change.type === 'modified') {
                    console.log("modified");
                    const listChanged = data.warehouseReceiptList.some((receipt, index) => {
                        const cloneReceipt = cloneList[change.oldIndex].warehouseReceiptList[index];

                        console.log("Original: ", JSON.stringify(receipt));
                        console.log("Copy: ", JSON.stringify(cloneReceipt));

                        return JSON.stringify(receipt) != JSON.stringify(cloneReceipt)
                    });

                    console.log(listChanged);

                    if (listChanged) {
                        console.log("Warehouse Receipt List changed");
                        list[change.oldIndex].warehouseReceiptList = data.warehouseReceiptList;
                    }
                    else {
                        console.log("Something else changed.");
                        list[change.oldIndex] = data;
                    }
                }

                if (change.type === 'removed') {
                    list.splice(change.oldIndex, 1);
                }
            });
        },
        error => {
            console.log("Error: ", error);
        });
    }

    public static getStatusType(): typeof Status {
        return Status;
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

    public getRawData() {
        return Object.assign({}, this);
    }
}

export class WarehouseReceiptContract {
    public basePrice: number;
    public closedAt: Date;
    public futurePrice: number;
    public id: string;
    public pdfReference: string | null;
    public startDate: Date;
    public status: Status;

    constructor(data: any) {
        this.basePrice = data.basePrice;
        this.closedAt = data.closedAt?.toDate();
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