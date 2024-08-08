import { collection, CollectionReference, DocumentData, DocumentReference, Firestore, getDocs, getDocsFromServer, limit, orderBy, Query, query, QueryDocumentSnapshot, SnapshotOptions, where } from "@angular/fire/firestore";
import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { Company } from "./company";
import { Mass } from "./mass";

export interface ProductsMetrics {
    [productName: string]: {
        totalSales: number;
        totalPurchases: number;
        totalToBeDelivered: Mass;
        totalToBeReceived: Mass;
        totalSalesAmount: Mass;
        totalPurchasesAmount: Mass;
    }
}

export class DashboardData extends FirebaseDocInterface {
    // monthly date, in the middle of the month
    // EX: JUN 15, 2024
    date: Date;
    latestMetrics: ProductsMetrics;
    // settings: {
    //     [settingName: string]: {
    //         value: any;
    //     }
    // }

    constructor(snapshotOrRef: QueryDocumentSnapshot<any> | DocumentReference<any>) {
        if (snapshotOrRef instanceof QueryDocumentSnapshot) {
            const snapshot = snapshotOrRef;

            super(snapshot, DashboardData.converter);
            const data = snapshot.data();

            if (data == null) return;
    
            this.date = data.date;
            this.latestMetrics = data.latestMetrics;
        }
        else if (snapshotOrRef instanceof DocumentReference) {
            super(null, DashboardData.converter)

            this.ref = snapshotOrRef;
            this.date = new Date();
            this.latestMetrics = {};
        }
    };

    public static converter = {
        toFirestore(data: DashboardData): DocumentData {
            return {
                date: data.date,
                latestMetrics: data.latestMetrics,
            };
        },
        fromFirestore(snapshot: QueryDocumentSnapshot<any>, options: SnapshotOptions): DashboardData {
            return new DashboardData(snapshot);
        }
    };

}
