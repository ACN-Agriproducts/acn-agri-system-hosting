import { Component, Inject, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { Contact } from '@shared/classes/contact';
import { Plant } from '@shared/classes/plant';

@Component({
  selector: 'app-trucker-fields.dialog',
  templateUrl: './trucker-fields.dialog.html',
  styleUrls: ['./trucker-fields.dialog.scss'],
})
export class TruckerFieldsDialog implements OnInit {
  plants$: Promise<Plant[]>;
  submitting: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public contact: Contact,
    private db: Firestore,
    private session: SessionInfo,
    private snack: SnackbarService
  ) { }

  ngOnInit() {
    this.contact.destinations ??= [];
    this.plants$ = Plant.getPlantList(this.db, this.session.getCompany());
    this.submitting = false;
  }

  remove(index: number) {
    this.contact.destinations.splice(index, 1);
  }

  newDestination() {
    this.contact.destinations.push("");
  }

  trackIndex(index: number, obj: any): any {
    return index;
  }

  submit() {
    this.submitting = true;
    this.contact.update({
      destinations: this.contact.destinations
    }).then(() => {
      this.snack.open('Successfully submitted', 'success');
    }).catch(error => {
      console.error(error);
      this.submitting = false;
      this.snack.open('Error uploading info', 'error');
    });
  }
}
