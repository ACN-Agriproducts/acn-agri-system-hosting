import { Directive, ElementRef, Renderer2, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[appScaleToFit]'
})
export class ScaleToFitDirective implements AfterViewInit{

  constructor(
    private renderer: Renderer2,
    private el: ElementRef
  ) { }

  ngAfterViewInit(): void {
    this.rescale();   
    window.onresize = this.rescale;
  }

  rescale = () => {
    const wrapperWidth = this.el.nativeElement.parentNode.clientWidth;
    const elementWidth = this.el.nativeElement.clientWidth;

    const scale = wrapperWidth / elementWidth;
    this.renderer.setStyle(this.el.nativeElement, 'transform', `scale(${scale})`);
  }

}
