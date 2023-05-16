import { Firestore, DocumentReference, QueryDocumentSnapshot, SnapshotOptions, DocumentData, doc, getDoc, CollectionReference, Query, collection, query, where, orderBy, limit, getDocs, getDocsFromServer } from "@angular/fire/firestore";
import { Company } from "./company";
import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { BankInfo } from "./contact";
import { Contract } from "./contract";

export class ContractSettings extends FirebaseDocInterface {
    date: Date;
    type: string = "contract";
    contractTypes: {
        [name: string]: string;
    }

    formData: {
        [contractName: string]: {
            [groupName: string]: FormField[];
        };
    }

    fieldGroupOrder: {
        [contractName: string]: string[];
    }

    defaultBankInfo: BankInfo[];
    contractTags: {
        [contractName: string]: string[];
    }

    constructor(snapshot: QueryDocumentSnapshot<any>);
    constructor(ref: DocumentReference<any>);
    constructor(snapshotOrRef: QueryDocumentSnapshot<any> | DocumentReference<any>) {
        let snapshot;
        if(snapshotOrRef instanceof QueryDocumentSnapshot) {
            snapshot = snapshotOrRef
        }
        
        super(snapshot, ContractSettings.converter);
        const data = snapshot?.data();

        if(snapshotOrRef instanceof DocumentReference) {
            this.ref = snapshotOrRef;
            return;
        }

        if(data == undefined) return;

        this.date = data.date?.toDate();
        this.contractTypes = data.contractTypes;
        this.formData = data.formData;
        this.fieldGroupOrder = data.fieldGroupOrder;
        this.defaultBankInfo = data.defaultBankInfo;
        this.contractTags = data.contractTags;
    }

    public static converter = {
        toFirestore(data: ContractSettings): DocumentData {
            return {
                date: data.date,
                type: data.type,
                contractTypes: data.contractTypes,
                formData: data.formData,
                fieldGroupOrder: data.fieldGroupOrder,
                defaultBankInfo: data.defaultBankInfo,
                contractTags: data.contractTags,
            }
        },
        fromFirestore(snapshot: QueryDocumentSnapshot<any>, options: SnapshotOptions): ContractSettings {
            return new ContractSettings(snapshot);
        }
    }

    public static getCollectionRef(db: Firestore, company: string): Query<ContractSettings> {
        return query(collection(Company.getCompanyRef(db, company), 'settings').withConverter(ContractSettings.converter), where('type', '==', 'contract'))
    }

    public static getRef(db: Firestore, company: string): DocumentReference<ContractSettings> {
        return doc(Company.getCompanyRef(db, company), 'settings/contracts').withConverter(ContractSettings.converter);
    }

    public static getDocument(db: Firestore, company: string): Promise<ContractSettings> {
        const colQuery = query(ContractSettings.getCollectionRef(db, company), orderBy('date'), limit(1));

        return getDocs(colQuery).then(result => {
            return result.docs[0].data();
        });
    }

    public static getContractDoc(contract: Contract): Promise<ContractSettings> {
        const db = contract.ref.firestore;
        const company = contract.ref.parent.parent.id;

        console.log(company);

        const colQuery = query(this.getCollectionRef(db, company), where('date', '<=', contract.date), orderBy('date'), limit(1));
        return getDocsFromServer(colQuery).then(result => {
            return result.docs[0].data();
        });
    }
}

export interface FormField {
    label: string;
    fieldName: string;
    nestedField?: string;
    type: string;
    width: number;
    class: string;
    primitiveType?: "number" | "text" | "textarea" | "select";
    selectOptions?: SelectOption[];
    suffix: string;
    prefix: string;
    required: boolean;
}

export interface SelectOption {
    label: string;
    value: string;
}