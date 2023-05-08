import { collection, CollectionReference, doc, DocumentData, DocumentReference, DocumentSnapshot, Firestore, getDoc, getDocs, limit, onSnapshot, Query, query, QueryConstraint, QueryDocumentSnapshot, QuerySnapshot, SnapshotOptions, where } from "@angular/fire/firestore";
import { Contact } from "./contact";

import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { Mass } from "./mass";
import { Product } from "./product";
import { Ticket } from "./ticket";

export class Contract extends FirebaseDocInterface {
    aflatoxin: number;
    base: number;
    buyer_terms: number
    client:  DocumentReference<Contact>;
    clientInfo: {
        caat: string,
        city: string,
        email: string,
        name: string,
        phoneNumber: string,
        state: string,
        streetAddress: string,
        type: string,
        zipCode: string
    };
    clientName: string;
    clientTicketInfo: {
        caat: string,
        city: string,
        email: string,
        name: string,
        phoneNumber: string,
        state: string,
        streetAddress: string,
        type: string,
        zipCode: string,
        ref: DocumentReference<Contact>,
    };
    currentDelivered: Mass;
    date: Date;
    delivery_dates: DeliveryDates;
    grade: number;
    id: number;
    loads: number;
    market_price: number;
    paymentTerms: PaymentTerms;
    plants: string[];
    pdfReference: string;
    pricePerBushel: number;
    product: DocumentReference<Product>;
    productInfo: ProductInfo;
    quantity: Mass;
    seller_terms: string;
    status: status;
    tickets: DocumentReference<Ticket>[];
    transport: string;
    truckers: TruckerInfo[];

    constructor(snapshot: QueryDocumentSnapshot<any>) {
        super(snapshot, Contract.converter);
        const data = snapshot.data();

        let tempTicketList: DocumentReference<Ticket>[] = [];
        let tempTruckerList: TruckerInfo[] = [];

        // TODO Set DocumentReference converters
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
        this.pricePerBushel = data.pricePerBushel;
        this.product = data.product.withConverter(Product.converter);
        this.productInfo = new ProductInfo(data.productInfo);
        this.quantity = new Mass(data.quantity, FirebaseDocInterface.session.getDefaultUnit());
        this.seller_terms = data.seller_terms;
        this.status = data.status;
        this.tickets = data.tickets;
        this.transport = data.transport;
        this.truckers = tempTruckerList;

        this.clientTicketInfo.ref = this.clientTicketInfo.ref.withConverter(Contact.converter);
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
                product: data.product,
                productInfo: data.productInfo,
                quantity: data.quantity.get(),
                seller_terms: data.seller_terms,
                status: data.status,
                tickets: data.tickets,
                transport: data.transport,
                truckers: data.truckers,
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

    public getTicketClient(): Promise<Contact> {
        return getDoc(this.clientTicketInfo.ref).then(result => {
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

    public static getCollectionReference(db: Firestore, company: string, isPurchaseContract: boolean): CollectionReference<Contract> {
        return collection(db, `companies/${company}/${isPurchaseContract? 'purchase' : 'sales'}Contracts/`).withConverter(Contract.converter);
    }

    public static getDoc(db: Firestore, company: string, isPurchaseContract: boolean, contractId: number): Promise<Contract> {
        return getDocs(query(Contract.getCollectionReference(db, company, isPurchaseContract), where('id', '==', contractId), limit(1)))
            .then(result => {
                return result.docs[0].data();
            });
    }

    public static getDocById(db: Firestore, company: string, isPurchaseContract: boolean, contractId: string): Promise<Contract> {
        const docRef = doc(Contract.getCollectionReference(db, company, isPurchaseContract), contractId)
        return getDoc(docRef).then(result => {
            return result.data();
        });
    }

    public static getDocRef(db: Firestore, company: string, isPurchaseContract: boolean, contractId: string): DocumentReference<Contract> {
        return doc(Contract.getCollectionReference(db, company, isPurchaseContract), contractId);
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

    public static getContracts(db: Firestore, company: string, isPurchaseContract: boolean, ...constraints: QueryConstraint[]): Promise<Contract[]> {
        const collectionRef = Contract.getCollectionReference(db, company, isPurchaseContract);
        const collectionQuery = query(collectionRef, ...constraints);
        return getDocs(collectionQuery).then(result => {
            return result.docs.map(snap => snap.data());
        });
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
    origin: boolean;
    paymentTerms: number

    constructor(data: any) {
        this.before = data.before;
        this.measurement = data.measurement;
        this.origin = data.measurement;
        this.paymentTerms = data.paymentTerms;
    }
}

export class ProductInfo {
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

