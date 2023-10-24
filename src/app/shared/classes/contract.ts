import { collection, CollectionReference, doc, DocumentData, DocumentReference, DocumentSnapshot, Firestore, getCountFromServer, getDoc, getDocs, limit, onSnapshot, Query, query, QueryConstraint, QueryDocumentSnapshot, QuerySnapshot, serverTimestamp, SnapshotOptions, Unsubscribe, where } from "@angular/fire/firestore";
import { BankInfo, Contact } from "./contact";

import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { Mass } from "./mass";
import { Price } from "./price";
import { Product } from "./product";
import { ContractSettings } from "./contract-settings";
import { Ticket } from "./ticket";
import { Liquidation } from "./liquidation";
import { Payment } from "./payment";


declare type contractType = string | boolean;
declare type ContractStatus = 'pending' | 'active' | 'closed' | 'cancelled' | 'paid';

export class Contract extends FirebaseDocInterface {
    aflatoxin: number;
    bankInfo: BankInfo[];
    base: number;
    buyer_terms: number;
    cargoDelays: string;
    client:  DocumentReference<Contact>;
    clientInfo: ContactInfo;
    clientName: string;
    clientTicketInfo: ContactInfo;
    companyInfo: { email: string; phone: string; }
    contractExecutive: Exectuive;
    contractOwner: string;
    currency: string;
    currentDelivered: Mass;
    date: Date;
    delivery_dates: DeliveryDates;
    deliveryPlants: string[];
    deliveryType: string;
    formOfPayment: string;
    futurePriceBase: Price;
    futurePriceInfo: FuturePriceInfo;
    grade: number | string;
    guarantee: number;
    id: number;
    isOpen: boolean;
    loadConditions: string;
    loadDelays: string;
    loads: number;
    loadType: string;
    market_price: number;
    paymentDelays: { applies: boolean, x: number, y: number };
    paymentTerms: PaymentTerms;
    paymentWithdrawal: string;
    pdfReference: string;
    plants: string[];
    prepaid: number | string;
    price: Price;
    pricePerBushel: number;
    printableFormat: string;
    product: DocumentReference<Product | DocumentData>;
    productInfo: ProductInfo;
    quantity: Mass;
    quantityErrorPercentage: number;
    seller_terms: string;
    shrinkage: string;
    status: ContractStatus;
    statusDates: {
        active: Date,
        closed: Date,
        cancelled: Date,
    }
    storageAndFumigation: string;
    tags: string[];
    termsOfPayment: string;
    tickets: DocumentReference<Ticket>[];
    transport: string;
    transportInsurance: string;
    truckers: TruckerInfo[];
    type: string;

    deliveredHistory: { [date: string]: number };
    progress: number; 

    constructor(snapshot: QueryDocumentSnapshot<any>);
    constructor(ref: DocumentReference<any>);
    constructor(snapshotOrRef: QueryDocumentSnapshot<any> | DocumentReference<any>) {
        let snapshot;
        if(snapshotOrRef instanceof QueryDocumentSnapshot) {
            snapshot = snapshotOrRef;
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
                country: null,
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
                country: null,
                streetAddress: null,
                zipCode: null,
                ref: null,
                clientRep: null,
                rfc: null,
                curp: null,
                notarialAct: null,
                notarialActDate: null
            };

            this.productInfo = {
                brokenGrain: null,
                damagedGrain: null,
                foreignMatter: null,
                impurities: null,
                moisture: null,
                name: null,
                weight: null,
                marketCode: null,
                productCode: null,
            };

            this.futurePriceInfo = {
                exchangeRate: null,
                expirationMonth: null,
                future: null,
                marketOptions: null,
                priceSetPeriodBegin: null,
                priceSetPeriodEnd: null,
                program: null,
            }

            this.companyInfo = {
                email: null,
                phone: null,
            }

            this.paymentDelays = {
                applies: false,
                x: null,
                y: null,
            }

            this.bankInfo = [];

            this.delivery_dates = {
                begin: null,
                end: null
            };

            this.statusDates = {
                active: null,
                closed: null,
                cancelled: null,
            }

            this.plants = [];
            this.deliveryPlants = [];

            this.paymentTerms = new PaymentTerms({});
            this.paymentTerms.origin = null;
            this.futurePriceBase = new Price(null, 'bu');
            this.date = new Date();
            this.currentDelivered = new Mass(0, FirebaseDocInterface.session.getDefaultUnit());
            this.price = new Price(null, null)
            this.loads = 0;
            this.status = 'pending';
            this.contractOwner = FirebaseDocInterface.session.getUser().uid;
            this.grade = 2;

            return;
        }

