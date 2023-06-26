import { Component, OnInit } from '@angular/core';
import { Firestore, doc } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { DiscountTable, DiscountTables } from '@shared/classes/discount-tables';
import { Product } from '@shared/classes/product';
import { MatDialog } from '@angular/material/dialog';

import { SetDiscountTableDialogComponent } from './components/set-discount-table-dialog/set-discount-table-dialog.component';
import { ConfirmationDialogService } from '@core/services/confirmation-dialog/confirmation-dialog.service';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-product',
  templateUrl: './product.page.html',
  styleUrls: ['./product.page.scss'],
})
export class ProductPage implements OnInit {
  public product: string;
  public ready: boolean = false;
  public doc: Product;
  public discountTables: DiscountTables;
  public saved: boolean;

  constructor(
    private route: ActivatedRoute,
    private db: Firestore,
    private session: SessionInfo,
    private dialog: MatDialog,
    private confirmation: ConfirmationDialogService,
    private snack: SnackbarService,
  ) { 
    this.product = route.snapshot.paramMap.get('product');
  }

  ngOnInit() {
    Product.getProduct(this.db, this.session.getCompany(), this.product).then(productDoc => {
      this.doc = productDoc;
      this.ready = true;
    });

    DiscountTables.getDiscountTables(this.db, this.session.getCompany(), this.product).then(async result => {
      if (!result) {
        this.discountTables = new DiscountTables(doc(DiscountTables.getCollectionReference(this.db, this.session.getCompany(), this.product)));
        await this.discountTables.set();
        return;
      }

      this.discountTables = result;
    });
  }

  async setTable(table?: DiscountTable) {
    const dialogRef = this.dialog.open(SetDiscountTableDialogComponent, {
      data: table,
      disableClose: true
    });

    const result = await lastValueFrom(dialogRef.afterClosed());
    if (!result) return;

    if (table) {
      let tableIndex = this.discountTables.tables.indexOf(table);
      this.discountTables.tables.splice(tableIndex, 1, result);
    }
    else {
      this.discountTables.tables.push(result);
    }

    await this.setTables();
    this.snack.open(`Table ${table ? "Updated" : "Created"}`, "success");
  }

  async deleteTable(table: DiscountTable) {
    let tableIndex = this.discountTables.tables.indexOf(table);
    const confirm = this.confirmation.openDialog(`delete the "${this.discountTables.tables[tableIndex].name}" table`);

    if (await confirm) {
      this.discountTables.tables.splice(tableIndex, 1);
      await this.setTables();
      this.snack.open(`Table Deleted`);
    }
  }

  async saveTable() {
    await this.setTables();
    this.saved = !this.saved;
  }

  async setTables() {
    this.discountTables.ref = doc(DiscountTables.getCollectionReference(this.db, this.session.getCompany(), this.product));
    this.discountTables.date = new Date();
    await this.discountTables.set();
  }

  ngOnDestroy() {
    delete this.discountTables;
  }
}
