import { Component, OnInit } from '@angular/core';
import { addDoc, collection, CollectionReference, DocumentSnapshot, FieldValue, Firestore, getDocs, limit, orderBy, query, serverTimestamp } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { Company } from '@shared/classes/company';
import { lastValueFrom } from 'rxjs';
import { FieldRenameComponent } from './field-rename/field-rename.component';
import { NewTableDialogComponent } from './new-table-dialog/new-table-dialog.component';
import { TableImportDialogComponent } from './table-import-dialog/table-import-dialog.component';

@Component({
  selector: 'app-prices',
  templateUrl: './prices.page.html',
  styleUrls: ['./prices.page.scss'],
})
export class PricesPage implements OnInit {
  private collectionRef: CollectionReference;
  private pricesSnapshot: DocumentSnapshot;
  public pricesTable: {
    [type: string]: pricesTable;
  };
  public dollarPrice: number;

  constructor(
    private db: Firestore,
    private session: SessionInfo,
    private dialog: MatDialog,
    private snackbar: SnackbarService
  ) { }

  ngOnInit() {
    const companyRef = Company.getCompanyRef(this.db, this.session.getCompany());
    this.collectionRef = collection(companyRef, "prices");

    const pricesQuery = query(this.collectionRef, orderBy("date", "desc"), limit(1));
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
    const snapData = this.pricesSnapshot.data() as pricesDoc;
    const prices = snapData.prices;
    this.dollarPrice = snapData.dollarPrice;

    for(let priceTable of prices) {
      const firstLocation = priceTable.data[Object.keys(priceTable.data)[0]]
      const currentPriceTable: pricesTable = {
        futurePrice: priceTable.futurePrice,
        locationNames: Object.keys(priceTable.data),
        productNames: Object.keys(firstLocation),
        prices: (new Array<number[]>(Object.keys(firstLocation).length)).fill([]).map(() => new Array(Object.keys(priceTable.data).length)),
      };
      const priceName = priceTable.name;

      this.pricesTable[priceName] = currentPriceTable;

      for(let location in priceTable.data) {
        const currentLocation = priceTable.data[location];

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
    let futurePrice = 0;

    if(newTableInfo.baseTable != "") {
      locationNames = this.pricesTable[newTableInfo.baseTable].locationNames;
      productNames = this.pricesTable[newTableInfo.baseTable].productNames;
      futurePrice = this.pricesTable[newTableInfo.baseTable].futurePrice;
    }

    this.pricesTable[newTableInfo.name] = {
      futurePrice: futurePrice,
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

  async importFromExcelTablePaste(priceTypeName: string) {
    const dialogRef = this.dialog.open(TableImportDialogComponent, {
      width: '350px'
    });

    const tableInput = await lastValueFrom(dialogRef.afterClosed());
    
    // This line should split input into rows and columns, while cleaning any white spaces
    // from the strings.
    const rows: string[][] = tableInput.trim().split("\n").map(r => r.split('\t').map(s => s.trim()));
    const locationNames = rows[0];
    locationNames.splice(0, 1);

    const productNames: string[] = [];
    const prices: number[][] = [];
    rows.splice(0, 1);

    for(let index = 0; index < rows.length; index++) {
      productNames.push(rows[index][0]);
      prices.push(rows[index].splice(1).map(ns => Number.parseFloat(ns.replace(/,/g, ''))));
    }

    this.pricesTable[priceTypeName] = {
      futurePrice: 0,
      locationNames: locationNames,
      productNames: productNames,
      prices: prices
    };
  }

  getSubmitObject() {
    const submitDoc: pricesDoc = {
      prices: [],
      date: serverTimestamp(),
      dollarPrice: this.dollarPrice
    };

    for(let typeName in this.pricesTable) {
      const currentTable = this.pricesTable[typeName];
      const priceTable: priceTable = {
        name: typeName,
        futurePrice: currentTable.futurePrice,
        data: {} 
      };
      submitDoc.prices.push(priceTable);

      for(let locationIndex = 0; locationIndex < currentTable.locationNames.length; locationIndex++) {
        const row = priceTable.data[currentTable.locationNames[locationIndex]] = {};
        for(let productIndex = 0; productIndex < currentTable.productNames.length; productIndex++) {
          row[currentTable.productNames[productIndex]] = currentTable.prices[productIndex][locationIndex];
        }
      }
    }

    return submitDoc;
  }

  submit() {
    addDoc(this.collectionRef, this.getSubmitObject()).then(() => {
      this.snackbar.open("Document saved", "success");
    });
    this.snackbar.open("Saving...", "info");
  }
}

interface pricesDoc {
  prices: priceTable[];
  date: Date | FieldValue;
  dollarPrice: number;
}

interface priceTable {
  futurePrice: number;
  name: string;
  data:{
    [location: string]: {
      [ProductType: string]: number;
    };
  };
}

interface pricesTable {
  futurePrice: number;
  locationNames: string[];
  productNames: string[];
  prices: number[][];
}

enum columnOrRow {
  column, row
}
