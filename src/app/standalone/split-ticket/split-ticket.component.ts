import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CoreModule } from '@core/core.module';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-split-ticket',
  templateUrl: './split-ticket.component.html',
  styleUrls: ['./split-ticket.component.scss'],
  standalone: true,
  imports: [
    CoreModule,
    CommonModule,
    IonicModule
  ]
})
export class SplitTicketComponent implements OnInit {

  constructor() { }

  ngOnInit() {}

}
