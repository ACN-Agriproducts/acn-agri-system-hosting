import { DocumentReference, QueryDocumentSnapshot, SnapshotOptions, DocumentData, CollectionReference, collection, Firestore, QueryConstraint, query, getDocs } from "@angular/fire/firestore";
import { FirebaseDocInterface, status } from "./FirebaseDocInterface";
import { Plant } from "./plant";

export class BaggingOrder extends FirebaseDocInterface {
    date: Date;
    fulfilledDate: Date;
    status: status;
    docRefs: string[];
    orderBy: DocumentReference;
    orderByName: string;
    orderInfo: {
        quantity: number;
        itemRef: DocumentReference;
        affectsInventory: boolean;
    }[];

    constructor(snapshot: QueryDocumentSnapshot<any>);
    constructor(ref: DocumentReference<any>);
    constructor(snapshotOrRef: QueryDocumentSnapshot<any> | DocumentReference<any>) {
        let snapshot;
        if(snapshotOrRef instanceof QueryDocumentSnapshot) {
            snapshot = snapshotOrRef
        }
        
        super(snapshot, BaggingOrder.converter);
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
        this.orderBy = data.orderBy;
        this.orderByName = data.orderByName;
        this.orderInfo = data.orderInfo;
    }

    public static converter = {
        toFirestore(data: BaggingOrder): DocumentData {
            return {
                date: data.date,
                fulfilledDate: data.fulfilledDate,
                status: data.status,
                docRefs: data.docRefs,
                orderBy: data.orderBy,
                orderByName: data.orderByName,
                orderInfo: data.orderInfo
            }
        },
        fromFirestore(snapshot: QueryDocumentSnapshot<any>, options: SnapshotOptions): BaggingOrder {
            return new BaggingOrder(snapshot);
        }
    }

    public static getList(db: Firestore, company: string, plant: string, ...constraints: QueryConstraint[]): Promise<BaggingOrder[]> {
        const collectionRef = BaggingOrder.getCollectionReference(db, company, plant);
        const collectionQuery = query(collectionRef, ...constraints);
        return getDocs(collectionQuery).then(result => {
            return result.docs.map(snap => snap.data());
        });
    }

    public static getCollectionReference(db: Firestore, company: string, plant: string): CollectionReference<BaggingOrder> {
        return collection(Plant.getDocReference(db, company, plant), "inventoryOrders").withConverter(BaggingOrder.converter);
    }
}