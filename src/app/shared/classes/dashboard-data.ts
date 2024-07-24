import { collection, CollectionReference, DocumentData, DocumentReference, Firestore, getDocs, getDocsFromServer, limit, orderBy, Query, query, QueryDocumentSnapshot, SnapshotOptions, where } from "@angular/fire/firestore";
import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { Company } from "./company";

export class DashboardData extends FirebaseDocInterface {
    // monthly date, in the middle of the month
    // EX: JUN 15, 2024
    date: Date;
    latestMetrics: {
        [productName: string]: {
            totalSales: number;
            totalPurchases: number;
            totalToBeDelivered: number;
            totalToBeReceived: number;
        }
    }
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

    public static getCollectionRef = (db: Firestore, company: string): CollectionReference<DashboardData> => {
        return collection(Company.getCompanyRef(db, company), 'dashboard-data').withConverter(DashboardData.converter);
    }

    public static getLatestDashboardMetrics(db: Firestore, company: string): Promise<DashboardData> {
        const colQuery = query(DashboardData.getCollectionRef(db, company), orderBy('date', 'desc'), limit(1));
        return getDocs(colQuery).then(result => {
            return result.docs[0].data()
        });
    }

}
