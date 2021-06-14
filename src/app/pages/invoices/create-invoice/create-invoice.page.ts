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

  public seller: Client;
  public buyer: Client;
  public id: number;
  public date: Date;
  public items: any[];
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
        name: ["ACN Agriproducts, LLC.", Validators.required],
        street: ["1512 Rancho Toluca Road", Validators.required],
        zip:  ["78570", Validators.required],
        city:  ["Weslaco", Validators.required],
        state:  ["TX", Validators.required],
        country:  ["US", Validators.required],
        phone:  ["(956) 363-2205", Validators.required]
      }),
      buyer: this.fb.group({
        name: ["", Validators.required],
        street: ["", Validators.required],
        zip:  ["", Validators.required],
        city:  ["", Validators.required],
        state:  ["", Validators.required],
        country:  ["", Validators.required],
        phone:  ["", Validators.required]
      }),
      date: [new Date()],
      items: this.fb.array([this.createItem()])
    })

    this.ready = true;
  }

  createItem(): FormGroup{
    return this.fb.group({
      name: ['', Validators.required],
      quantity: [0, Validators.required],
      price: [0, Validators.required],
      affectsInventory: [true, Validators.required],
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

class Client {
  public name: string;
  public street: string;
  public zip: string
  public city: string;
  public state: string;
  public country: string;
  public phone: string;
}