        let tempTicketList: DocumentReference<Ticket>[] = [];
        let tempTruckerList: TruckerInfo[] = [];

        data.tickets?.forEach((ticket: DocumentReference) => {
            tempTicketList.push(ticket.withConverter(Ticket.converter));
        })

        data.truckers?.forEach((trucker: any) => {
            tempTruckerList.push(new TruckerInfo(trucker));
        })

        if(data.futurePriceInfo){
            data.futurePriceInfo.expirationMonth = data.futurePriceInfo?.expirationMonth?.toDate();
            data.futurePriceInfo.priceSetPeriodBegin = data.futurePriceInfo?.priceSetPeriodBegin?.toDate();
            data.futurePriceInfo.priceSetPeriodEnd = data.futurePriceInfo?.priceSetPeriodEnd?.toDate();
        }

        this.aflatoxin = data.aflatoxin;
        this.base = data.base;
        this.client = data.client.withConverter(Contact.converter);
        this.clientInfo = data.clientInfo;
        if(data?.clientInfo?.notarialActDate) this.clientInfo.notarialActDate = data.clientInfo.notarialActDate.toDate();
        this.clientName = data.clientName;
        this.clientTicketInfo = data.clientTicketInfo;
        this.currentDelivered = new Mass(data.currentDelivered ?? 0, FirebaseDocInterface.session.getDefaultUnit());
        this.date = data.date?.toDate();
        this.delivery_dates = {begin: data.delivery_dates?.begin?.toDate(), end: data.delivery_dates?.end?.toDate()};
        this.grade = data.grade;
        this.id = data.id;
        this.loads = data.loads;
        this.market_price = data.market_price;
        this.paymentTerms = new PaymentTerms(data.paymentTerms);
        this.pdfReference = data.pdfReference;
        this.plants = data.plants;
        this.price = data.price ?
                        new Price(data.price, data.priceUnit) :
                        new Price(data.pricePerBushel, 'bu');
        this.printableFormat = data.printableFormat ?? data.type;
        this.product = data.product?.withConverter(Product.converter);
        this.productInfo = data.productInfo;
        this.quantity = new Mass(data.quantity, data.quantityUnits || FirebaseDocInterface.session.getDefaultUnit());
        this.quantity.defineBushels(this.productInfo);
        this.seller_terms = data.seller_terms;
        this.status = data.status;
        this.tags = data.tags;
        this.tickets = tempTicketList;
        this.transport = data.transport;
        this.truckers = tempTruckerList;
        this.type = data.type;
        this.pricePerBushel = data.pricePerBushel || this.price.getPricePerUnit("bu", this.quantity);
        this.isOpen = data.isOpen ?? false;

