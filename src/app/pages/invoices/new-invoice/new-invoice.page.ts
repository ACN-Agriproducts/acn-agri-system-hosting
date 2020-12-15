import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-new-invoice',
  templateUrl: './new-invoice.page.html',
  styleUrls: ['./new-invoice.page.scss'],
})
export class NewInvoicePage implements OnInit {

  public product: string;
  public list = [];
  private contador = 1;
  public arraryForm = [];
  constructor() { }

  ngOnInit() {
    this.add();
  }
  public add = () => {
    this.arraryForm.push(this.contador);
    this.contador = this.contador + 1;
  }
  public remove = () => {
    this.arraryForm.splice(1, 1);
    this.contador = this.contador - 1;
  }

  public active = (item, index: number) => {
    this.product = 'yellow corn';
    const active = document.querySelector('.item-' + item + '.active-card');
    const element = document.querySelector('.item-' + item);
    if (active === null) {
      element.classList.add('active-card');
      this.list.push('177' + item);
    } else {
      console.log(index);
      element.classList.remove('active-card');
      this.list.splice(index , 1);
      console.log(this.list);
    }

  }
}
