import { Firestore, CollectionReference, DocumentData, Query, QueryDocumentSnapshot, SnapshotOptions, collection, QueryConstraint, query, orderBy, getDocs } from "@angular/fire/firestore";
import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { Product } from "./product";


export class WarehouseReceipt extends FirebaseDocInterface{
    public bushelQuantity: number;
    public cancelDate: Date;
    public closeDate: Date | null;
    public expDate: Date;
    public id: number;
    public product: Product;
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

        this.bushelQuantity = data.bushelQuantity;
        this.cancelDate = data.cancelDate?.toDate();
        this.closeDate = data.closeDate;
        this.expDate = data.expDate?.toDate();
        this.id = data.id;
        this.product = data.product;
        this.purchaseBase = data.purchaseBase;
        this.purchaseContractNumber = data.purchaseContractNumber;
        this.purchaseDate = data.purchaseDate?.toDate();
        this.purchaseFuturePrice = data.purchaseFuturePrice;
        this.saleContractId = data.saleContractId;
        this.saleDate = data.saleDate?.toDate();
        this.saleFuturePrice = data.saleFuturePrice;
        this.salePrice = data.salePrice;
        this.startDate = data.startDate?.toDate();
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

    public getCollectionReference = (): CollectionReference<WarehouseReceipt> => {
        return this.ref.parent.withConverter(WarehouseReceipt.converter);
    }

    public static getWRCollectionReference = (db: Firestore, company: string, plant: string): CollectionReference<WarehouseReceipt> => {
        return collection(db, `companies/${company}/plants/${plant}/warehouseReceipts`)
            .withConverter(WarehouseReceipt.converter);
    }

    public static getWarehouseReceipts = async (
        db: Firestore, 
        company: string, 
        plant: string, 
        ...constraints: QueryConstraint[]
    ): Promise<WarehouseReceipt[]> => {

        constraints.push(orderBy('id', 'asc'));
        const warehouseReceiptCollectionRef = query(WarehouseReceipt.getWRCollectionReference(db, company, plant));

        return getDocs(warehouseReceiptCollectionRef).then(result => {
            return result.docs.map(doc => doc.data());
        });
    }

    // will have to use this if a Search Bar is to be added
    public static getWarehouseReceipt = (): WarehouseReceipt => {
        return;
    }

    // get the product object corresponding to the product saved in the receipt
    public getProductList = (): Promise<any> => {
        return;
    }

    public static getStatus = (): typeof status => {
       return status;
    }
}

enum status {
    pending = 'pending',
    active = 'active',
    closed = 'closed',
    cancelled = 'cancelled'
}