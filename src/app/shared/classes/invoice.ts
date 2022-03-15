import { AngularFirestore, CollectionReference, DocumentData, DocumentReference, QueryDocumentSnapshot, SnapshotOptions } from "@angular/fire/compat/firestore";
import { FirebaseDocInterface } from "./FirebaseDocInterface";

export class Invoice extends FirebaseDocInterface {
    public buyer: contactInfo;
    public date: Date;
    public id: number;
    public items: item[];
    public needsAttention: boolean;
    public seller: contactInfo;
    public status: string;
    public total: number;

    constructor(snapshot:QueryDocumentSnapshot<any>) {
        super(snapshot, Invoice.converter);

        const data = snapshot.data();

        this.buyer = new contactInfo(data.buyer);
        this.date = data.date.toDate();
        this.id = data.id;
        this.items = [];
        this.seller = new contactInfo(data.seller);
        this.status = data.status;
        this.total = data.total;
        this.needsAttention = data.needsAttention;

        data.items.forEach(element => {
            this.items.push(new item(element));
        });
    }

    public static converter = {
        toFirestore(data: Invoice): DocumentData {
            const doc = {
                buyer: {...data.buyer},
                date: data.date,
                id: data.id,
                items: [],
                needsAttention: data.needsAttention,
                seller: {...data.seller},
                status: data.status,
                total: data.total 
            }

            data.items.forEach(item => {
                doc.items.push({
                    affectsInventory: item.affectsInventory,
                    details: item.details,
                    inventoryInfo: {
                        info: []
                    },
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                });

                item.inventoryInfo.forEach(info => {
                    doc.items[doc.items.length-1].inventoryInfo.info.push({...info});
                });
            });

            return doc;
        },
        fromFirestore(snapshot: QueryDocumentSnapshot<any>, options: SnapshotOptions): Invoice {
            return new Invoice(snapshot);
        }
    }

    public getCollectionReference(): CollectionReference<Invoice> {
        return this.ref.parent.withConverter(Invoice.converter);
    }

    public static getCollectionReference(db: AngularFirestore, company: string): CollectionReference<Invoice> {
        return db.firestore.collection(`companies/${company}/invoices`).withConverter(Invoice.converter);
    }

    public static getDoc(db: AngularFirestore, company: string, id: number): Promise<Invoice> {
        return Invoice.getCollectionReference(db, company).where("id", "==", id).limit(1).get().then(result => {
            return result.docs[0].data();
        });
    }

    public static getDocById(db: AngularFirestore, company: string, id: string): Promise<Invoice> {
        return db.firestore.doc(`companies/${company}/invoices/${id}`).withConverter(Invoice.converter).get().then(result => {
            return result.data();
        });
    }
}

export class item {
    public affectsInventory: boolean;
    public details: string;
    public inventoryInfo: inventoryInfo[];
    public name: string;
    public price: number;
    public quantity: number;

    constructor(data: any) {
        this.affectsInventory = data.affectsInventory;
        this.details = data.details;
        this.inventoryInfo = [];
        this.name = data.name;
        this.price = data.price;
        this.quantity = data.quantity;

        data.inventoryInfo.info.forEach(element => {
            this.inventoryInfo.push(new inventoryInfo(element));
        });
    }
}

export class inventoryInfo {
    public plant: string;
    public product: string;
    public quantity: number;
    public tank: string;

    constructor(data: any) {
        this.plant = data.plant;
        this.product = data.product;
        this.quantity = data.quantity;
        this.tank = data.tank;
    }
}

export class contactInfo {
    public city: string;
    public country: string;
    public name: string;
    public phone: string;
    public state: string;
    public street: string;
    public zip: string;

    constructor(data: any) {
        this.city = data.city;
        this.country = data.country;
        this.name = data.name;
        this.phone = data.phone;
        this.state = data.state;
        this.street = data.street;
        this.zip = data.zip;
    }
}