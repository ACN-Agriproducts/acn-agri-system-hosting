import { collection, CollectionReference, doc, DocumentData, DocumentReference, DocumentSnapshot, Firestore, getCountFromServer, getDoc, getDocs, limit, onSnapshot, Query, query, QueryConstraint, QueryDocumentSnapshot, QuerySnapshot, SnapshotOptions, where } from "@angular/fire/firestore";
import { Contact } from "./contact";

import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { Mass, units } from "./mass";
import { Price } from "./price";
import { Product } from "./product";
import { Ticket } from "./ticket";

declare type contractType = string | boolean;
declare type FutureMonth = "MAR CH" | "MAY CK" | "JUL CN" | "SEP CU" | "DEC CZ";

export class Contract extends FirebaseDocInterface {
    aflatoxin: number;
    base: number;
    buyer_terms: number;
    client:  DocumentReference<Contact>;
    clientInfo: ContactInfo;
    clientName: string;
    clientTicketInfo: ContactInfo;
    currentDelivered: Mass;
    date: Date;
    delivery_dates: DeliveryDates;
    grade: number;
    id: number;
    loads: number;
    market_price: number;
    paymentTerms: PaymentTerms;
    pdfReference: string;
    plants: string[];
    price: Price;
    pricePerBushel: number;
    printableFormat: string;
    product: DocumentReference<Product>;
    productInfo: ProductInfo;
    quantity: Mass;
    seller_terms: string;
    status: status;
    tags: string[];
    tickets: DocumentReference<Ticket>[];
    transport: string;
    truckers: TruckerInfo[];
    type: string;

    // NEW
    bankInfo: BankInfo[];
    cargoDelays: string;
    contractOwner: string;
    currency: string;
    deliveryPlants: string[];
    deliveryType: string;
    formOfPayment: string = "TRANSFERENCIA ELECTRÓNICA DE FONDOS";
    futurePriceInfo: FuturePriceInfo;
    guarantee: number;
    loadConditions: string;
    loadType: string;
    paymentDelays: { x: number, y: number };
    paymentWithdrawal: string;
    prepaid: number;
    shrinkage: string;
    storageAndFumigation: string;
    transportInsurance: string;
    quantityErrorPercentage: number;

    constructor(snapshot: QueryDocumentSnapshot<any>);
    constructor(ref: DocumentReference<any>);
    constructor(snapshotOrRef: QueryDocumentSnapshot<any> | DocumentReference<any>) {
        let snapshot;
        if(snapshotOrRef instanceof QueryDocumentSnapshot) {
            snapshot = snapshotOrRef
        }
        
        super(snapshot, Contract.converter);
        const data = snapshot?.data();

        if(snapshotOrRef instanceof DocumentReference) {
            this.ref = snapshotOrRef;
            this.clientInfo = {
                caat: null,
                city: null,
                email: null,
                name: null,
                phoneNumber: null,
                state: null,
                streetAddress: null,
                zipCode: null,
                ref: null,
                clientRep: null,
                rfc: null,
                curp: null,
                notarialAct: null,
                notarialActDate: null
            };

            this.clientTicketInfo = {
                caat: null,
                city: null,
                email: null,
                name: null,
                phoneNumber: null,
                state: null,
                streetAddress: null,
                zipCode: null,
                ref: null,
                clientRep: null,
                rfc: null,
                curp: null,
                notarialAct: null,
                notarialActDate: null
            };

            this.delivery_dates = new DeliveryDates({});
            this.productInfo = new ProductInfo({});
            this.paymentTerms = new PaymentTerms({});
            this.paymentTerms.origin = null;

            return;
        }

        let tempTicketList: DocumentReference<Ticket>[] = [];
        let tempTruckerList: TruckerInfo[] = [];

        data.tickets.forEach((ticket: DocumentReference) => {
            tempTicketList.push(ticket.withConverter(Ticket.converter));
        })

        data.truckers.forEach((trucker: any) => {
            tempTruckerList.push(new TruckerInfo(trucker));
        })
        

        this.aflatoxin = data.aflatoxin;
        this.base = data.base;
        this.client = data.client.withConverter(Contact.converter);
        this.clientInfo = data.clientInfo;
        this.clientName = data.clientName;
        this.clientTicketInfo = data.clientTicketInfo;
        this.currentDelivered = new Mass(data.currentDelivered, FirebaseDocInterface.session.getDefaultUnit());
        this.date = data.date.toDate();
        this.delivery_dates = new DeliveryDates({begin: data.delivery_dates?.begin?.toDate(), end: data.delivery_dates?.end?.toDate()});
        this.grade = data.grade;
        this.id = data.id;
        this.loads = data.loads;
        this.market_price = data.market_price;
        this.paymentTerms = new PaymentTerms(data.paymentTerms);
        this.pdfReference = data.pdfReference;
        this.price = new Price(data.price, data.priceUnit);
        this.printableFormat = data.printableFormat ?? "";
        this.product = data.product.withConverter(Product.converter);
        this.productInfo = new ProductInfo(data.productInfo);
        this.quantity = new Mass(data.quantity, data.quantity.defaultUnits || FirebaseDocInterface.session.getDefaultUnit());
        this.seller_terms = data.seller_terms;
        this.status = data.status;
        this.tags = data.tags;
        this.tickets = tempTicketList;
        this.transport = data.transport;
        this.truckers = tempTruckerList;
        this.type = data.type;
        
        this.clientTicketInfo.ref = this.clientTicketInfo.ref.withConverter(Contract.converter);
        this.pricePerBushel = data.pricePerBushel || this.price.getPricePerUnit("bu", this.quantity);

        // NEW
        this.bankInfo = data.bankInfo;
        this.cargoDelays = data.cargoDelays;
        this.contractOwner = data.contractOwner;
        this.currency = data.currency;
        this.deliveryPlants = data.deliveryPlants;
        this.deliveryType = data.deliveryType;
        this.formOfPayment = data.formOfPayment;
        this.futurePriceInfo = data.futurePriceInfo;
        this.guarantee = data.guarantee;
        this.loadConditions = data.loadConditions;
        this.loadType = data.loadType;
        this.paymentDelays = data.paymentDelays;
        this.paymentWithdrawal = data.paymentWithdrawal;
        this.prepaid = data.prepaid;
        this.shrinkage = data.shrinkage;
        this.storageAndFumigation = data.storageAndFumigation;
        this.transportInsurance = data.transportInsurance;
        this.quantityErrorPercentage = data.quantityErrorPercentage;
    }

