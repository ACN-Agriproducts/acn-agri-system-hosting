import { AngularFirestore, AngularFirestoreCollection, CollectionReference, DocumentData, DocumentReference, Query, QueryDocumentSnapshot, SnapshotOptions } from "@angular/fire/compat/firestore";
import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { Plant } from "./plant";
import { Product } from "./product";

export class WarehouseReceiptGroup extends FirebaseDocInterface {
    public purchaseContract: WarehouseReceiptContract | null;
    public saleContract: WarehouseReceiptContract | null;
    public warehouseReceiptIdList: number[];
    public warehouseReceiptList: WarehouseReceipt[];

    public date: Date;
    public status: WarehouseReceiptStatus;
    public totalBushelQuantity: number;
    
}

class WarehouseReceipt {
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