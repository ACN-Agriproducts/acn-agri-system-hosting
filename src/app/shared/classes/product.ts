import { Firestore, CollectionReference, DocumentData, DocumentReference, QueryDocumentSnapshot, SnapshotOptions, collection, getDocs, doc, getDoc, collectionData } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { ProductInfo } from "./contract";
import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { Mass } from "./mass";

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
                weight: data.weight
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
            brokenGrain: null,
            damagedGrain: null,
            foreignMatter: null,
            impurities: null,
            moisture: this.moisture,
            name: this.getName(),
            weight: this.weight,
        }
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
}