import { Component, OnInit } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/compat/firestore';
import { FormGroup, FormBuilder, Validators, FormArray, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AlertController, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Plant } from '@shared/classes/plant';
import { Product } from '@shared/classes/product';
import { WarehouseReceiptGroup } from '@shared/classes/WarehouseReceiptGroup';
import { UniqueWarehouseReceiptIdService } from '../components/unique-warehouse-receipt-id/unique-warehouse-receipt-id.service';

@Component({
  selector: 'app-set-warehouse-receipt-group',
  templateUrl: './set-warehouse-receipt-group.page.html',
  styleUrls: ['./set-warehouse-receipt-group.page.scss'],
})
export class SetWarehouseReceiptGroupPage implements OnInit {
  public addingWarehouseReceipts: boolean = false;
  public currentCompany: string;
  public plantList: string[];
  public productList: string[];
  public warehouseReceiptCollectionRef: AngularFirestoreCollection;
  public warehouseReceiptGroupForm: FormGroup;
  public totalBushelQuantity: number = 0;
  public warehouseReceiptIdList: number[];

  constructor(
    private alertController: AlertController,
    private db: AngularFirestore,
    private fb: FormBuilder,
    private localStorage: Storage,
    private navController: NavController,
    private uniqueId: UniqueWarehouseReceiptIdService,
  ) { }

  ngOnInit() {
    this.localStorage.get('currentCompany')
    .then(company => {
      this.currentCompany = company;
      this.warehouseReceiptCollectionRef = this.db.collection(WarehouseReceiptGroup.getWrCollectionReference(this.db, company));
      return Plant.getPlantList(this.db, company);
    })
    .then(plantObjList => {
      this.plantList = plantObjList.map(plant => plant.ref.id);
      return Product.getProductList(this.db, this.currentCompany);
    })
    .then(productObjList => {
      this.productList = productObjList.map(product => product.getName());
    });

    this.uniqueId.setGetterFunction(this.getWarehouseReceiptCollection.bind(this));

    this.warehouseReceiptGroupForm = this.fb.group({
      bushelQuantity: [10_000, Validators.required],
      startId: ['', Validators.required],
      plant: ['', Validators.required],
      product: ['', Validators.required],
      quantity: [1, Validators.required],
      creationDate: [new Date()],
      warehouseReceiptList: this.fb.array([], this.validateIds())
    });

    for (const controlName in this.warehouseReceiptGroupForm.controls) {
      if (controlName == 'warehouseReceiptList') continue;
      this.warehouseReceiptGroupForm.get(controlName).statusChanges.subscribe(() => {
        if (this.checkInfoValid()) {
          this.addWarehouseReceipts(this.warehouseReceiptGroupForm.getRawValue());
        }
      })
    }
  }
  

  public getWarehouseReceiptCollection = (): AngularFirestoreCollection => {
    return this.warehouseReceiptCollectionRef;
  }

  public validateIds = (): ValidatorFn  => {
    return (formArray: FormArray): ValidationErrors | null => {
      const idArray = formArray.controls.map(formGroup => formGroup.value.id);
      this.warehouseReceiptIdList = idArray;

      const invalid = idArray.some((id, index) => {
        return idArray.indexOf(id) !== index;
      });

      return invalid ? { duplicateId: true} : null;
    }
  }

  public checkInfoValid = (): boolean => {
    for (const controlName in this.warehouseReceiptGroupForm.controls) {
      if (controlName === 'warehouseReceiptList') continue;
      if (this.warehouseReceiptGroupForm.get(controlName).invalid) return false;
    }
    return true;
  }

  public addWarehouseReceipts = (formValues: any): void => {
    const warehouseReceiptList = this.warehouseReceiptGroupForm.get('warehouseReceiptList') as FormArray;
    warehouseReceiptList.clear();

    for (let i = 0; i < formValues.quantity; i++) {
      warehouseReceiptList.push(this.createWarehouseReceipt(formValues, i));
    }
  }

  public createWarehouseReceipt = (formValues: any, index: number): FormGroup => {
    const group = this.fb.group({
      bushelQuantity: [formValues.bushelQuantity, Validators.required],
      date: [formValues.creationDate, Validators.required],
      id: [
        formValues.startId + index, 
        [Validators.required], 
        this.uniqueId.validate.bind(this.uniqueId)
      ],
      plant: [formValues.plant, Validators.required],
      product: [formValues.product, Validators.required],
    });

    group.get('id').markAsTouched();
    return group;
  }

  public cancel = (): void => {
    this.navController.navigateBack('/dashboard/warehouse-receipts');
  }

  public confirm = async (): Promise<void> => {
    let alert = this.alertController.create({
      header: "Confirmation",
      message: "Are you sure you would like to submit these Warehouse Receipts?",
      buttons: [
        {
          text: "yes",
          handler: async () => {
            (await alert).dismiss();
            this.submitWarehouseReceiptGroup();
          }
        },
        {
          text: "no",
          role: 'cancel'
        }
      ]
    });

    (await alert).present();
  }

  public submitWarehouseReceiptGroup = async (): Promise<void> => {
    const formValues = this.warehouseReceiptGroupForm.getRawValue();

    formValues.warehouseReceiptList.forEach(warehouseReceipt => {
      this.totalBushelQuantity += warehouseReceipt.bushelQuantity;
    });

    let receiptGroup = {
      creationDate: formValues.creationDate,
      purchaseContract: null,
      saleContract: null,
      status: "pending",
      totalBushelQuantity: this.totalBushelQuantity,
      warehouseReceiptIdList: this.warehouseReceiptIdList.sort(),
      warehouseReceiptList: formValues.warehouseReceiptList.sort(receipt => receipt.id)
    };

    this.warehouseReceiptCollectionRef.add(receiptGroup).then(() => {
      this.navController.navigateForward('/dashboard/warehouse-receipts');
    }).catch(error => {
      console.log("Error submitting form: ", error);
    });
  }
}
