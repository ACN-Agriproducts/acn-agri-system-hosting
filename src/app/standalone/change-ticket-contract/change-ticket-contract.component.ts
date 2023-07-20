import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CoreModule } from '@core/core.module';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-change-ticket-contract',
  templateUrl: './change-ticket-contract.component.html',
  styleUrls: ['./change-ticket-contract.component.scss'],
  standalone: true,
  imports: [
    CoreModule,
    CommonModule,
    IonicModule,
    FormsModule,
  ]
})
export class ChangeTicketContractComponent implements OnInit {

  constructor() { }

  ngOnInit() {}

}