        // NEW
        this.bankInfo = data.bankInfo;
        this.cargoDelays = data.cargoDelays;
        this.contractOwner = data.contractOwner;
        this.contractExecutive = data.contractExecutive;
        this.currency = data.currency;
        this.deliveryPlants = data.deliveryPlants;
        this.deliveryType = data.deliveryType;
        this.formOfPayment = data.formOfPayment;
        this.futurePriceInfo = data.futurePriceInfo;
        this.guarantee = data.guarantee;
        this.loadConditions = data.loadConditions;
        this.loadDelays = data.loadDelays;
        this.loadType = data.loadType;
        this.paymentDelays = data.paymentDelays;
        this.paymentWithdrawal = data.paymentWithdrawal;
        this.prepaid = data.prepaid;
        this.shrinkage = data.shrinkage;
        this.storageAndFumigation = data.storageAndFumigation;
        this.transportInsurance = data.transportInsurance;
        this.quantityErrorPercentage = data.quantityErrorPercentage;
        this.termsOfPayment = data.termsOfPayment;
        this.futurePriceBase = new Price(data.futurePriceBase, data.futurePriceBaseUnit ?? 'bu');
        this.companyInfo = data.companyInfo;

        this.statusDates = data.statusDates ?? {
            active: null,
            closed: null,
            cancelled: null,
        }

        this.deliveredHistory = data.deliveredHistory;

        this.progress = data.progress ?? this.currentDelivered.getMassInUnit(FirebaseDocInterface.session.getDefaultUnit()) / this.quantity.getMassInUnit(FirebaseDocInterface.session.getDefaultUnit()) * 100;

        this.clientTicketInfo.ref = this.clientTicketInfo.ref.withConverter(Contact.converter);

        if(this.product) {
            this.quantity.defineBushels(this.productInfo);
            this.currentDelivered.defineBushels(this.productInfo);
        }

        this.companyInfo ??= {
            email: null,
            phone: null,
        };

