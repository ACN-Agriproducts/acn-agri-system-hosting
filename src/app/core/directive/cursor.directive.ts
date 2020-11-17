import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[cursor]'
})
export class CursorDirective {
  @Input() type = 'primero';
  constructor(private el?: ElementRef) {
    this.el.nativeElement.style.cursor = 'pointer';
  }

}
