import { Component, OnInit } from '@angular/core';
import { addDoc, doc, Firestore } from '@angular/fire/firestore';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { ContractSettings } from '@shared/classes/contract-settings';

@Component({
  selector: 'app-contract-settings',
  templateUrl: './contract-settings.page.html',
  styleUrls: ['./contract-settings.page.scss'],
})
export class ContractSettingsPage implements OnInit {
  public settings: ContractSettings;
  public typesList: string[] = [
    "primitive",
    "nested-primitive",
    "client-select",
    "ticket-client-select",
    "primitive-prototype",
    "product-select",
    "date-range",
    "plant-select",
    "third-party-plant",
    "future-month-picker",
    "bank-info",
    "payment-delays",
    "exchange-rate",
  ]

  constructor(
    private db: Firestore,
    private session: SessionInfo,
    private dialog: MatDialog,
    private snack: SnackbarService
  ) { }

  ngOnInit() {
    ContractSettings.getDocument(this.db, this.session.getCompany()).then(result => {
      this.settings = this.generateIfEmpty(result);
    });
  }

  generateIfEmpty(settings: ContractSettings): ContractSettings {
    if(settings.formData) return settings;
    settings.formData = {};
    settings.fieldGroupOrder = {};

    for(const contractName of Object.values(settings.contractTypes)) {
      settings.formData[contractName] = {};
      settings.fieldGroupOrder[contractName] = [];
    }

    return settings;
  }

  addGroup(event: any, contractName: string) {
    event.preventDefault();
    const dialogRef = this.dialog.open(NameDialog);

    dialogRef.afterClosed().subscribe(result => {
      if(!result) return;
      if(!this.settings.formData[contractName]) this.settings.formData[contractName] = {};
      this.settings.formData[contractName][result] = [];
      this.settings.fieldGroupOrder[contractName].push(result);
    });
  }

  addField(contractName: string, groupName: string) {
    this.settings.formData[contractName][groupName].push({
      label: null,
      fieldName: null,
      type: null,
      width: null,
      class: null,
      primitiveType: null,
      selectOptions: [],
      prefix: null,
      suffix: null,
      required: null,
    })
  }

  addSelectOption(contractName: string, groupName: string, fieldIndex: number) {
    this.settings.formData[contractName][groupName][fieldIndex].selectOptions.push({
      value: null,
      label: null
    });
  }

  removeGroup(contractName: string, groupName: string) {
    delete this.settings.formData[contractName][groupName];
    this.settings.fieldGroupOrder[contractName].splice(
      this.settings.fieldGroupOrder[contractName].findIndex(n => n == groupName),
      1
    )
  }

  removeField(contractName: string, groupName: string, fieldIndex: number) {
    this.settings.formData[contractName][groupName].splice(fieldIndex, 1);
  }

  removeSelectOption(contractName: string, groupName: string, fieldIndex: number, optionIndex: number) {
    this.settings.formData[contractName][groupName][fieldIndex].selectOptions.splice(optionIndex, 1);
  }

  moveGroup(contractName: string, groupName: string, fieldIndex: number) {
    const dialogRef = this.dialog.open(MoveGroupDialog);

    dialogRef.afterClosed().subscribe((newIndex:number) => {
      if(!newIndex) return;

      const fieldArray = this.settings.formData[contractName][groupName];
      const group = fieldArray.splice(fieldIndex, 1)[0];
      fieldArray.splice(newIndex, 0, group);
    });
  }

  submit() {
    this.settings.ref = doc(this.settings.ref.parent);
    this.settings.date = new Date();

    this.settings.set().then(() => {
      this.snack.open("Settings submitted", "success");
    }).catch(error => {
      this.snack.open("Error", "error");
      console.error(error);
    });
  }
}

@Component({
  selector: 'group-name-dialog',
  templateUrl: './group-name.dialog.html'
})
export class NameDialog {
  public name: string;

  constructor(
    public dialogRef: MatDialogRef<NameDialog>
  ) {}
}

@Component({
  selector: 'move-group-dialog',
  templateUrl: './move-group.dialog.html'
})
export class MoveGroupDialog {
  public index: number;

  constructor() {}
}