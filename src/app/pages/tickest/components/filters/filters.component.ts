import { ModalController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss']
})
export class FiltersComponent implements OnInit {

  constructor(
    private modalController: ModalController,
  ) { }

  ngOnInit(): void {
  }
  public closeModal = () => {
    this.modalController.dismiss();
  }

}
