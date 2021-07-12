import { Component, Input, OnInit } from '@angular/core';
import { AngularFirestore, DocumentSnapshot } from '@angular/fire/firestore';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-discount-table',
  templateUrl: './discount-table.component.html',
  styleUrls: ['./discount-table.component.scss'],
})
export class DiscountTableComponent implements OnInit {
  @Input() doc: DocumentSnapshot<any>;

  public table: FormGroup;

  constructor(
    private db: AngularFirestore,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.table = this.fb.group({
      data: this.fb.array([])
    })
  }

  createItem(): FormGroup{
    return this.fb.group({
      low: [,Validators.required],
      high: [,Validators.required],
      weightDiscount: [,Validators.required],
      charge: [,Validators.required],
      bonus: [,Validators.required]
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
