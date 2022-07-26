import { AngularFirestore, CollectionReference, DocumentData, DocumentReference, DocumentSnapshot, QueryDocumentSnapshot, QuerySnapshot, SnapshotOptions } from "@angular/fire/compat/firestore";
import { AngularFireFunctions } from "@angular/fire/compat/functions";
import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { User } from "./user";

export class Company extends FirebaseDocInterface {
    contactList: any;
    createdAt: Date;
    employees: DocumentReference;
    name: string;
    nextInvoice: number;
    nextPurchaseContract: number;
    nextSalesContract: number;

    constructor(snapshot: QueryDocumentSnapshot<any>) {
        super(snapshot, Company.converter);
        const data = snapshot.data();

        this.createdAt =  data.createdAt;
        this.employees =  data.employees;
        this.name =  data.name;
        this.nextInvoice = data.nextInvoice;
        this.nextPurchaseContract = data.nextPurchaseContract;
        this.nextSalesContract =  data.nextSalesContract;

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
            }
        },
        fromFirestore(snapshot: QueryDocumentSnapshot<any>, options: SnapshotOptions): Company {
            return new Company(snapshot);
        }
    }

    public getCompanyUsers(fns: AngularFireFunctions, db: AngularFirestore): Promise<User[]> {
        return fns.httpsCallable('users-getCompanyUsers')({company: this.ref.id})
            .toPromise()
            .then(result => {
                return result.map(u => {
                    u.ref = User.getDocumentReference(db, u.ref);
                    u.createdAt = new Date(u.createdAt);

                    return new User(u);
                });
            });
    }

    public static getCollectionReference(db: AngularFirestore): CollectionReference<Company> {
        return db.firestore.collection(`companies`).withConverter(Company.converter);
    }

    public static getCompanyRef(db: AngularFirestore, company: string): DocumentReference<Company> {
        return this.getCollectionReference(db).doc(company).withConverter(Company.converter);
    }

    public static getCompany(db: AngularFirestore, company: string): Promise<Company> {
        return this.getCompanyRef(db, company).get().then(result => {
            return result.data();
        });
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