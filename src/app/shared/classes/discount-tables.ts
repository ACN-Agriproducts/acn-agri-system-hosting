import { DocumentData } from "rxfire/firestore/interfaces";
import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { CollectionReference, DocumentReference, QueryConstraint, QueryDocumentSnapshot, SnapshotOptions } from "firebase/firestore";
import { Firestore, collection, getDocs, limit, orderBy, query, where } from "@angular/fire/firestore";

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
        return getDocs(query(
            DiscountTables.getCollectionReference(db, company, product), 
            date ? where('date', '==', date) : orderBy('date', 'asc'),
            limit(1)
        )).then(result => {
            return result.docs[0]?.data();
        });
    }
}

export class DiscountTable {
    name: string;
    fieldName: string;
    headers: string[];
    data: {
        [key: string]: number
    }[];

    constructor(tableData?: any) {
        this.name = tableData?.name ?? "";
        this.fieldName = tableData?.fieldName ?? "";
        this.headers = [ ...tableData?.headers ?? [] ];
        this.data = tableData?.data.map(item => item) ?? [];
    }

    public addTableData(tableData?: any): void {
        if (tableData) {
            this.data.push(tableData);
            return;
        }

        const length = this.data.push({});
        this.headers.forEach(header => this.data[length - 1][header] = 0);
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
