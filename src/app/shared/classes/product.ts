import { Firestore, CollectionReference, DocumentData, DocumentReference, QueryDocumentSnapshot, SnapshotOptions, collection, getDocs, doc, getDoc, collectionData, QueryConstraint, query, limit, orderBy, where } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { ProductInfo } from "./contract";
import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { Mass } from "./mass";
import { DiscountTables } from "./discount-tables";

export class Product extends FirebaseDocInterface {
    public brokenGrain: number;
    public damagedGrain: number;
    public foreignMatter: number;
    public forSale: Mass;
    public impurities: number;
    public moisture: number;
    public owned: Mass;
    public ownedPhysical: Mass;
    public physicalInventory: Mass;
    public weight: number;
    public marketCode: string;
    public productCode: string;

    constructor(snapshot: QueryDocumentSnapshot<any>) {
        super(snapshot, Product.converter);

        const data = snapshot.data();
        const unit = FirebaseDocInterface.session.getDefaultUnit();

        this.brokenGrain = data.brokenGrain;
        this.damagedGrain = data.damagedGrain;
        this.foreignMatter = data.foreignMatter;
        this.forSale = new Mass(data.forSale, unit);
        this.impurities = data.impurities
        this.moisture = data.moisture;
        this.owned = new Mass(data.owned, unit);
        this.ownedPhysical = new Mass(data.ownedPhysical, unit);
        this.physicalInventory = new Mass(data.physicalInventory, unit);
        this.weight = data.weight;
        this.marketCode = data.marketCode;
        this.productCode = data.productCode;
    }

    public static converter = {
        toFirestore(data: Product): DocumentData {
            return {
                brokenGrain: data.brokenGrain,
                damagedGrain: data.damagedGrain,
                foreignMatter: data.foreignMatter,
                forSale: data.forSale.get(),
                impurities: data.impurities,
                moisture: data.moisture,
                owned: data.owned.get(),
                ownedPhysical: data.ownedPhysical.get(),
                physicalInventory: data.physicalInventory.get(),
                weight: data.weight,
                marketCode: data.marketCode,
                productCode: data.productCode,
            }
        },
        fromFirestore(snapshot: QueryDocumentSnapshot<any>, options: SnapshotOptions): Product {
            return new Product(snapshot);
        }
    }

    public getName(): string {
        return this.ref.id;
    }

    public getProductInfo(): ProductInfo {
        return {
            brokenGrain: this.brokenGrain ?? null,
            damagedGrain: this.damagedGrain ?? null,
            foreignMatter: this.foreignMatter ?? null,
            impurities: this.impurities ?? null,
            moisture: this.moisture ?? null,
            name: this.getName() ?? null,
            weight: this.weight ?? null,
            marketCode: this.marketCode ?? null,
            productCode: this.productCode ?? '',
        };
    }

    public static getCollectionReference(db: Firestore, company: string): CollectionReference<Product> {
        return collection(db, `companies/${company}/products`).withConverter(Product.converter);
    }

    public static getProductList(db: Firestore, company: string): Promise<Product[]> {
        return getDocs(Product.getCollectionReference(db, company)).then(result => {
            return result.docs.map(doc => doc.data());
        });
    }

    public static getProductReference(db: Firestore, company: string, productName: string): DocumentReference<Product> {
        return doc(Product.getCollectionReference(db, company), productName).withConverter(Product.converter);
    }

    public static getProduct(db: Firestore, company: string, productName: string): Promise<Product> {
        return getDoc(Product.getProductReference(db, company, productName)).then(result => {
            return result.data()
        });
    }

    public static getCollectionSnapshot(db: Firestore, company: string): Observable<Product[]> {
        return collectionData(Product.getCollectionReference(db, company));
    }

    public getDiscountTablesCollection() {
        return collection(this.ref, "discounts").withConverter(DiscountTables.converter);
    }

    public getDiscountTables(date?: Date): Promise<DiscountTables> {
        const collectionQuery = query(
            collection(this.ref, "discounts").withConverter(DiscountTables.converter),
            date ? where('date', '==', date) : orderBy('date', 'desc'), limit(1)
        );
        return getDocs(collectionQuery).then(result => result.docs[0]?.data());
    }
}