        if(this.futurePriceInfo) {
            this.futurePriceInfo.expirationMonth ??= null;
            this.futurePriceInfo.priceSetPeriodBegin ??= null;
            this.futurePriceInfo.priceSetPeriodEnd ??= null;
        }
    }

    public static converter = {
        toFirestore(data: Contract): DocumentData {
            return {
                aflatoxin: data.aflatoxin ?? null,
                bankInfo: data.bankInfo ?? null,
                base: data.base ?? null,
                cargoDelays: data.cargoDelays ?? null,
                client: data.client ?? null,
                clientInfo: data.clientInfo ?? null,
                clientName: data.clientName ?? null,
                clientTicketInfo: data.clientTicketInfo ?? null,
                companyInfo: data.companyInfo ?? null,
                contractExecutive: data.contractExecutive ?? null,
                contractOwner: data.contractOwner ?? null,
                currency: data.currency ?? null,
                currentDelivered: data.currentDelivered.getMassInUnit(FirebaseDocInterface.session.getDefaultUnit()) ?? null,
                date: data.date ?? null,
                deliveredHistory: data.deliveredHistory ?? null,
                delivery_dates: data.delivery_dates ?? null,
                deliveryPlants: data.deliveryPlants ?? null,
                deliveryType: data.deliveryType ?? null,
                formOfPayment: data.formOfPayment ?? null,
                futurePriceBase: data.futurePriceBase.amount ?? null,
                futurePriceBaseUnit: data.futurePriceBase.unit ?? null,
                futurePriceInfo: data.futurePriceInfo ?? null,
                grade: data.grade ?? null,
                guarantee: data.guarantee ?? null,
                id: data.id ?? null,
                isOpen: data.isOpen ?? false,
                loadConditions: data.loadConditions ?? null,
                loadDelays: data.loadDelays ?? null,
                loads: data.loads ?? null,
                loadType: data.loadType ?? null,
                market_price: data.market_price ?? null,
                paymentDelays: data.paymentDelays ?? null,
                paymentTerms: data.paymentTerms.get() ?? null,
                paymentWithdrawal: data.paymentWithdrawal ?? null,
                pdfReference: data.pdfReference ?? null,
                plants: data.plants ?? null,
                prepaid: data.prepaid ?? null,
                price: data.price.amount ?? null,
                pricePerBushel: data.pricePerBushel ?? null,
                priceUnit: data.price.unit ?? null,
                product: data.product ?? null,
                productInfo: data.productInfo ?? null,
                quantity: data.quantity.get() ?? 0,
                quantityErrorPercentage: data.quantityErrorPercentage ?? null,
                quantityUnits: data.quantity.defaultUnits ?? FirebaseDocInterface.session.getDefaultUnit(),
                seller_terms: data.seller_terms ?? null,
                shrinkage: data.shrinkage ?? null,
                status: data.status ?? null,
                statusDates: data.statusDates ?? {
                    active: null,
                    closed: null,
                    cancelled: null,
                },
                storageAndFumigation: data.storageAndFumigation ?? null,
                tags: data.tags ?? [],
                termsOfPayment: data.termsOfPayment ?? null,
                tickets: data.tickets ?? [],
                transport: data.transport ?? null,
                transportInsurance: data.transportInsurance ?? null,
                truckers: data.truckers ?? [],
                type: data.type ?? null,

                progress: data.progress ?? null,
            }
        },
        fromFirestore(snapshot: QueryDocumentSnapshot<any>, options: SnapshotOptions): Contract {
            return new Contract(snapshot);
        }
    }

    public async getId(settings: ContractSettings): Promise<string> { 
        settings ??= await ContractSettings.getContractDoc(this);
        
        let id = settings.contractIdFormat ?? '';
        if(id == '') return this.id?.toString();

        let replaceStartId = id.indexOf('${');
        let ReplaceEndId;

        while(replaceStartId != -1) {
            ReplaceEndId = id.indexOf('}', replaceStartId);
            let replaceString: string;

            switch (id.substring(replaceStartId + 2, ReplaceEndId)) {
                case 'ID': {
                    replaceString = this.id.toString().padStart(4, '0') ?? null;
                    break;
                }

                case 'CONTRACTTYPE': {
                    replaceString = settings.contractTypeCodes[this.type] ?? '';
                    break;
                }

                case 'PRODUCT': {
                    replaceString = this.productInfo.productCode ?? '';
                    break;
                }

                default: {
                    replaceString = '';
                }
            }

            id = id.slice(0, replaceStartId) + replaceString + id.slice(ReplaceEndId + 1);
            replaceStartId = id.indexOf('${');
        }

        return id;
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

    public getTradeCode(): string {
        if(!(this?.productInfo?.marketCode || this?.futurePriceInfo?.expirationMonth)) return '';

        const marketMonthCodes: Map<number, string> = new Map<number, string>([
            [0,'F'], [1,'G'], [2,'H'], [3,'J'], [4,'K'], [5,'M'],
            [6,'N'], [7,'Q'], [8,'U'], [9,'V'], [10,'X'], [11,'Z'],
        ])

        return `${this.productInfo.marketCode}${marketMonthCodes.get(this.futurePriceInfo.expirationMonth.getMonth())}${this.futurePriceInfo.expirationMonth.getFullYear() % 10}`
    }

    public clearContactInfo(contactInfo: ContactInfo) {
        contactInfo.caat = null;
        contactInfo.city = null;
        contactInfo.email = null;
        contactInfo.name = null;
        contactInfo.phoneNumber = null;
        contactInfo.state = null;
        contactInfo.streetAddress = null;
        contactInfo.zipCode = null;
        contactInfo.ref = null;
        contactInfo.clientRep = null;
        contactInfo.rfc = null;
        contactInfo.curp = null;
        contactInfo.notarialAct = null;
        contactInfo.notarialActDate = null;

    }

    public changeStatus(newStatus: ContractStatus): Promise<void> {
        const updateDoc = {status: newStatus};
        const oldStatus = this.status;

        if(this.status != 'closed' && newStatus != 'pending') {
            updateDoc[`statusDates.${newStatus}`] = serverTimestamp();
        }

        this.status = newStatus;
        const promise = this.update(updateDoc);
        promise.catch(() => this.status = oldStatus);

        return promise;
    }

    public static getCollectionReference(db: Firestore, company: string, contractType?: contractType): CollectionReference<Contract> {
        return collection(db, `companies/${company}/contracts/`).withConverter(Contract.converter);
    }

    public static getCollectionQuery(db: Firestore, company: string, contractType: contractType): Query<Contract> {
        return query(Contract.getCollectionReference(db, company, contractType), where('type', '==', contractType));
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
            caat: contact.caat ?? null,
            city: contact.city ?? null,
            email: primaryContact.email ?? null,
            name: contact.name ?? null,
            phoneNumber: primaryContact.phone ?? null,
            state: contact.state ?? null,
            country: contact.country ?? null,
            streetAddress: contact.streetAddress ?? null,
            zipCode: contact.zipCode ?? null,
            ref: contact.ref.withConverter(Contact.converter) ?? null,
            clientRep: primaryContact.name ?? null,
            rfc: contact.rfc ?? null,
            curp: contact.curp ?? null,
            notarialAct: contact.notarialAct ?? null,
            notarialActDate: contact.notarialActDate ?? null,
        };
    }

    public static async getContractCount(db: Firestore, company: string, isPurchaseContract: boolean, ...constraints: QueryConstraint[]): Promise<number> {
        const contractCollQuery = query(Contract.getCollectionReference(db, company, isPurchaseContract), ...constraints);
        const contractSnapshot = await getCountFromServer(contractCollQuery);
        
        return contractSnapshot.data().count;
    }

    public static getContracts(db: Firestore, company: string, contractType?: contractType, ...constraints: QueryConstraint[]): Promise<Contract[]> {
        const collectionRef = Contract.getCollectionReference(db, company, contractType);
        let collectionQuery = query(collectionRef);
        if(contractType) collectionQuery = query(collectionQuery, where('type', '==', this.getContractType(contractType)));
        collectionQuery = query(collectionQuery, ...constraints);
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

    public getLiquidationsSnapshot(
        onNext: (snapshot: QuerySnapshot<Liquidation>) => void, 
        ...constraints: QueryConstraint[]
    ): Unsubscribe {
        const collectionRef = collection(this.ref, "liquidations").withConverter(Liquidation.converter);
        const collectionQuery = query(collectionRef, ...constraints);
        return onSnapshot(collectionQuery, onNext);
    }

    public getLiquidationByRefId(refId: string): Promise<Liquidation> {
        return getDoc(doc(this.ref, "liquidations", refId).withConverter(Liquidation.converter)).then(result => result.data());
    }

    public getPaymentsCollection(): CollectionReference {
        return collection(this.ref, "payments").withConverter(Payment.converter);
    }

    public getPaymentsSnapshot(
        onNext: (snapshot: QuerySnapshot<Payment>) => void,
        ...constraints: QueryConstraint[]
    ): Unsubscribe {
        const collectionQuery = query(this.getPaymentsCollection(), ...constraints);
        return onSnapshot(collectionQuery, onNext);
    }
}

export interface DeliveryDates {
    begin: Date;
    end: Date;
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

    get() {
        return {
            before: this.before ?? null,
            measurement: this.measurement ?? null,
            origin: this.origin ?? null,
            paymentTerms: this.paymentTerms ?? null,
        }
    }
}

export interface ProductInfo {
    brokenGrain: number;
    damagedGrain: number;
    foreignMatter: number;
    impurities: number;
    moisture: number;
    name: string;
    weight: number;
    marketCode: string;
    productCode: string;
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

export interface ContactInfo {
    caat: string;
    city: string;
    email: string;
    name: string;
    phoneNumber: string;
    state: string;
    country: string;
    streetAddress: string;
    zipCode: string;
    ref: DocumentReference<Contact>;
    clientRep: string;
    rfc: string;
    curp: string;
    notarialAct: string;
    notarialActDate: Date;
}

interface FuturePriceInfo {
    exchangeRate: string | number;
    expirationMonth: Date;
    future: number;
    marketOptions: string;
    priceSetPeriodBegin: Date;
    priceSetPeriodEnd: Date;
    program: string;
}

export interface Exectuive {
    name: string,
    ref: DocumentReference
}
