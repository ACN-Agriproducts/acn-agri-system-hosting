import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {
  public inputDateContract = new FormGroup({
    start: new FormControl('', Validators.required),
    end: new FormControl('', Validators.required),
  });
  public inputPeriod = new FormGroup({
    start: new FormControl('', Validators.required),
    end: new FormControl('', Validators.required),
  });
  constructor() { }

  ngOnInit(): void {
  }

  public accept = () => {
    if (this.inputDateContract.valid || this.inputPeriod.valid) {
      console.log(this.inputDateContract.value);
      console.log(this.inputPeriod.value);
    } else {
      this.inputDateContract.markAllAsTouched();
      this.inputPeriod.markAllAsTouched();
    }

  }
}
