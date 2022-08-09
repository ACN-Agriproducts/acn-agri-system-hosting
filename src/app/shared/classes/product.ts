import { Firestore, CollectionReference, DocumentData, DocumentReference, QueryDocumentSnapshot, SnapshotOptions, collection, getDocs, doc, getDoc } from "@angular/fire/firestore";
import { collectionData } from "rxfire/firestore";
import { Observable } from "rxjs";
import { FirebaseDocInterface } from "./FirebaseDocInterface";

export class Product extends FirebaseDocInterface {
    public forSale: number;
    public moisture: number;
    public owned: number;
    public ownedPhysical: number;
    public physicalInventory: number;
    public weight: number;

    constructor(snapshot: QueryDocumentSnapshot<any>) {
        super(snapshot, Product.converter);

        const data = snapshot.data();

        this.forSale = data.forSale;
        this.moisture = data.moisture;
        this.owned = data.owned;
        this.ownedPhysical = data.ownedPhysical;
        this.physicalInventory = data.physicalInventory;
        this.weight = data.weight;
    }

    public static converter = {
        toFirestore(data: Product): DocumentData {
            return {
                forSale: data.forSale,
                moisture: data.moisture,
                owned: data.owned,
                ownedPhysical: data.ownedPhysical,
                physicalInventory: data.physicalInventory,
                weight: data.weight,
            }
        },
        fromFirestore(snapshot: QueryDocumentSnapshot<any>, options: SnapshotOptions): Product {
            return new Product(snapshot);
        }
    }

    public getName(): string {
        return this.ref.id;
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