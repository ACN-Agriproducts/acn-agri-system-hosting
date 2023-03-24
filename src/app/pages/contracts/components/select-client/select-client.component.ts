import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
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

  constructor(
    public dialogRef: MatDialogRef<SelectClientComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any[]
  ) { }

  ngOnInit() {
    this.clientsList = this.data;
  }

  onSearchFieldChange(event) {
    this.clientsList = this.data.filter(client => client.name.toLowerCase().includes(this.searchString.toLowerCase()))
  }
}
