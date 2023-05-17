import { DocumentData } from "rxfire/firestore/interfaces";
import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { CollectionReference, DocumentReference, QueryDocumentSnapshot, SnapshotOptions } from "firebase/firestore";
import { Firestore, collection, getDocs } from "@angular/fire/firestore";

export class DiscountTables extends FirebaseDocInterface {
    date: Date;
    tables: DiscountTable[];

    // constructor();
    // constructor(snapshot: QueryDocumentSnapshot<any>);
    // constructor(ref: DocumentReference<any>);
    constructor(snapshotOrRef?: QueryDocumentSnapshot<any> | DocumentReference<any>) {
        let snapshot;
        if(snapshotOrRef instanceof QueryDocumentSnapshot) {
            snapshot = snapshotOrRef
        }
        
        super(snapshot, DiscountTables.converter);
        const data = snapshot?.data();

        if(snapshotOrRef instanceof DocumentReference) {
            this.ref = snapshotOrRef;
            return;
        }

        if(data == undefined) return;

        this.date = data.date.toDate();
        this.tables = [];

        data.tables.forEach(table => {
            this.tables.push(table);
        });
    }

    public static converter = {
        toFirestore(data: DiscountTables): DocumentData {
            const doc = {
                date: data.date,
                tables: []
            }

            data.tables.forEach(table => {
                doc.tables.push({
                    name: table.name,
                    field: table.field
                });
            });

            return doc;
        },
        fromFirestore(snapshot: QueryDocumentSnapshot, options?: SnapshotOptions): DiscountTables {
            return new DiscountTables(snapshot);
        }
    }

    public static getCollectionReference(db: Firestore, company: string, product: string): CollectionReference<DiscountTables> {
        return collection(db, `companies/${company}/products/${product}/discounts`).withConverter(DiscountTables.converter);
    }

    public static getDiscountTables(db: Firestore, company: string, product: string): Promise<DiscountTables[]> {
        return getDocs(DiscountTables.getCollectionReference(db, company, product)).then(res => {
            return res.docs.map(doc => doc.data());
        });
    }
}

class DiscountTable {
    name: string;
    field: string;
    data: any[];

    constructor(tableData: any) {
        this.name = tableData.name;
        this.field = tableData.field;
        this.data = [];

        tableData.data.forEach(item => {
            this.data.push(item);
        });
    }
}

interface MoistureData {
    bonus: number;
    charge: number;
    high: number;
    low: number;
    weightDiscount: number;
}

interface DamageData {
    range: number;
    grade: string;
    weightDiscount: number;
}