    public static converter = {
        toFirestore(data: Contract): DocumentData {
            return {
                aflatoxin: data.aflatoxin,
                base: data.base,
                client: data.client,
                clientName: data.clientName,
                clientTicketInfo: data.clientTicketInfo,
                currentDelivered: data.currentDelivered.get(),
                date: data.date,
                delivery_dates: data.delivery_dates,
                grade: data.grade,
                id: data.id,
                loads: data.loads,
                market_price: data.market_price,
                paymentTerms: data.paymentTerms,
                pdfReference: data.pdfReference,
                pricePerBushel: data.pricePerBushel,
                price: data.price.amount,
                priceUnit: data.price.unit,
                product: data.product,
                productInfo: data.productInfo,
                quantity: data.quantity.get(),
                quantityUnits: data.quantity.defaultUnits,
                seller_terms: data.seller_terms,
                status: data.status,
                tags: data.tags,
                tickets: data.tickets,
                transport: data.transport,
                truckers: data.truckers,

                // NEW
                bankInfo: data.bankInfo,
                cargoDelays: data.cargoDelays,
                contractOwner: data.contractOwner,
                currency: data.currency,
                deliveryPlants: data.deliveryPlants,
                deliveryType: data.deliveryType,
                formOfPayment: data.formOfPayment,
                futurePriceInfo: data.futurePriceInfo,
                guarantee: data.guarantee,
                loadConditions: data.loadConditions,
                loadType: data.loadType,
                paymentDelays: data.paymentDelays,
                paymentWithdrawal: data.paymentWithdrawal,
                prepaid: data.prepaid,
                shrinkage: data.shrinkage,
                storageAndFumigation: data.storageAndFumigation,
                transportInsurance: data.transportInsurance,
                quantityErrorPercentage: data.quantityErrorPercentage,
            }
        },
        fromFirestore(snapshot: QueryDocumentSnapshot<any>, options: SnapshotOptions): Contract {
            return new Contract(snapshot);
        }
    }

    public getContractType(): string { 
        return this.ref.parent.id;
    }

    public getCollectionReference(): CollectionReference<Contract> {
        return this.ref.parent.withConverter(Contract.converter);
    }

    public getTickets(): Promise<Ticket[]> {
        return Promise.all(
            this.tickets.map(doc => getDoc(doc.withConverter(Ticket.converter)))
        ).then(result => {
            return result.map(snap => snap.data()).sort((a, b) => a.id - b.id);
        });
    }

    public getClient(): Promise<Contact> {
        return getDoc(this.client).then(result => {
            return result.data();
        });
    }

    public getTruckers(): Promise<Contact[]> {
        const truckerList = [];

        this.truckers.forEach((truckerInfo) => {
            truckerList.push(getDoc(truckerInfo.trucker))
        });

        return Promise.all(truckerList).then((result): Contact[] => {
            const truckers: Contact[] = [];

            result.forEach((truckerSnap: DocumentSnapshot<Contact>) => {
                truckers.push(truckerSnap.data());
            });

            return truckers;
        })
    }

    public static getCollectionReference(db: Firestore, company: string, contractType?: contractType): CollectionReference<Contract> {
        return collection(db, `companies/${company}/contracts/`).withConverter(Contract.converter);
    }

    public static getDoc(db: Firestore, company: string, contractType: contractType, contractId: number): Promise<Contract> {
        return getDocs(query(Contract.getCollectionReference(db, company), where('id', '==', contractId), where('type', '==', this.getContractType(contractType)), limit(1)))
            .then(result => {
                return result.docs[0].data();
            });
    }

