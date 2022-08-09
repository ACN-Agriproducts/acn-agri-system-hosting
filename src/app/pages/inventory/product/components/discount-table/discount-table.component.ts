import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Firestore, collection, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatTable } from '@angular/material/table';
import { NavController } from '@ionic/angular';
import { Product } from '@shared/classes/product';

@Component({
  selector: 'app-discount-table',
  templateUrl: './discount-table.component.html',
  styleUrls: ['./discount-table.component.scss'],
})
export class DiscountTableComponent implements OnInit {
  @Input() doc: Product;
  @ViewChild(MatTable) tableView:MatTable<any>;

  public ready = false;
  public table: UntypedFormGroup;
  public currentCompany: string;
  public displayedColumns: string[] = ['low', 'high', 'weightDiscount', 'charge', 'bonus', 'delete'];

  constructor(
    private db: Firestore,
    private fb: UntypedFormBuilder,
    private navController: NavController
  ) { }

  ngOnInit() {
    this.table = this.fb.group({
      data: this.fb.array([])
    });
    
    const sub = getDoc(doc(collection(this.doc.ref, "discounts"), "moisture")).then(val => {
      const data = this.table.get("data") as UntypedFormArray;

      if(val.data()['data']){
        val.data()['data'].forEach(row => {
          data.push(this.createItem(row));
        });  
      }
    
      this.ready = true;

      if (this.data.length == 0) {
        this.addItem();
      }
    })
  }

  createItem(row?: any): UntypedFormGroup{
    if(typeof row == "undefined"){
      row = {
        low: null,
        high: null,
        weightDiscount: null,
        charge: null,
        bonus: null
      }
    }

    return this.fb.group({
      low: [row.low,Validators.required],
      high: [row.high,Validators.required],
      weightDiscount: [row.weightDiscount,Validators.required],
      charge: [row.charge,Validators.required],
      bonus: [row.bonus,Validators.required]
    })
  }

  public addItem(): void{
    const data = this.table.get("data") as UntypedFormArray;
    data.push(this.createItem());

    if(this.tableView){
      this.tableView.renderRows();
    }
  }

  public deleteItem(index: number): void{
    const data = this.table.get("data") as UntypedFormArray;
    if(index >= data.length){
      return;
    }

    data.removeAt(index);
    this.tableView.renderRows();
  }

  public submit(): void {
    var rawTable: any[] = this.table.getRawValue().data as any[];
    rawTable.sort((a,b) => a.low - b.low);
    
    if(!this.checkOverlap(rawTable)){
      return;
    }

    updateDoc(doc(collection(this.doc.ref, "discounts"), "moisture"), {
      data: rawTable
    });

    this.navController.navigateForward('dashboard/inventory');
  }

  public checkOverlap(rawTable: any[]): boolean {
    var tableRanges: number[] = [];

    rawTable.forEach(row => {
      if(row.low >= row.high){
        return false;
      }

      tableRanges.forEach(high => {
        if(row.low < high){
          return false;
        }
      });
    });

    return true;
  }

  get data(): UntypedFormArray {
    return this.table.get('data') as UntypedFormArray;
  }
}
