import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Contact } from '@shared/classes/contact';

@Component({
  selector: 'app-select-client',
  templateUrl: './select-client.component.html',
  styleUrls: ['./select-client.component.scss'],
})
export class SelectClientComponent implements OnInit {
  public clientSelected: Contact;
  public clientsList: Contact[];
  public searchString: string;
  public canCreateUser: boolean;

  constructor(
    public dialogRef: MatDialogRef<SelectClientComponent>,
    public session: SessionInfo,
    @Inject(MAT_DIALOG_DATA) public data: any[]
  ) { }

  ngOnInit() {
    this.clientsList = this.data;
    
    const permissions = this.session.getPermissions();
    this.canCreateUser = permissions.admin || permissions.directory.addContact;
  }

  onSearchFieldChange(event) {
    this.clientsList = this.data.filter(client => client.name.toLowerCase().includes(this.searchString.toLowerCase()))
  }
}
