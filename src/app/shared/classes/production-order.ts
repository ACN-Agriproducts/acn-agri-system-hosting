import { DocumentReference, QueryDocumentSnapshot, SnapshotOptions, DocumentData, CollectionReference, collection, Firestore, QueryConstraint, query, getDocs } from "@angular/fire/firestore";
import { Company } from "./company";
import { FirebaseDocInterface, status } from "./FirebaseDocInterface";
import { Plant } from "./plant";

export class ProductionOrder extends FirebaseDocInterface {
    date: Date;
    fulfilledDate: Date;
    id: number;
    status: status;
    docRefs: string[];
    orderOwner: DocumentReference;
    orderOwnerName: string;
    orderInfo: orderItem[];
    plant: DocumentReference<Plant>;
    type: string;

    constructor();
    constructor(snapshot: QueryDocumentSnapshot<any>);
    constructor(ref: DocumentReference<any>);
    constructor(snapshotOrRef?: QueryDocumentSnapshot<any> | DocumentReference<any>) {
        let snapshot;
        if(snapshotOrRef instanceof QueryDocumentSnapshot) {
            snapshot = snapshotOrRef
        }
        
        super(snapshot, ProductionOrder.converter);
        const data = snapshot?.data();

        if(snapshotOrRef instanceof DocumentReference) {
            this.ref = snapshotOrRef;
            return;
        }

        if(data == undefined) return;

        this.date = data.date.toDate();
        this.fulfilledDate = data.fulfilledDate;
        this.id = data.id;
        this.status = data.status;
        this.docRefs = data.docRefs;
        this.orderOwner = data.orderOwner;
        this.orderOwnerName = data.orderOwnerName;
        this.orderInfo = [];
        this.plant = data.plant;
        this.type = data.type;

        data.orderInfo.forEach(element => {
            this.orderInfo.push(element);
        });
        
    }

    public static converter = {
        toFirestore(data: ProductionOrder): DocumentData {
            const doc = {
                date: data.date,
                fulfilledDate: data.fulfilledDate,
                id: data.id,
                status: data.status,
                docRefs: data.docRefs,
                orderOwner: data.orderOwner,
                orderOwnerName: data.orderOwnerName,
                orderInfo: [],
                plant: data.plant,
                type: data.type,
            }

            data.orderInfo.forEach((item, index) => {
                doc.orderInfo.push({
                    quantity: item.quantity,
                    name: item.name,
                    itemRef: item.itemRef,
                    affectsInventory: item.affectsInventory,
                    inventoryInfo: [],
                });

                item.inventoryInfo.forEach(info => {
                    doc.orderInfo[index].inventoryInfo.push({...info});
                });
            });

            return doc;
        },
        fromFirestore(snapshot: QueryDocumentSnapshot<any>, options: SnapshotOptions): ProductionOrder {
            return new ProductionOrder(snapshot);
        }
    }

    public static getList(db: Firestore, company: string, ...constraints: QueryConstraint[]): Promise<ProductionOrder[]> {
        const collectionRef = ProductionOrder.getCollectionReference(db, company);
        const collectionQuery = query(collectionRef, ...constraints);
        return getDocs(collectionQuery).then(result => {
            return result.docs.map(snap => snap.data());
        });
    }

    public static getCollectionReference(db: Firestore, company: string): CollectionReference<ProductionOrder> {
        return collection(Company.getCompanyRef(db, company), "productionOrders").withConverter(ProductionOrder.converter);
    }
}

export class orderItem {
    quantity: number;
    name: string;
    itemRef: DocumentReference;
    affectsInventory: boolean;
    inventoryInfo: orderItemInfo[];

    constructor(data: any) {
        this.quantity = data.quantity;
        this.name = data.name;
        this.itemRef = data.itemRef;
        this.affectsInventory = data.affectsInventory;
        this.inventoryInfo = [];

        data.inventoryInfo?.info.forEach(element => {
            this.inventoryInfo.push(element);
        });
    }
}

export class orderItemInfo {
    public product: string;
    public quantity: number;
    public tank: string;

    constructor(data: any) {
        this.product = data.product;
        this.quantity = data.quantity;
        this.tank = data.tank;
    }
}