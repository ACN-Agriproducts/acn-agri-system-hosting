import { DocumentData } from "rxfire/firestore/interfaces";
import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { CollectionReference, DocumentReference, QueryDocumentSnapshot, SnapshotOptions } from "firebase/firestore";
import { Firestore, collection, doc, getDoc, getDocs, limit, orderBy, query, where } from "@angular/fire/firestore";
import { units } from "./mass";

export class DiscountTables extends FirebaseDocInterface {
    date: Date;
    tables: DiscountTable[];

    constructor(snapshotOrRef?: QueryDocumentSnapshot<any> | DocumentReference<any>) {
        let snapshot;
        if(snapshotOrRef instanceof QueryDocumentSnapshot) {
            snapshot = snapshotOrRef
        }
        
        super(snapshot, DiscountTables.converter);
        const data = snapshot?.data();

        if(snapshotOrRef instanceof DocumentReference) {
            this.ref = snapshotOrRef;

            this.date = new Date();
            this.tables = [];
            
            return;
        }

        if(data == undefined) return;

        this.date = data.date?.toDate();
        this.tables = data.tables?.map(table => new DiscountTable(table)) ?? [];
    }

    public static converter = {
        toFirestore(data: DiscountTables): DocumentData {
            return {
                date: data.date,
                tables: data.tables.map(table => ({ ...table }))
            }
        },
        fromFirestore(snapshot: QueryDocumentSnapshot, options?: SnapshotOptions): DiscountTables {
            return new DiscountTables(snapshot);
        }
    }

    public static getCollectionReference(db: Firestore, company: string, product: string): CollectionReference<DiscountTables> {
        return collection(db, `companies/${company}/products/${product}/discounts`).withConverter(DiscountTables.converter);
    }

    public static getDiscountTables(db: Firestore, company: string, product: string, date?: Date): Promise<DiscountTables> {
        const collectionRef = DiscountTables.getCollectionReference(db, company, product);
        const collectionQuery = query(collectionRef, date ? where('date', '==', date) : orderBy('date', 'desc'), limit(1));
        return getDocs(collectionQuery).then(result => result.docs[0]?.data());
    }
}

export interface DiscountTableHeader {
    name: string;
    type?: "weight-discount" | "price-discount";
}

export interface DiscountTableRow {
    low?: number;
    high?: number;
    discount?: number;
    [columnName: string]: number;
}

export class DiscountTable {
    name: string = "";
    fieldName: string = "";
    headers: DiscountTableHeader[] = [];
    data: DiscountTableRow[] = [];
    unit: units;

    constructor(tableData?: any) {
        if (tableData) {
            this.name = tableData.name;
            this.fieldName = tableData.fieldName;
            this.headers = tableData.headers.map(header => ({ ...header }));
            this.data = tableData.data.map(item => ({ ...item }));
            this.unit = tableData.unit;
        }
    }

    public addTableData(tableData?: any): void {
        const length = this.data.push({});
        this.headers.forEach(header => this.data[length - 1][header.name] = tableData?.[header.name] ?? 0);
    }
}
