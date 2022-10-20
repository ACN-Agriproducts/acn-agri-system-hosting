import { Component, OnInit } from '@angular/core';
import { collection, DocumentSnapshot, Firestore, getDocs, limit, orderBy, provideFirestore, query } from '@angular/fire/firestore';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Company } from '@shared/classes/company';

@Component({
  selector: 'app-prices',
  templateUrl: './prices.page.html',
  styleUrls: ['./prices.page.scss'],
})
export class PricesPage implements OnInit {
  private collectionRef;
  private pricesSnapshot: DocumentSnapshot<pricesDoc>;
  public pricesTable: {
    [type: string]: pricesTable
  };

  constructor(
    private db: Firestore,
    private session: SessionInfo
  ) { }

  ngOnInit() {
    const companyRef = Company.getCompanyRef(this.db, this.session.getCompany());
    this.collectionRef = collection(companyRef, "prices");

    const pricesQuery = query<pricesDoc>(this.collectionRef, orderBy("date", "desc"), limit(1));
    this.pricesTable = {};

    getDocs(pricesQuery).then(result => {
      if(result.empty) {  
        return;
      }

      this.pricesSnapshot = result.docs[0];
      this.getInfoFromSnapshot();
    });
  }

  getInfoFromSnapshot(): void {
    const prices = this.pricesSnapshot.data().prices;

    for(let priceName in prices) {
      const currentPrice = prices[priceName];
      const firstLocation = currentPrice[Object.keys(currentPrice)[0]]
      const currentPriceTable = {
        locationNames: Object.keys(currentPrice),
        productNames: Object.keys(firstLocation),
        prices: (new Array<number[]>(Object.keys(firstLocation).length)).fill([]).map(() => new Array(Object.keys(currentPrice).length)),
      };

      this.pricesTable[priceName] = currentPriceTable;

      console.log(this.pricesTable)
      for(let location in currentPrice) {
        const currentLocation = currentPrice[location];

        for(let product in currentLocation) {
          this.setPrice(priceName, location, product, currentLocation[product]);
        }
      }
    }
  }

  setPrice(type: string, location: string, product: string, newPrice: number): void {
    const locationIndex = this.pricesTable[type].locationNames.findIndex(t => t == location);
    const productIndex = this.pricesTable[type].productNames.findIndex(p => p == product);

    this.pricesTable[type].prices[productIndex][locationIndex] = newPrice;
  }

  addNewRow(type: string): void {
    const table = this.pricesTable[type];
    const locationLength = table.locationNames.length;

    table.prices.push(new Array(locationLength).fill(0));
    table.productNames.push("product");
  }

  addNewColumn(type: string) {
    const table = this.pricesTable[type];
    table.locationNames.push("location");

    table.prices.forEach(list => {
      list.push(0);
    });

    console.log(this.pricesTable);
  }
  
  addNewTable(name: string, locationNames: string[] = [], productNames: string[] = []): void {
    if(this.pricesTable[name] === undefined) {
      return;
    }

    this.pricesTable[name] = {
      locationNames: locationNames.map(s => s.slice()),
      productNames: productNames.map(s => s.slice()),
      prices: (new Array<number[]>(productNames.length)).fill([]).map(() => new Array(locationNames.length)),
    }
  }
}

interface pricesDoc {
  prices: prices,
  date: Date
}

interface prices {
  [type: string]: { 
    [location: string]: {
      [ProductType: string]: number;
    }
  }
}

interface pricesTable {
  locationNames: string[];
  productNames: string[];
  prices: number[][];
}