    public static getDocById(db: Firestore, company: string, contractType: contractType, contractId: string): Promise<Contract> {
        const docRef = doc(Contract.getCollectionReference(db, company, contractType), contractId)
        return getDoc(docRef).then(result => {
            return result.data();
        });
    }

    public static getDocRef(db: Firestore, company: string, contractType: contractType, contractId: string): DocumentReference<Contract> {
        return doc(Contract.getCollectionReference(db, company, contractType), contractId);
    }

    public static getStatusEnum(): typeof status {
        return status;
    }

    public static onSnapshot(ref: CollectionReference<Contract> | Query<Contract>, list: Contract[], onNext: (snapshot: QuerySnapshot<Contract>) => void = () => {}) {
        let first = true;
        onSnapshot(ref, next => {
            onNext(next);

            if(first) {
              list.push(...next.docs.map(c => c.data()));
              first = false;
              return;
            }
      
            next.docChanges().forEach(change => {
              if(change.type == 'added') {
                list.splice(change.newIndex, 0, change.doc.data());
              }
      
              if(change.type == 'modified') {
                list[change.oldIndex] = change.doc.data();
              }
      
              if(change.type == 'removed') {
                list.splice(change.oldIndex, 1);
              }
            });
          })
    }

    public static clientInfo(contact: Contact): ContactInfo {
        const primaryContact = contact.metacontacts.find(c => c.isPrimary);

        return {
            caat: contact.caat,
            city: contact.city,
            email: primaryContact.email,
            name: contact.name,
            phoneNumber: primaryContact.phone,
            state: contact.state,
            streetAddress: contact.streetAddress,
            zipCode: contact.zipCode,
            ref: contact.ref,
            clientRep: primaryContact.name,
            rfc: contact.rfc,
            curp: contact.curp,
            notarialAct: contact.notarialAct,
            notarialActDate: contact.notarialActDate
        };
    }

    public static async getContractCount(db: Firestore, company: string, isPurchaseContract: boolean, ...constraints: QueryConstraint[]): Promise<number> {
        const contractCollQuery = query(Contract.getCollectionReference(db, company, isPurchaseContract), ...constraints);
        const contractSnapshot = await getCountFromServer(contractCollQuery);
        
        return contractSnapshot.data().count;
    }

    public static getContracts(db: Firestore, company: string, contractType: contractType, ...constraints: QueryConstraint[]): Promise<Contract[]> {
        const collectionRef = Contract.getCollectionReference(db, company, contractType);
        const collectionQuery = query(collectionRef, where('type', '==', this.getContractType(contractType)), ...constraints);
        return getDocs(collectionQuery).then(result => {
            return result.docs.map(snap => snap.data());
        });
    }

    private static getContractType(contractType: contractType): string {
        if(typeof contractType == "boolean") {
            contractType = contractType ? "purchase" : "sales";
        }

        return contractType;
    }
}

export class DeliveryDates {
    begin: Date;
    end: Date;

    constructor(data: any) {
        this.begin = data.begin;
        this.end = data.end;
    }
}

export class PaymentTerms {
    before: boolean;
    measurement: string;
    origin: string;
    paymentTerms: number;

    constructor(data: any) {
        this.before = data.before;
        this.measurement = data.measurement;
        this.origin = typeof data.origin == "string" ? data.origin:
            data.origin ? "own-scale" : "client-scale";
        this.paymentTerms = data.paymentTerms;
    }
}

export class ProductInfo {
    brokenGrain: number;
    damagedGrain: number;
    foreignMatter: number;
    impurities: number;
    moisture: number;
    name: string;
    weight: number;

    constructor(data: any) {
        this.moisture = data.moisture;
        this.name = data.name;
        this.weight = data.weight;
    }
}

export class TruckerInfo {
    trucker: DocumentReference<Contact>;
    freight: number;

    constructor(data: any) {
        if(data instanceof DocumentReference){
            this.trucker = data.withConverter(Contact.converter);
            return;
        }

        this.trucker = data.trucker.withConverter(Contact.converter);
        this.freight = data.freight;
    }
}

enum status {
    pending = 'pending',
    active = 'active',
    closed = 'closed',
    cancelled = 'cancelled'
}

interface ContactInfo {
    caat: string;
    city: string;
    email: string;
    name: string;
    phoneNumber: string;
    state: string;
    streetAddress: string;
    zipCode: string;
    ref: DocumentReference;
    clientRep: string;
    rfc: string;
    curp: string;
    notarialAct: string;
    notarialActDate: Date;
}

interface FuturePriceInfo {
    base: Price;
    exchangeRate: string | number;
    expirationMonth: FutureMonth;
    future: FutureMonth;
    marketOptions: string;
    priceSetPeriod: { begin: Date, end: Date };
}

interface BankInfo {
    bank: string;
    account: string;
    interBank: string;
}
