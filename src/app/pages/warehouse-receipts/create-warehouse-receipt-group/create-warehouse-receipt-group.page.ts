import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Plant } from '@shared/classes/plant';
import { Product } from '@shared/classes/product';
import { WarehouseReceiptGroup } from '@shared/classes/WarehouseReceiptGroup';
import { UniqueWarehouseReceiptIdService } from '../components/unique-warehouse-receipt-id/unique-warehouse-receipt-id.service';

@Component({
  selector: 'app-create-warehouse-receipt-group',
  templateUrl: './create-warehouse-receipt-group.page.html',
  styleUrls: ['./create-warehouse-receipt-group.page.scss'],
})
export class CreateWarehouseReceiptGroupPage implements OnInit {
  public warehouseReceiptGroupForm: FormGroup;
  public warehouseReceiptCollectionRef: AngularFirestoreCollection;
  public currentCompany: string;
  public plantList: string[];
  public productList: string[];


  constructor(
    private db: AngularFirestore,
    private fb: FormBuilder,
    private localStorage: Storage,
    private navController: NavController,
    private uniqueId: UniqueWarehouseReceiptIdService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    // to be able to receive data from another page
    /* this.route.queryParams.subscribe(params => {
      this.currentCompany = params['currentCompany'];
    }) */

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
      startId: ['', [Validators.required], this.uniqueId.validate.bind(this.uniqueId)],
      plant: ['', Validators.required],
      product: ['', Validators.required],
      quantity: [1, Validators.required],
      groupCreationDate: [new Date(), Validators.required],
      warehouseReceiptList: this.fb.array([])
    });
  }

  public createWarehouseReceipt = (): FormGroup => {
    return this.fb.group({
      id: [, Validators.required],
      plant: [],
      product: [],
      date: [],
      bushelQuantity: [],
    });
  }

  public addWarehouseReceipts = () => {
    const warehouseReceiptList = this.warehouseReceiptGroupForm.get('warehouseReceiptList') as FormArray;


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
