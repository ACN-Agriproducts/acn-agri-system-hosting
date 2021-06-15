import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-create-invoice',
  templateUrl: './create-invoice.page.html',
  styleUrls: ['./create-invoice.page.scss'],
})
export class CreateInvoicePage implements OnInit {
  public id: number;
  public allItems: any[];
  public total: number;
  public ready: boolean = false;
  
  invoiceForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private db: AngularFirestore,
    private localStorage: Storage,
    private navController: NavController
    ) {}

  ngOnInit() {
    this.invoiceForm = this.fb.group({
      seller: this.fb.group({
        name: [{value: "ACN Agriproducts, LLC.", disabled: true}, Validators.required],
        street: [{value: "1512 Rancho Toluca Road", disabled: true}, Validators.required],
        zip:  [{value: "78570", disabled: true}, Validators.required],
        city:  [{value: "Weslaco", disabled: true}, Validators.required],
        state:  [{value: "TX", disabled: true}, Validators.required],
        country:  [{value: "US", disabled: true}, Validators.required],
        phone:  [{value: "(956) 363-2205", disabled: true}, Validators.required]
      }),
      buyer: this.fb.group({
        name: [, Validators.required],
        street: [, Validators.required],
        zip:  [, Validators.required],
        city:  [, Validators.required],
        state:  [, Validators.required],
        country:  [, Validators.required],
        phone:  [, Validators.required]
      }),
      date: [new Date()],
      items: this.fb.array([this.createItem()])
    })

    console.log(this.invoiceForm.getRawValue())
    this.ready = true;
  }

  createItem(): FormGroup{
    return this.fb.group({
      name: [, Validators.required],
      quantity: [0, Validators.required],
      price: [, Validators.required],
      affectsInventory: [false, Validators.required],
      inventoryInfo: this.fb.group({
        product: [],
        quantity: [],
        plant: [],
        tank: []
      }, 
      {
        validators: [this.ifAffectsInventory]
      })
    })
  }

 ifAffectsInventory(formGroup: FormGroup) {
    if(!formGroup.parent) {
      return null;
    }
    
    let errors: any = {};
    let conError: boolean = false;

    if(formGroup.parent.value.affectsInventory) {
      if(!formGroup.value.product) {
        errors.requiredProduct = true;
        conError = true;
      }
      if(!formGroup.value.quantity) {
        errors.requiredQuantity = true;
        conError = true;
      }
      if(!formGroup.value.plant) {
        errors.requiredPlant = true;
        conError = true;
      }
      if(!formGroup.value.tank) {
        errors.requiredTank = true;
        conError = true;
      }

      return conError? errors:null
    }
  }
}
