import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Contract } from '@shared/classes/contract';
import { Ticket } from '@shared/classes/ticket';

@Component({
  selector: 'app-bachoco-printable',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bachoco-printable.component.html',
  styleUrls: ['./bachoco-printable.component.scss'],
})
export class BachocoPrintableComponent implements OnInit {
  @Input() contract: Contract;
  @Input() tickets: Ticket[];
  public today = new Date();

  constructor() { }

  ngOnInit() {}

}
