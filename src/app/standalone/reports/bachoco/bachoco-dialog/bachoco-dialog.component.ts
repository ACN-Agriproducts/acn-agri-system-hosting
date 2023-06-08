import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CoreModule } from '@core/core.module';

@Component({
  selector: 'app-bachoco-dialog',
  standalone: true,
  imports: [CommonModule, CoreModule],
  templateUrl: './bachoco-dialog.component.html',
  styleUrls: ['./bachoco-dialog.component.scss'],
})
export class BachocoDialogComponent implements OnInit {

  constructor() { }

  ngOnInit() {}

}
