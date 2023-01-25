import { collection, Firestore, getDocs, limit, query, where } from "@angular/fire/firestore";
import { CollectionReference, QueryDocumentSnapshot, SnapshotOptions } from "firebase/firestore";
import { DocumentData } from "rxfire/firestore/interfaces";
import { Company } from "./company";
import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { Mass } from "./mass";

export class Analytics extends FirebaseDocInterface {
    companyGrainChange: {
        [product: string]: Change[];
    };
    contractGrain: {
        [product: string]: Change[];
    };
    plantGrainChange: {
        [plant: string]: {
            [product: string]: Change[];
        }
    };
    year: number;

    constructor(snapshot: QueryDocumentSnapshot<any>) {
        super(snapshot, Analytics.converter);
        const data = snapshot.data();

        // this.companyGrainChange = data.companyGrainChange;
        // this.contractGrain = data.contractGrain;
        // this.plantGrainChange = data.plantGrainChange;
        this.year = data.year;

        this.companyGrainChange = {};
        this.contractGrain = {};
        this.plantGrainChange = {};
        
        for(let product in data.companyGrainChange) {
            this.companyGrainChange[product] = [];

            for(let change of data.companyGrainChange[product]) {
                this.companyGrainChange[product].push(new Change(change));
            }
        }

        for(let product in data.contractGrain) {
            this.contractGrain[product] = [];

            for(let change of data.contractGrain[product]) {
                this.contractGrain[product].push(new Change(change));
            }
        }

        for(let plant in data.plantGrainChange) {
            this.plantGrainChange[plant] = {};

            for(let product in data.plantGrainChange[plant]) {
                this.plantGrainChange[plant][product] = [];

                for(let change of data.plantGrainChange[plant][product]) {
                    this.plantGrainChange[plant][product].push(new Change(change));
                }
            }
        }
    }

    public static converter = {
        toFirestore(data: Analytics): DocumentData {
            return {};
        },
        fromFirestore(snapshot: QueryDocumentSnapshot<any>, options: SnapshotOptions): Analytics {
            return new Analytics(snapshot);
        }
    }

    public static getAnalyticsReference(db: Firestore, company: string): CollectionReference<Analytics> {
        return collection(Company.getCompanyRef(db, company), "analytics").withConverter(Analytics.converter);
    }

    public static getAnalyticsForYear(db: Firestore, company: string, year: number): Promise<Analytics> {
        const collectionRef = Analytics.getAnalyticsReference(db, company);
        const collectionQuery = query(collectionRef, where("year", "==", year), limit(1));

        return getDocs(collectionQuery).then(result => {
            return result[0].data();
        });
    }

    public static getAnalyticsForLastNYears(db: Firestore, company: string, years: number): Promise<Analytics[]> {
        const currentYear = (new Date()).getFullYear();

        const collectionRef = Analytics.getAnalyticsReference(db, company);
        const collectionQuery = query(collectionRef, where("year", ">", currentYear - years), limit(years));

        return getDocs(collectionQuery).then(result => {
            return result.docs.map(doc => doc.data());
        });
    }
}

export class Change {
    in: Mass;
    out: Mass;

    constructor(data: any) {
        this.in = new Mass(data.in, FirebaseDocInterface.session.getDefaultUnit());
        this.out = new Mass(data.out, FirebaseDocInterface.session.getDefaultUnit());
    }
}