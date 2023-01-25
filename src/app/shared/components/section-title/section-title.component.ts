import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-section-title',
  templateUrl: './section-title.component.html',
  styleUrls: ['./section-title.component.scss'],
})
export class SectionTitleComponent implements OnInit {
  @Input() title: string;
  @Input() prefixButtons: ButtonInfo[];
  @Input() suffixButtons: ButtonInfo[];

  constructor() { }

  ngOnInit() {}

}

export class ButtonInfo {
  icon: string;
  onClick: () => void;
}
