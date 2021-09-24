import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-storage-popover',
  templateUrl: './storage-popover.component.html',
  styleUrls: ['./storage-popover.component.scss'],
})
export class StoragePopoverComponent implements OnInit {
  @Input() currentCompany: string;
  @Input() currentPlant: string;
  @Input() storageId: number;

  constructor(private dialog: MatDialog) { }

  ngOnInit() {}

  public moveInvButton(event: any){
    
  }

  public editInvButton(event: any) {

  }

  public zeroOutButton(event: any) {

  }
}
