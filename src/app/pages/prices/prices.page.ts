import { Component, OnInit } from '@angular/core';
import { collection, Firestore, getDocs, limit, orderBy, query, where } from '@angular/fire/firestore';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Company } from '@shared/classes/company';

@Component({
  selector: 'app-prices',
  templateUrl: './prices.page.html',
  styleUrls: ['./prices.page.scss'],
})
export class PricesPage implements OnInit {
  private collectionRef;
  public prices: prices;
  public productTypes: string[];

  constructor(
    private db: Firestore,
    private session: SessionInfo
  ) { }

  ngOnInit() {
    const companyRef = Company.getCompanyRef(this.db, this.session.getCompany());
    this.collectionRef = collection(companyRef, "prices");

    const pricesQuery = query<pricesDoc>(this.collectionRef, orderBy("date", "desc"), limit(1));
    getDocs(pricesQuery).then(result => {
      this.productTypes = [];

      if(result.empty) {
        this.prices = {};
        return;
      }

      this.prices = result.docs[0].data().prices;
      if(Object.keys(this.prices).length > 0) {
        const firstType = this.prices[Object.keys(this.prices)[0]];

        if(Object.keys(firstType).length > 0) {
          const firstLocation = firstType[Object.keys(firstType)[0]];
          this.productTypes = Object.keys(firstLocation);
        }
      }

    }).catch(error => {
      console.error(error);
      this.prices = {
        "minimumPricesSale": {
          "queretaro": {
            "maiz": 8170.27,
            "maiz ond": 8059.75,
            "sorgo": 7615.19
          },
          "salinas v.": {
            "maiz": 7641.36,
            "maiz ond": 6688.34,
            "sorgo": 7123.31
          },
          "san luis": {
            "maiz": 8083.43,
            "maiz ond": 7060.81,
            "sorgo": 7534.44
          },
          "guadalajara": {
            "maiz": 8282.79,
            "maiz ond": 6993.45,
            "sorgo": 7490.39
          },
          "torreon": {
            "maiz": 8036.07,
            "maiz ond": 6993.45,
            "sorgo": 7490.39
          }
        },
        "preciosLab": {
          "queretaro": {
            "maiz": 7076.27,
            "maiz ond": 6965.75,
            "sorgo": 6521.19
          },
          "salinas v.": {
            "maiz": 7641.36,
            "maiz ond": 6688.34,
            "sorgo": 7123.31
          },
          "san luis": {
            "maiz": 8083.43,
            "maiz ond": 7060.81,
            "sorgo": 7534.44
          },
          "guadalajara": {
            "maiz": 8282.79,
            "maiz ond": 6993.45,
            "sorgo": 7490.39
          },
          "torreon": {
            "maiz": 8036.07,
            "maiz ond": 6993.45,
            "sorgo": 7490.39
          }
        }
      };

      this.productTypes = ["maiz", "maiz ond", "sorgo"];
    });
  }
}

interface pricesDoc {
  prices: prices
}

interface prices {
  [type: string]: {
    [location: string]: {
      [ProductType: string]: number;
    }
  }
}
