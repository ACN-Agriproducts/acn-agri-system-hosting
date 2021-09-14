import { Component, Input, OnInit } from '@angular/core';
import { DocumentReference } from '@angular/fire/firestore';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-item-form',
  templateUrl: './item-form.component.html',
  styleUrls: ['./item-form.component.scss'],
})
export class ItemFormComponent implements OnInit {
  @Input() item: any;
  @Input() invoiceRef: DocumentReference;
  @Input() index: number;

  public itemForm: FormGroup;
  
  constructor(
    private fb: FormBuilder
  ) { 
    this.itemForm = fb.group({
      details: this.fb.array([]),
      name: [this.item.name, Validators.required],
      quantity: [this.item.quantity, Validators.required],
      price: [this.item.price, Validators.required],
      inventoryInfo: this.fb.array([this.createInventoryInfo(this.item.inventoryInfo)])
    })

    if (this.item.details) {
      const details = this.itemForm.get("details") as FormArray;
      details.push(this.createDetail(this.item.details));
    }
  }

  ngOnInit() {}

  createDetail(detail: string = ""): FormControl{
    return this.fb.control(detail, Validators.required);
  }

  addInventoryInfo(): void{
    const inventory = this.itemForm.get("inventoryInfo") as FormArray;
    inventory.push(this.createInventoryInfo());
  }

  createInventoryInfo(info?: any): FormGroup{
    if(info == null) {
      info = {
        product: null,
        quantiy: null,
        plant: null,
        tank: null
      }
    }

    return this.fb.group({
      product: [info.product],
      quntity: [info.quntity],
      plant: [info.plant],
      tank: [info.tank]
    })
  }

  submitButton(): void {
    
  }
}