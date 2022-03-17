import { ModalController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-add-picture',
  templateUrl: './add-picture.component.html',
  styleUrls: ['./add-picture.component.scss']
})
export class AddPictureComponent implements OnInit {
  public files: File[] = [];
  constructor(
    private modalController: ModalController
  ) { }

  ngOnInit(): void {
  }
  onSelect(event) {
    this.files.push(...event.addedFiles);
  }

  onRemove(event) {
    this.files.splice(this.files.indexOf(event), 1);
  }

  public closeModal = (): void => {
    this.modalController.dismiss();
  }
}
