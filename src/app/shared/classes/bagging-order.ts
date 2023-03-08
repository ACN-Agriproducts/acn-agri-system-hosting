import { DocumentReference, QueryDocumentSnapshot } from "@angular/fire/firestore";
import { DocumentData } from "rxfire/firestore/interfaces";
import { FirebaseDocInterface, status } from "./FirebaseDocInterface";

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
}