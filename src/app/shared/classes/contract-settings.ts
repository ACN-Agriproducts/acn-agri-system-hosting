import { Firestore, DocumentReference, QueryDocumentSnapshot, SnapshotOptions, DocumentData, doc, getDoc } from "@angular/fire/firestore";
import { Company } from "./company";
import { FirebaseDocInterface } from "./FirebaseDocInterface";

export class ContractSettings extends FirebaseDocInterface {
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

        this.contractTypes = data.contractTypes;
        this.formData = data.formData;
        this.fieldGroupOrder = data.fieldGroupOrder;
    }

    public static converter = {
        toFirestore(data: ContractSettings): DocumentData {
            return {
                contractTypes: data.contractTypes,
                formData: data.formData,
                fieldGroupOrder: data.fieldGroupOrder 
            }
        },
        fromFirestore(snapshot: QueryDocumentSnapshot<any>, options: SnapshotOptions): ContractSettings {
            return new ContractSettings(snapshot);
        }
    }

    public static getRef(db: Firestore, company: string): DocumentReference<ContractSettings> {
        return doc(Company.getCompanyRef(db, company), "settings/contracts").withConverter(ContractSettings.converter);
    }

    public static getDocument(db: Firestore, company: string): Promise<ContractSettings> {
        return getDoc(ContractSettings.getRef(db, company)).then(result => {
            return result.data();
        });
    }
}

interface FormField {
    label: string;
    fieldName: string;
    nestedField?: string;
    type: string;
    width: number;
    class: string;
    primitiveType?: "number" | "text" | "textarea" | "select";
    selectOptions?: SelectOption[];
}

interface SelectOption {
    label: string;
    value: string;
}