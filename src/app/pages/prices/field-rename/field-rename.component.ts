import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-field-rename',
  templateUrl: './field-rename.component.html',
  styleUrls: ['./field-rename.component.scss'],
})
export class FieldRenameComponent implements OnInit {
  public name: string = "";

  constructor() { }

  ngOnInit() {}

}
