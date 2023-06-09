import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-card-button',
  templateUrl: './card-button.component.html',
  styleUrls: ['./card-button.component.scss'],
})
export class CardButtonComponent implements OnInit {
  @Input() icon: string;
  @Input() name: string;
  @Input() callback: () => void = () => {console.log("pressed")}

  constructor() { }

  ngOnInit() {}

}
