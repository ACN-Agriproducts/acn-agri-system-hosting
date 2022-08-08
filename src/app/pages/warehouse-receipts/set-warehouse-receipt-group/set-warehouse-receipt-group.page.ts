import { Component, OnInit } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/compat/firestore';
import { FormGroup, FormBuilder, Validators, FormArray, ValidationErrors, ValidatorFn } from '@angular/forms';
import { NavController } from '@ionic/angular';
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
  public warehouseReceiptGroupForm: FormGroup;
  public warehouseReceiptCollectionRef: AngularFirestoreCollection;
  public currentCompany: string;
  public plantList: string[];
  public productList: string[];
  public addingWarehouseReceipts: boolean = false;

  constructor(
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
      this.warehouseReceiptCollectionRef = this.db.collection(WarehouseReceiptGroup.getCollectionReference(this.db, company));
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
      groupCreationDate: [new Date()],
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

  public validateIds = (): ValidatorFn  => {
    return (formArray: FormArray): ValidationErrors | null => {
      const idArray = formArray.controls.map(formGroup => formGroup.value.id);

      console.log(idArray);
      const invalid = idArray.some((id, index) => {
        return idArray.indexOf(id) !== index;
      });
      console.log(invalid);

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
    return this.fb.group({
      bushelQuantity: [formValues.bushelQuantity, Validators.required],
      date: [formValues.groupCreationDate, Validators.required],
      id: [
        formValues.startId + index, 
        [Validators.required], 
        this.uniqueId.validate.bind(this.uniqueId)
      ],
      plant: [formValues.plant, Validators.required],
      product: [formValues.product, Validators.required],
    });
  }

  public cancel = (): void => {
    this.navController.navigateBack('/dashboard/warehouse-receipts');
  }

  public confirm = () => {
    
    return;
  }

  public getWarehouseReceiptCollection = (): [AngularFirestoreCollection, number] => {
    return [this.warehouseReceiptCollectionRef, this.warehouseReceiptGroupForm.get('quantity').value];
  }
}
