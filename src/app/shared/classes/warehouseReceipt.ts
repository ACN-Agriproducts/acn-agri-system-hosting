import { CollectionReference, DocumentData, DocumentReference, QueryDocumentSnapshot, SnapshotOptions } from "@angular/fire/compat/firestore";
import { FirebaseDocInterface } from "./FirebaseDocInterface";


export class WarehouseReceipt extends FirebaseDocInterface{
    public bushelQuantity: number;
    public cancelDate: Date;
    public closeDate: Date | null;
    public expDate: Date;
    public id: number;
    public product: string;
    public purchaseBase: number | null;
    public purchaseContractNumber: string | null;
    public purchaseDate: Date | null;
    public purchaseFuturePrice: number | null;
    public saleContractId: string;
    public saleDate: Date;
    public saleFuturePrice: number;
    public salePrice: number;
    public startDate: Date;
    public status: status;

    constructor(snapshot: QueryDocumentSnapshot<any>) {
        super(snapshot, WarehouseReceipt.converter);
        
        const data = snapshot.data();

        let tempWarehouseReceiptList: DocumentReference<WarehouseReceipt>[] = [];

        data.warehouseReceipts.forEach((warehouseReceipt: DocumentReference) => {
            tempWarehouseReceiptList.push(warehouseReceipt.withConverter(WarehouseReceipt.converter));
        });

        this.bushelQuantity = data.bushelQuantity;
        this.cancelDate = data.cancelDate;
        this.closeDate = data.closeDate;
        this.expDate = data.expDate;
        this.id = data.id;
        this.product = data.product;
        this.purchaseBase = data.purchaseBase;
        this.purchaseContractNumber = data.purchaseContractNumber;
        this.purchaseDate = data.purchaseDate;
        this.purchaseFuturePrice = data.purchaseFuturePrice;
        this.saleContractId = data.saleContractId;
        this.saleDate = data.saleDate;
        this.saleFuturePrice = data.saleFuturePrice;
        this.salePrice = data.salePrice;
        this.startDate = data.startDate;
        this.status = data.status;


    }

    public static converter = {
        toFirestore(data: WarehouseReceipt): DocumentData {
            return {
                bushelQuantity: data.bushelQuantity,
                cancelDate: data.cancelDate,
                closeDate: data.closeDate,
                expDate: data.expDate,
                id: data.id,
                product: data.product,
                purchaseBase: data.purchaseBase,
                purchaseContractNumber: data.purchaseContractNumber,
                purchaseDate: data.purchaseDate,
                purchaseFuturePrice: data.purchaseFuturePrice,
                saleContractId: data.saleContractId,
                saleDate: data.saleDate,
                saleFuturePrice: data.saleFuturePrice,
                salePrice: data.salePrice,
                startDate: data.startDate,
                status: data.status
            }
        },
        fromFirestore(snapshot: QueryDocumentSnapshot<any>, options: SnapshotOptions): WarehouseReceipt {
            return new WarehouseReceipt(snapshot);
        }
    };

    public getCollectionReference(): CollectionReference<WarehouseReceipt> {
        return this.ref.parent.withConverter(WarehouseReceipt.converter);
    }

    public getProduct(): Promise<any> {
        return;
    }
}

enum status {
    active = 'active',
    financing = 'financing',
    sold = 'sold',
    paid = 'paid',
    closed = 'closed',
    cancelled = 'cancelled'    
}