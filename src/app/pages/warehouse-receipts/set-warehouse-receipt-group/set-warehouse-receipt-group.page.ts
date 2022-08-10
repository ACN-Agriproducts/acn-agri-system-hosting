import { Component, OnInit } from '@angular/core';
import { addDoc, collection, CollectionReference, Firestore } from '@angular/fire/firestore';
import { FormGroup, FormBuilder, Validators, FormArray, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlertController, NavController, ToastController } from '@ionic/angular';
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
  public warehouseReceiptCollectionRef: CollectionReference;
  public warehouseReceiptGroupForm: FormGroup;
  public totalBushelQuantity: number = 0;
  public warehouseReceiptIdList: number[];

  constructor(
    private alertController: AlertController,
    private db: Firestore,
    private fb: FormBuilder,
    private localStorage: Storage,
    private navController: NavController,
    private snackbar: MatSnackBar,
    private uniqueId: UniqueWarehouseReceiptIdService,
  ) { }

  ngOnInit() {
    this.localStorage.get('currentCompany')
    .then(company => {
      this.currentCompany = company;
      this.warehouseReceiptCollectionRef = WarehouseReceiptGroup.getWrCollectionReference(this.db, company).withConverter(null);
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
      creationDate: [new Date()],
      plant: ['', Validators.required],
      product: ['', Validators.required],
      quantity: [1, Validators.required],
      receiptDates: [new Date()],
      startId: ['', Validators.required],
      warehouseReceiptList: this.fb.array([], this.validateIds())
    });

    for (const controlName in this.warehouseReceiptGroupForm.controls) {
      if (controlName == 'warehouseReceiptList') continue;
      this.warehouseReceiptGroupForm.get(controlName).statusChanges.subscribe(() => {
        if (this.checkInfoValid()) {
          this.addWarehouseReceipts(this.warehouseReceiptGroupForm.getRawValue());
        }
      });
    }
  }
  

  public getWarehouseReceiptCollection = (): CollectionReference => {
    return this.warehouseReceiptCollectionRef;
  }

  public validateIds = (): ValidatorFn => {
    return (formArray: FormArray): ValidationErrors | null => {
      const idArray = formArray.controls.map(formGroup => formGroup.value.id);
      this.warehouseReceiptIdList = idArray;

      const invalid = idArray.some((id, index) => {
        return idArray.indexOf(id) !== index;
      });

      if (invalid) this.openSnackbar("Cannot create group with multiple ID's", true);

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
    this.openSnackbar("Warehouse Receipt Preview Updated");
  }

  public createWarehouseReceipt = (formValues: any, index: number): FormGroup => {
    const group = this.fb.group({
      bushelQuantity: [formValues.bushelQuantity, Validators.required],
      startDate: [formValues.receiptDates, Validators.required],
      id: [
        formValues.startId + index, 
        [Validators.required], 
        [this.uniqueId.validate.bind(this.uniqueId)]
      ],
      plant: [formValues.plant, Validators.required],
      product: [{ value: formValues.product, disabled: true }, Validators.required],
    });

    group.get('id').markAsTouched();
    return group;
  }

  public cancel = (): void => {
    this.openSnackbar("Cancelled New Warehouse Receipt Group");
    this.navController.navigateBack('/dashboard/warehouse-receipts');
  }

  public confirm = async (): Promise<void> => {
    let alert = await this.alertController.create({
      header: "Confirmation",
      message: "Are you sure you would like to submit these Warehouse Receipts?",
      buttons: [
        {
          text: "yes",
          handler: async () => {
            alert.dismiss();
            this.submitWarehouseReceiptGroup();
          }
        },
        {
          text: "no",
          role: 'cancel'
        }
      ]
    });

    alert.present();
  }

  public submitWarehouseReceiptGroup = async (): Promise<void> => {
    const formValues = this.warehouseReceiptGroupForm.getRawValue();

    formValues.warehouseReceiptList.forEach(warehouseReceipt => {
      this.totalBushelQuantity += warehouseReceipt.bushelQuantity;
    });

    let receiptGroup = {
      closeDate: null,
      creationDate: formValues.creationDate,
      expireDate: null,
      purchaseContract: null,
      saleContract: null,
      status: "pending",
      totalBushelQuantity: this.totalBushelQuantity,
      warehouseReceiptIdList: this.warehouseReceiptIdList.sort((a, b) => a - b),
      warehouseReceiptList: formValues.warehouseReceiptList.sort((a, b) => a.id - b.id)
    };

    addDoc(this.warehouseReceiptCollectionRef, receiptGroup).then(() => {
      this.openSnackbar("Warehouse Receipt Group Created");
      this.navController.navigateForward('/dashboard/warehouse-receipts');
    }).catch(error => {
      this.openSnackbar(`Error submitting form: ${error}`, true);
    });
  }

  public openSnackbar = (message: string, error?: boolean) => {
    if (error) {
      this.snackbar.open(message, "Close", { duration: 4000, panelClass: 'snackbar-error' });
      return;
    }
    this.snackbar.open(message, "", { duration: 1500, panelClass: 'snackbar' });
  }
}
