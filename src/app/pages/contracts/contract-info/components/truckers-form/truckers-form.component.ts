import { Component, OnInit, Input } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { Company, CompanyContact } from '@shared/classes/company';
import { Contact } from '@shared/classes/contact';
import { Contract, TruckerInfo } from '@shared/classes/contract';
import { map, Observable, startWith } from 'rxjs';

@Component({
  selector: 'app-truckers-form',
  templateUrl: './truckers-form.component.html',
  styleUrls: ['./truckers-form.component.scss'],
})
export class TruckersFormComponent implements OnInit {
  @Input() contract: Contract;
  public contactList: CompanyContact[];
  public truckerForm: FormArray;
  public submitting: boolean;

  filteredTruckerOptions: Observable<CompanyContact[]>[] = [];

  constructor(
    private fb: FormBuilder,
    private session: SessionInfo,
    private db: Firestore,
    private snack: SnackbarService
    ) { }

  ngOnInit() {
    Company.getCompany(this.db, this.session.getCompany()).then(company => {
      this.contactList = company.contactList.filter(c => !c.isClient).sort((a, b) =>{
        var nameA = a.name.toUpperCase()
        var nameB = b.name.toUpperCase()

        if(nameA < nameB){
          return -1;
        }
        if(nameA > nameB){
          return 1;
        }

        return 0;
      });
      this.truckerForm = this.fb.array(this.getAllTruckerGroups(this.contract.truckers));
    });

    this.submitting = false;
  }

  private newTruckerGroup(): FormGroup {
    return this.fb.group({
      trucker: ['', [Validators.required, this.truckerInListValidator()]],
      freight: [0, Validators.required]
    });
  }

  public addTruckerGroup(): void {
    const truckerGroup = this.newTruckerGroup();
    this.truckerForm.push(truckerGroup);
    this.filteredTruckerOptions.push(truckerGroup.get('trucker').valueChanges.pipe(
      startWith(''), map((value: string) => this._filter(value || ''))
    ));
  }

  public getAllTruckerGroups(truckers: TruckerInfo[]): FormGroup[] {
    return truckers.map(t => {
      const truckerGroup = this.fb.group({
        trucker: [this.contactList.find(c => c.id == t.trucker.id).name, [Validators.required, this.truckerInListValidator()], ],
        freight: [t.freight, Validators.required]
      });
      this.filteredTruckerOptions.push(truckerGroup.get('trucker').valueChanges.pipe(
        startWith(''), map((value: string) => this._filter(value || ''))
      ));

      return truckerGroup;
    });
  }
  
  _filter(value: string): CompanyContact[] {
    const filterValue = value.toLowerCase();
    return this.contactList.filter(trucker => trucker.name.toLowerCase().includes(filterValue));
  }

  truckerInListValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const isInList = this.contactList.some(c => control.value == c.name);
      return isInList? null : {noInList: control.value};
    }
  }

  submit(): void {
    const truckers = this.truckerForm.getRawValue().map(t => {
      const truckerID = this.contactList.find(c => t.trucker == c.name).id;
      t.trucker = Contact.getDocReference(this.db, this.session.getCompany(), truckerID);
      return t;
    });

    this.submitting = true;
    this.contract.update({truckers}).then(() => {
      this.truckerForm.markAsPristine();
      this.submitting = false;
      this.snack.openSnackbar("Truckers saved", "success");
    });
  }
}
