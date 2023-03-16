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
    orderInfo: {
        quantity: number;
        name: string;
        itemRef: DocumentReference;
        affectsInventory: boolean;
    }[];
    plant: DocumentReference<Plant>;

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

        this.date = data.date;
        this.fulfilledDate = data.fulfilledDate;
        this.status = data.status;
        this.docRefs = data.docRefs;
        this.orderOwner = data.orderOwner;
        this.orderOwnerName = data.orderOwnerName;
        this.orderInfo = data.orderInfo;
    }

    public static converter = {
        toFirestore(data: ProductionOrder): DocumentData {
            return {
                date: data.date,
                fulfilledDate: data.fulfilledDate,
                id: data.id,
                status: data.status,
                docRefs: data.docRefs,
                orderOwner: data.orderOwner,
                orderOwnerName: data.orderOwnerName,
                orderInfo: data.orderInfo,
                plant: data.plant,
            }
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