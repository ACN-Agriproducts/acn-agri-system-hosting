import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, DocumentSnapshot } from '@angular/fire/firestore';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTable } from '@angular/material/table';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-discount-table',
  templateUrl: './discount-table.component.html',
  styleUrls: ['./discount-table.component.scss'],
})
export class DiscountTableComponent implements OnInit {
  @Input() doc: DocumentSnapshot<any>;
  @ViewChild(MatTable) tableView:MatTable<any>;

  public ready = false;
  public table: FormGroup;
  public currentCompany: string;
  public displayedColumns: string[] = ['low', 'high', 'weightDiscount', 'charge', 'bonus'];

  constructor(
    private db: AngularFirestore,
    private fb: FormBuilder,
    private storage: Storage
  ) { }

  ngOnInit() {
    this.table = this.fb.group({
      data: this.fb.array([])
    });
    
    new AngularFirestoreDocument(this.doc.ref, this.db).collection("discounts").doc("moisture").get().subscribe(val => {
      if(val.data['data']){
        val.data['data'].forEach(row => {
          this.data.push(this.createItem(row));
        });  
      }
      
      if (this.data.length == 0) {
        this.createItem();
      }

      this.ready = true;
      this.tableView.renderRows();
    })
  }

  createItem(row?: any): FormGroup{
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
    const data = this.table.get("data") as FormArray;
    data.push(this.createItem());
  }

  public submit(): void {
    this.db.doc(this.doc.ref).update({
      data: this.table.getRawValue().data
    });
  }

  get data(): FormArray {
    return this.table.get('data') as FormArray;
  }
}
