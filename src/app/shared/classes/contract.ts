import { collection, CollectionReference, doc, DocumentData, DocumentReference, DocumentSnapshot, Firestore, getCountFromServer, getDoc, getDocs, limit, onSnapshot, Query, query, QueryConstraint, QueryDocumentSnapshot, QuerySnapshot, SnapshotOptions, where } from "@angular/fire/firestore";
import { Contact } from "./contact";

import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { Product } from "./product";
import { Ticket } from "./ticket";

export class Contract extends FirebaseDocInterface {
    aflatoxin: number;
    base: number;
    buyer_terms: number;
    client:  DocumentReference<Contact>;
    clientInfo: ContactInfo;
    clientName: string;
    clientTicketInfo: ContactInfo;
    currentDelivered: number;
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
        

        this.aflatoxin = data.aflatoxin;
        this.base = data.base;
        this.client = data.client.withConverter(Contact.converter);
        this.clientInfo = data.clientInfo;
        this.clientName = data.clientName;
        this.clientTicketInfo = data.clientTicketInfo;
        this.currentDelivered = data.currentDelivered;
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
        this.quantity = data.quantity;
        this.seller_terms = data.seller_terms;
        this.status = data.status;
        this.tickets = tempTicketList;
        this.transport = data.transport;
        this.truckers = tempTruckerList;

        this.clientTicketInfo.ref = this.clientTicketInfo.ref.withConverter(Contract.converter);
    }

    public static converter = {
        toFirestore(data: Contract): DocumentData {
            return {
                aflatoxin: data.aflatoxin,
                base: data.base,
                client: data.client,
                clientName: data.clientName,
                clientTicketInfo: data.clientTicketInfo,
                currentDelivered: data.currentDelivered,
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

        this.tickets.forEach((ticketRef: DocumentReference<any>) => {
            ticketList.push(getDoc(ticketRef.withConverter(Ticket.converter)));
        });

        return Promise.all(ticketList).then(result => {
            const tickets: Ticket[] = [];

            result.forEach((ticketSnap: DocumentSnapshot<Ticket>) => {
                tickets.push(ticketSnap.data());
            });

            tickets.sort((a, b) => a.id - b.id);
            
            return tickets;
        });
    }

    public getClient(): Promise<Contact> {
        return getDoc(this.client).then(result => {
            return result.data();
        });
    }

    public getTruckers(): Promise<Contact[]> {
        const truckerList = [];

        this.truckers.forEach((truckerRef) => {
            truckerList.push(getDoc(truckerRef))
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

    public static clientInfo(contact: Contact) {
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
        };
    }

    public static async getContractsOfType(db: Firestore, company: string, isPurchaseContract: boolean, ...constraints: QueryConstraint[]): Promise<Contract[]> {
        const contractQuery = query(Contract.getCollectionReference(db, company, isPurchaseContract), ...constraints);
        const contractCollection = await getDocs(contractQuery);        
        
        return contractCollection.docs.map(snap => snap.data());
    }

    public static async getContractCount(db: Firestore, company: string, isPurchaseContract: boolean, ...constraints: QueryConstraint[]): Promise<number> {
        const contractCollQuery = query(Contract.getCollectionReference(db, company, isPurchaseContract), ...constraints);
        const contractSnapshot = await getCountFromServer(contractCollQuery);
        return contractSnapshot.data().count;
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

enum status {
    pending = 'pending',
    active = 'active',
    closed = 'closed'
}

interface ContactInfo {
    caat: string,
    city: string,
    email: string,
    name: string,
    phoneNumber: string,
    state: string,
    streetAddress: string,
    zipCode: string,
    ref: DocumentReference,    
}