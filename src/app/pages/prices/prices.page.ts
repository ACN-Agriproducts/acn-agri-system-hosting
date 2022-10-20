import { Component, OnInit } from '@angular/core';
import { collection, DocumentSnapshot, Firestore, getDocs, limit, orderBy, provideFirestore, query } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Company } from '@shared/classes/company';
import { lastValueFrom } from 'rxjs';
import { FieldRenameComponent } from './field-rename/field-rename.component';
import { NewTableDialogComponent } from './new-table-dialog/new-table-dialog.component';

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
    private session: SessionInfo,
    private dialog: MatDialog
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

  async addNewRow(type: string): Promise<void> {
    const table = this.pricesTable[type];
    const locationLength = table.locationNames.length;
    const dialogRef = this.dialog.open(FieldRenameComponent, {
      width: "350px",
      data:{
        name: "",
        invalidNames: table.productNames
      }
    });

    const name = await lastValueFrom(dialogRef.afterClosed());
    if(name == null || name == "") return;

    table.prices.push(new Array(locationLength).fill(0));
    table.productNames.push(name);
  }

  async addNewColumn(type: string) {
    const table = this.pricesTable[type];
    const dialogRef = this.dialog.open(FieldRenameComponent, {
      width: "350px",
      data: {
        name: "",
        invalidNames: table.locationNames
      }
    });

    const name = await lastValueFrom(dialogRef.afterClosed());
    if(name == null || name == "") return;

    table.locationNames.push(name);
    table.prices.forEach(list => {
      list.push(0);
    });
  }
  
  async addNewTable(): Promise<void> {
    const dialogRef = this.dialog.open(NewTableDialogComponent, {
      width: "350px",
      data: Object.keys(this.pricesTable)
    })

    const newTableInfo: {name: string; baseTable: string;} = await lastValueFrom(dialogRef.afterClosed());

    if(newTableInfo == null) return;
    let locationNames: string[] = [];
    let productNames: string[] = [];

    if(newTableInfo.baseTable != "") {
      locationNames = this.pricesTable[newTableInfo.baseTable].locationNames;
      productNames = this.pricesTable[newTableInfo.baseTable].productNames;
    }

    this.pricesTable[newTableInfo.name] = {
      locationNames: Array.from(locationNames),
      productNames: Array.from(productNames),
      prices: (new Array<number[]>(productNames.length)).fill([]).map(() => new Array(locationNames.length)),
    }
  }

  async renameField(priceTypeName: string, type: columnOrRow, index: number) {
    const table = this.pricesTable[priceTypeName];
    const namesList = type == columnOrRow.column ? table.locationNames : table.productNames;

    const dialogRef = this.dialog.open(FieldRenameComponent, {
      width: "350px",
      data: {
        name: namesList[index],
        invalidNames: namesList
      }
    });

    const name = await lastValueFrom(dialogRef.afterClosed());
    if(name == null) return;
    if(namesList.some(n => n == name)) return;
    if(name == "") {
      this.deleteRowOrColumn(priceTypeName, type, index);
      return;
    }

    namesList[index] = name;
  }

  async renameTable(tableName: string) {
    const dialogRef = this.dialog.open(FieldRenameComponent, {
      width: "350px",
      data: {
        name: tableName,
        invalidNames: Object.keys(this.pricesTable)
      }
    });

    const name = await lastValueFrom(dialogRef.afterClosed());

    if(name == null) return;
    if(Object.keys(this.pricesTable).some(n => n == name)) return;

    if(name != "") {
      this.pricesTable[name] = this.pricesTable[tableName];
    }

    delete this.pricesTable[tableName];
  }

  deleteRowOrColumn(priceTypeName: string, type: columnOrRow, index: number) {
    const table = this.pricesTable[priceTypeName];
    const namesList = type == columnOrRow.column ? table.locationNames : table.productNames;
    
    namesList.splice(index, 1);

    if(type == columnOrRow.column) {
      table.prices.forEach(row => {
        row.splice(index, 1);
      });
    }
    else { 
      table.prices.splice(index, 1);
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

enum columnOrRow {
  column, row
}
