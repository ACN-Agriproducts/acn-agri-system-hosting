import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Contact } from '@shared/classes/contact';
import { CompanyContact } from '@shared/classes/company';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-select-client',
  templateUrl: './select-client.component.html',
  styleUrls: ['./select-client.component.scss'],
})
export class SelectClientComponent implements OnInit {
  public clientSelected: Contact;
  public clientsList: CompanyContact[];
  public searchString: string;
  public canCreateUser: boolean;

  @ViewChild(CdkVirtualScrollViewport) view: CdkVirtualScrollViewport;

  constructor(
    public dialogRef: MatDialogRef<SelectClientComponent>,
    public session: SessionInfo,
    @Inject(MAT_DIALOG_DATA) public data: CompanyContact[]
  ) { }

  ngOnInit() {
    this.clientsList = this.data;
    
    const permissions = this.session.getPermissions();
    this.canCreateUser = permissions.admin || permissions.directory?.addContact;
    setTimeout(() => this.view.checkViewportSize(), 1000)
  }

  onSearchFieldChange(event) {
    this.clientsList = this.data.filter(client => client.name.toLowerCase().includes(this.searchString.toLowerCase()))
  }
}
