import { Component, OnInit } from '@angular/core';
import { addDoc, CollectionReference, Firestore, serverTimestamp } from '@angular/fire/firestore';
import { FormGroup, FormBuilder, Validators, FormArray, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { AlertController, NavController } from '@ionic/angular';
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
  public totalBushelQuantity: number = 0;
  public warehouseReceiptCollectionRef: CollectionReference;
  public warehouseReceiptGroupForm: FormGroup;
  public warehouseReceiptIdList: number[];

  constructor(
    private alertController: AlertController,
    private db: Firestore,
    private fb: FormBuilder,
    private navController: NavController,
    private session: SessionInfo,
    private snack: SnackbarService,
    private uniqueId: UniqueWarehouseReceiptIdService,
  ) { }

  ngOnInit() {
    this.currentCompany = this.session.getCompany();
    this.warehouseReceiptCollectionRef = WarehouseReceiptGroup.getWrCollectionReference(this.db, this.currentCompany).withConverter(null);
    
    Plant.getPlantList(this.db, this.currentCompany)
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
      createdAt: [new Date()],
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

      if (invalid) this.snack.openSnackbar("Cannot create group with multiple ID's", 'warn');

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
    this.snack.openSnackbar("Warehouse Receipt Preview Updated", 'info');
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
    this.snack.openSnackbar("Cancelled New Warehouse Receipt Group", 'info');
    this.navController.navigateBack('/dashboard/warehouse-receipts', {
      replaceUrl: true
    });
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
      warehouseReceipt.isPaid = false;
      warehouseReceipt.pdfReference = null;
    });

    let receiptGroup = {
      closedAt: null,
      createdAt: serverTimestamp(),
      expiredAt: null,
      purchaseContract: null,
      saleContract: null,
      status: "PENDING",
      totalBushelQuantity: this.totalBushelQuantity,
      warehouseReceiptIdList: this.warehouseReceiptIdList.sort((a, b) => a - b),
      warehouseReceiptList: formValues.warehouseReceiptList.sort((a, b) => a.startDate.getTime() - b.startDate.getTime()),
    };

    addDoc(this.warehouseReceiptCollectionRef, receiptGroup).then(() => {
      this.snack.openSnackbar("Warehouse Receipt Group Created", 'success');
      this.navController.navigateForward('/dashboard/warehouse-receipts');
    }).catch(error => {
      this.snack.openSnackbar(`Error submitting form: ${error}`, 'error');
    });
  }
}
