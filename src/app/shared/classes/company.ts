import { CollectionReference, docData, DocumentData, DocumentReference, Firestore, getDoc, QueryDocumentSnapshot, SnapshotOptions, collection, doc } from "@angular/fire/firestore";
import { Functions, httpsCallable } from "@angular/fire/functions";
import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { User } from "./user";
import { Observable } from "rxjs";
import { units } from "./mass";

export class Company extends FirebaseDocInterface {
    contactList: CompanyContact[];
    createdAt: Date;
    employees: DocumentReference;
    name: string;
    nextInvoice: number;
    nextPurchaseContract: number;
    nextSalesContract: number;
    defaultUnit: units;
    displayUnit: units;

    constructor(snapshot: QueryDocumentSnapshot<any>) {
        super(snapshot, Company.converter);
        const data = snapshot.data();

        this.createdAt =  data.createdAt;
        this.employees =  data.employees;
        this.name =  data.name;
        this.nextInvoice = data.nextInvoice;
        this.nextPurchaseContract = data.nextPurchaseContract;
        this.nextSalesContract =  data.nextSalesContract;
        this.defaultUnit = data.defaultUnit;
        this.displayUnit = data.displayUnit;

        this.contactList = [];

        for(let contact of data.contactList) {
            this.contactList.push(new CompanyContact(contact));
        }
    }

    public static converter = {
        toFirestore(data: Company): DocumentData {
            return {
                contactList: data.contactList,
                createdAt: data.createdAt,
                employees: data.employees,
                name: data.name,
                nextInvoice: data.nextInvoice,
                nextPurchaseContract: data.nextPurchaseContract,
                nextSalesContract: data.nextSalesContract,
                defaultUnit: data.defaultUnit,
                displayUnit: data.displayUnit,
            }
        },
        fromFirestore(snapshot: QueryDocumentSnapshot<any>, options: SnapshotOptions): Company {
            return new Company(snapshot);
        }
    }

    public getCompanyUsers(fns: Functions, db: Firestore): Promise<User[]> {
        return httpsCallable(fns, 'users-getCompanyUsers')
        ({company: this.ref.id})
            .then(result => {
                const data = result.data as any;
                return data.map(u => {
                    u.ref = User.getDocumentReference(db, u.ref);
                    u.createdAt = new Date(u.createdAt);

                    return new User(u);
                });
            });
    }

    public static getCollectionReference(db: Firestore): CollectionReference<Company> {
        return collection(db, 'companies').withConverter(Company.converter);
    }

    public static getCompanyRef(db: Firestore, company: string): DocumentReference<Company> {
        return doc(db, `companies/${company}`).withConverter(Company.converter);
    }

    public static getCompany(db: Firestore, company: string): Promise<Company> {
        return getDoc(Company.getCompanyRef(db, company)).then(result => {
            return result.data();
        });
    }

    public static getCompanyValueChanges(db: Firestore, company: string): Observable<Company> {
        return docData(Company.getCompanyRef(db, company));
    }
}

export class CompanyContact {
    id: string;
    isClient: boolean;
    name: string;

    constructor(data: any) {
        this.id = data.id;
        this.isClient = data.isClient;
        this.name = data.name;
    }
}