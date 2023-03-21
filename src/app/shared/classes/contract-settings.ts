import { Firestore, DocumentReference, QueryDocumentSnapshot, SnapshotOptions, DocumentData } from "@angular/fire/firestore";
import { FirebaseDocInterface } from "./FirebaseDocInterface";

export class ContractSettings extends FirebaseDocInterface {
    contractTypes: {
        [name: string]: string;
    }

    formData: {
        [contractName: string]: {
            [groupName: string]: FormField[];
        }[];
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

    //public get(db: Firestore, )
}

interface FormField {
    type: "primitive" | "template";
    primitiveType?: "number" | "text" | "textarea" | "select";
    selectOptions?: SelectOption[];
    label: string;
    fieldName: string;
    width: number;
    class: string;
}

interface SelectOption {
    label: string;
    value: string;
}