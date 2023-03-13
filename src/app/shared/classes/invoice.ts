import { Firestore, CollectionReference, DocumentData, QueryDocumentSnapshot, SnapshotOptions, collection, doc, query, limit, where, getDoc, getDocs } from "@angular/fire/firestore";
import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { Mass } from "./mass";

export class Invoice extends FirebaseDocInterface {
    public buyer: contactInfo;
    public date: Date;
    public id: number;
    public items: item[];
    public needsAttention: boolean;
    public pdfReference: string;
    public proofLinks: string[];
    public seller: contactInfo;
    public status: string;
    public total: number;
    public isExportInvoice: boolean;
    public exportInfo: {
        product: string;
        quantity: Mass;
    }

    public printableDocumentName: string;

    constructor(snapshot:QueryDocumentSnapshot<any>) {
        super(snapshot, Invoice.converter);

        const data = snapshot.data();

        this.buyer = new contactInfo(data.buyer);
        this.date = data.date.toDate();
        this.id = data.id;
        this.items = [];
        this.needsAttention = data.needsAttention;
        this.pdfReference = data.pdfReference;
        this.proofLinks = data.proofLinks;
        this.seller = new contactInfo(data.seller);
        this.status = data.status;
        this.total = data.total;
        this.printableDocumentName = data.printableDocumentName ?? "Document one";
        this.isExportInvoice = data.isExportInvoice;
        this.exportInfo = data.exportInfo ? {
            product: data.exportInfo.product,
            quantity: new Mass(data.exportInfo.quantity, FirebaseDocInterface.session.getDefaultUnit())
        } : null;

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
                pdfReference: data.pdfReference ?? null,
                needsAttention: data.needsAttention,
                seller: {...data.seller},
                status: data.status,
                total: data.total,
                isExportInvoice: data.isExportInvoice,
                exportInfo: {
                    product: data.exportInfo.product,
                    quantity: data.exportInfo.quantity.get()
                }
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

    public static getCollectionReference(db: Firestore, company: string): CollectionReference<Invoice> {
        return collection(db, `companies/${company}/invoices`).withConverter(Invoice.converter);
    }

    public static getDoc(db: Firestore, company: string, id: number): Promise<Invoice> {
        const invoiceQuery = query(Invoice.getCollectionReference(db, company), where("id", "==", id), limit(1))
        return getDocs(invoiceQuery).then(result => {
            return result.docs[0].data();
        });
    }

    public static getDocById(db: Firestore, company: string, id: string): Promise<Invoice> {
        return getDoc(doc(db, `companies/${company}/invoices/${id}`).withConverter(Invoice.converter)).then(result => {
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
    public type: string;

    constructor(data: any) {
        this.affectsInventory = data.affectsInventory;
        this.details = data.details;
        this.inventoryInfo = [];
        this.name = data.name;
        this.price = data.price;
        this.quantity = data.quantity;
        this.type = data.type;

        data.inventoryInfo?.info?.forEach(element => {
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
    public other: string;

    constructor(data: any) {
        this.city = data.city;
        this.country = data.country;
        this.name = data.name;
        this.phone = data.phone;
        this.state = data.state;
        this.street = data.street;
        this.zip = data.zip;
        this.other = data.other ?? null;
    }
}