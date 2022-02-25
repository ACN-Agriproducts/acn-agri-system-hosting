import { AngularFirestore, CollectionReference, DocumentData, DocumentReference, DocumentSnapshot, QueryDocumentSnapshot, QuerySnapshot, SnapshotOptions } from "@angular/fire/compat/firestore";
import { Contact } from "./contact";

import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { Ticket } from "./ticket";

export class Contract extends FirebaseDocInterface {
    afltatoxin: number;
    base: number;
    buyer_terms: number
    client:  DocumentReference<Contact>;
    clientName: string;
    currentDelivered: number;
    date: Date;
    delivery_dates: DeliveryDates;
    grade: number;
    id: number;
    loads: number;
    market_price: number;
    paymentTerms: PaymentTerms;
    pricePerBushel: number;
    product: DocumentReference;
    productInfo: ProductInfo;
    quantity: number;
    seller_terms: string;
    status: status;
    tickets: DocumentReference<Ticket>[];
    transport: string;
    truckers: DocumentReference<Contact>[];

    constructor(snapshot: QueryDocumentSnapshot<any>) {
        super(snapshot, Contract.converter);
        const data = snapshot.data();

        let tempTicketList: DocumentReference<Ticket>[] = [];
        let tempTruckerList: DocumentReference<Contact>[] = [];

        // TODO Set DocumentReference converters
        data.tickets.forEach((ticket: DocumentReference) => {
            tempTicketList.push(ticket.withConverter(Ticket.converter));
        })

        data.truckers.forEach((trucker: DocumentReference) => {
            tempTruckerList.push(trucker.withConverter(Contact.converter));
        })
        

        this.afltatoxin = data.afltatoxin;
        this.base = data.base;
        this.client = data.client.withConverter(Contact.converter);
        this.clientName = data.clientName;
        this.currentDelivered = data.currentDelivered;
        this.date = data.date;
        this.delivery_dates = new DeliveryDates(data.delivery_dates);
        this.grade = data.grade;
        this.id = data.id;
        this.loads = data.loads;
        this.market_price = data.market_price;
        this.paymentTerms = new PaymentTerms(data.paymentTerms);
        this.pricePerBushel = data.pricePerBushel;
        this.product = data.product;
        this.productInfo = new ProductInfo(data.productInfo);
        this.quantity = data.quantity;
        this.seller_terms = data.seller_terms;
        this.status = data.status;
        this.tickets = data.tickets;
        this.transport = data.transport;
        this.truckers = data.truckers;
    }

    public static converter = {
        toFirestore(data: Contract): DocumentData {
            return {
                afltatoxin: data.afltatoxin,
                base: data.base,
                client: data.client,
                clientName: data.clientName,
                currentDelivered: data.currentDelivered,
                date: data.date,
                delivery_dates: data.delivery_dates,
                grade: data.grade,
                id: data.id,
                loads: data.loads,
                market_price: data.market_price,
                paymentTerms: data.paymentTerms,
                pricePerBushel: data.pricePerBushel,
                product: data.product,
                productInfo: data.productInfo,
                quantity: data.quantity,
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

    public getCollectionReference(): CollectionReference<Contract> {
        return this.ref.parent.withConverter(Contract.converter);
    }

    public getTickets(): Promise<Ticket[]> {
        const ticketList = [];

        this.tickets.forEach((ticketRef: DocumentReference<Ticket>) => {
            ticketList.push(ticketRef.get());
        });

        return Promise.all(ticketList).then((result): Ticket[] => {
            const tickets: Ticket[] = [];

            result.forEach((ticketSnap: DocumentSnapshot<Ticket>) => {
                tickets.push(ticketSnap.data());
            });
            
            return tickets;
        });
    }

    public getClient(): Promise<Contact> {
        return this.client.get().then(result => {
            return result.data();
        });
    }

    public getTruckers(): Promise<Contact[]> {
        const truckerList = [];

        this.truckers.forEach((truckerRef) => {
            truckerList.push(truckerRef.get())
        });

        return Promise.all(truckerList).then((result): Contact[] => {
            const truckers: Contact[] = [];

            result.forEach((truckerSnap: DocumentSnapshot<Contact>) => {
                truckers.push(truckerSnap.data());
            });

            return truckers;
        })
    }

    public static getCollectionReference(db: AngularFirestore, company: string, isPurchaseContract: boolean): CollectionReference<Contract> {
        return db.firestore.collection(`companies/${company}/${isPurchaseContract? 'purchase' : 'sales'}Contracts/`).withConverter(Contract.converter);
    }

    public static getDoc(db: AngularFirestore, company: string, isPurchaseContract: boolean, contractId: number): Promise<Contract> {
        return this.getCollectionReference(db, company, isPurchaseContract).where('id', '==', contractId).limit(1)
            .get().then(result => {
                return result.docs[0].data();
            });
    }

    public static getStatusEnum(): typeof status {
        return status;
    }
}

class DeliveryDates {
    begin: Date;
    end: Date;

    constructor(data: any) {
        this.begin = data.begin;
        this.end = data.end;
    }
}

class PaymentTerms {
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

class ProductInfo {
    moisture: number;
    name: string;
    weight: number;

    constructor(data: any) {
        this.moisture = data.moisture;
        this.name = data.name;
        this.weight = data.weight;
    }
}

enum status {
    pending = 'pending',
    active = 'active',
    closed = 'closed'
}

