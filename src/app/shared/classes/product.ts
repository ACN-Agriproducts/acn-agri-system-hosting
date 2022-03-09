import { AngularFirestore, CollectionReference, DocumentData, DocumentReference, QueryDocumentSnapshot, SnapshotOptions } from "@angular/fire/compat/firestore";
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

    public static getCollectionReference(db: AngularFirestore, company: string): CollectionReference<Product> {
        return db.firestore.collection(`companies/${company}/products`).withConverter(Product.converter);
    }

    public static getProductList(db: AngularFirestore, company: string): Promise<Product[]> {
        return Product.getCollectionReference(db, company).get().then(result => {
            return result.docs.map(doc => doc.data());
        });
    }

    public static getProductReference(db: AngularFirestore, company: string, productName: string): DocumentReference<Product> {
        return Product.getCollectionReference(db, company).doc(productName).withConverter(Product.converter);
    }

    public static getProduct(db: AngularFirestore, company: string, productName: string): Promise<Product> {
        return Product.getProductReference(db, company, productName).get().then(result => {
            return result.data()
        });
    }
}