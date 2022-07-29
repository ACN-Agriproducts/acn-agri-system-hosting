import { AngularFirestore, AngularFirestoreCollection, CollectionReference, DocumentData, DocumentReference, Query, QueryDocumentSnapshot, SnapshotOptions } from "@angular/fire/compat/firestore";
import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { Plant } from "./plant";
import { Product } from "./product";

export class WarehouseReceiptGroup extends FirebaseDocInterface {
    public purchaseContract: WarehouseReceiptContract;
    public salesContract: WarehouseReceiptContract;
    public status: WarehouseReceiptStatus;
    public warehouseReceiptIdList: number[];
    public warehouseReceiptList: WarehouseReceipt[];
}

class WarehouseReceipt {
    public id: number;
    public date: Date;
    public product: Product;
    public bushelQuantity: number;
    public plant: Plant;
}

class WarehouseReceiptContract {
    public id: string;
    public futurePrice: number;
    public base: number;
    public date: Date;
    public status: WarehouseReceiptStatus;
}

enum WarehouseReceiptStatus {
    pending = 'pending',
    active = 'active',
    closed = 'closed',
    cancelled = 'cancelled'
}