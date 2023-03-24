import { Component, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { ContractSettings } from '@shared/classes/contract-settings';

@Component({
  selector: 'app-contract-settings',
  templateUrl: './contract-settings.page.html',
  styleUrls: ['./contract-settings.page.scss'],
})
export class ContractSettingsPage implements OnInit {
  public settings: ContractSettings;

  constructor(
    private db: Firestore,
    private session: SessionInfo,
    private dialog: MatDialog
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

  addGroup(contractName: string) {
    const dialogRef = this.dialog.open(NameDialog);

    dialogRef.afterClosed().subscribe(result => {
      if(!result) return;
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
      selectOptions: []
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

  submit() {
    this.settings.set();
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
