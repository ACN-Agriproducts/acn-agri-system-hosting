import { Firestore, CollectionReference, DocumentData, DocumentReference, QueryDocumentSnapshot, SnapshotOptions, collection, doc, collectionData, getDocs } from "@angular/fire/firestore";
import { Observable } from "rxjs";

import { FirebaseDocInterface } from "./FirebaseDocInterface";

export class InvoiceItem extends FirebaseDocInterface {
    affectsInventory: boolean;
    inventoryInfo: inventoryInfo;
    name: string;
    price: number;

    constructor(snapshot: QueryDocumentSnapshot<any>);
    constructor(snapshot: DocumentReference<any>);
    constructor(snapshotOrRef: QueryDocumentSnapshot<any> | DocumentReference<any>) {
        let snapshot;
        if (snapshotOrRef instanceof QueryDocumentSnapshot) {
            snapshot = snapshotOrRef;
        }

        super(snapshot, InvoiceItem.converter);
        const data = snapshot?.data();

        if (snapshotOrRef instanceof DocumentReference) {
            this.ref = snapshotOrRef;
            return;
        }

        if (data == undefined) return;

        this.affectsInventory = data.affectsInventory;
        this.inventoryInfo = new inventoryInfo(data.inventoryInfo);
        this.name = data.name;
        this.price = data.price;
    }

    public static converter = {
        toFirestore(data: InvoiceItem): DocumentData {
            return {
                affectsInventory: data.affectsInventory,
                inventoryInfo: data.inventoryInfo.getRawData(),
                name: data.name,
                price: data.price ?? null
            }
        },
        fromFirestore(snapshot: QueryDocumentSnapshot<any>, options: SnapshotOptions): InvoiceItem {
            return new InvoiceItem(snapshot);
        }
    }

    public getCollectionReference(): CollectionReference<InvoiceItem> {
        return this.ref.parent.withConverter(InvoiceItem.converter);
    }

    public static getCollectionReference(db: Firestore, company: string): CollectionReference<InvoiceItem> {
        return collection(db, `companies/${company}/invoiceItems`).withConverter(InvoiceItem.converter);
    }

    public static getDocReference(db: Firestore, company: string, InvoiceItems: string): DocumentReference<InvoiceItem> {
        return doc(db, `companies/${company}/InvoiceItemss/${InvoiceItems}`).withConverter(InvoiceItem.converter);
    }

    public static getList(db: Firestore, company: string): Promise<InvoiceItem[]> {
        return getDocs(InvoiceItem.getCollectionReference(db, company)).then(value => {
            return value.docs.map(d => d.data());
        });
    }

    public static getCollectionValueChanges(db: Firestore, company: string): Observable<InvoiceItem[]> {
        return collectionData(InvoiceItem.getCollectionReference(db, company));
    }
}

export class inventoryInfo {
    info: info[];

    constructor(data: any) {
        this.info = [];

        data.info?.forEach(element => {
            this.info.push(new info(element));
        });
    }

    public getRawData(): any {
        return {
            info: this.info?.map(element => element?.getRawData())
        }
    }
}

export class info {
    plant: string;
    product: string;
    quantity: number;
    tank: string;

    constructor(data: any) {
        this.plant = data.plant;
        this.product = data.product;
        this.quantity = data.quantity;
        this.tank = data.tank;
    }

    public getRawData() {
        return Object.assign({}, this);
    }
}
