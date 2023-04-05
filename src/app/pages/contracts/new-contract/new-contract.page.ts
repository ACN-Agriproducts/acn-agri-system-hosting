import { Component, OnInit } from '@angular/core';
import { Firestore, doc } from '@angular/fire/firestore';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Contract } from '@shared/classes/contract';

@Component({
  selector: 'app-new-contract',
  templateUrl: './new-contract.page.html',
  styleUrls: ['./new-contract.page.scss'],
})
export class NewContractPage implements OnInit {
  public contract: Contract;
  public focusedFieldName: string;

  constructor(
    private db: Firestore,
    private session: SessionInfo,
  ) { }

  ngOnInit() {
    this.contract = new Contract(
      doc(Contract.getCollectionReference(this.db, this.session.getCompany()))
    )
  }

  // focus(event: any) {
  //   console.log(this.contract);
  // }

  // compareWithProduct(p1, p2){
  //   return p1 && p2? p1.name === p2.name: p1 === p2;
  // }

  // compareWithClient(c1, c2) {
  //   return c1 && c2? c1.id === c2.id: c1 === c2;
  // }

  // public submitForm() {
  //   this.contract.ref = doc(Contract.getCollectionReference(this.db, this.session.getCompany(), this.contract.type)).withConverter(Contract.converter);
  //   this.contract.set()  
  //     .then(() => {
  //       this.navController.navigateForward('dashboard/contracts');
  //     }).catch(error => {
  //       this.snack.open(error, "error");
  //     });
  // }

  // addPlantChip(plant: string): void {
  //   const chosenPlants = this.contract.plants;

  //   if(!this.chipIsChosen(plant)) {
  //     chosenPlants.push(plant);
  //   }
  // }

  // removePlantChip(plant: string) {
  //   const chosenPlants = this.contract.plants as string[];
  //   const index: number = chosenPlants.indexOf(plant);

  //   if(index >= 0) {
  //     chosenPlants.splice(index, 1);
  //   }
  // }

  // chipIsChosen(plant: string) {
  //   const chosenPlants = this.contract.plants as string[];
  //   return chosenPlants.findIndex(p => p == plant) != -1;
  // }

  // private newTruckerGroup(): UntypedFormGroup {
  //   return this.fb.group({
  //     trucker: [,Validators.required],
  //     freight: [,Validators.required]
  //   });
  // }

  // addTruckerGroup(): void {
  //   this.truckerArray.push(this.newTruckerGroup());
  //   this.filteredTruckerOptions.push(this.truckerArray.get([this.truckerArray.length-1, 'trucker']).valueChanges.pipe(
  //     startWith(''), map(value => this._filter(value || ''))
  //   ));
  // }

  // removeTruckerGroup(index: number): void {
  //   this.truckerArray.removeAt(index);
  //   this.filteredTruckerOptions.splice(index, 1);
  // }

  // contractTypeChange() {}

  // _filter(value: string): CompanyContact[] {
  //   const filterValue = value.toLowerCase();
  //   return this.truckerList.filter(trucker => (trucker.name as string).toLowerCase().includes(filterValue));
  // }

  // contractTypeGetter(): string {
  //   return this.contract.type ?? "";
  // }

  // public selectProduct(): void {
  //   this.contract.product = this.chosenProduct.ref.withConverter(Product.converter);
  //   this.contract.productInfo = this.chosenProduct.getProductInfo();
  //   this.recalculateMass();
  // }

  // public recalculateMass(event?: number | units): void {
  //   if (!event) {
  //     this.contract.quantity = new Mass(this.contract.quantity.amount, this.contract.quantity.defaultUnits);
  //   }
  //   else if (typeof event === "number") {
  //     this.contract.quantity = new Mass(event, this.contract.quantity.defaultUnits);
  //   }
  //   else if (typeof event === "string") {
  //     this.contract.quantity = new Mass(this.contract.quantity.amount, event);
  //   }

  //   this.contract.quantity.defineBushels(this.contract.productInfo);
  // }
}
