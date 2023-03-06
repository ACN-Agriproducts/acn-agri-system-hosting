import { Component, EventEmitter, Input, OnInit, Output, QueryList, TemplateRef, ViewChildren } from '@angular/core';
import { Contract } from '@shared/classes/contract';
import { TypeTemplateDirective } from '@shared/directives/type-template/type-template.directive';
import { BehaviorSubject, filter, map, Observable } from 'rxjs';

@Component({
  selector: 'app-printable-contract',
  templateUrl: './printable-contract.component.html',
  styleUrls: ['./printable-contract.component.scss'],
})
export class PrintableContractComponent implements OnInit {
  @ViewChildren(TypeTemplateDirective) private versionTemplates: QueryList<TypeTemplateDirective>;

  @Input("version") set version(newVersion: string) {
    this.version$.next(newVersion);
  }
  @Input() contract: Contract;

  @Output() contractTypesListEmitter = new EventEmitter<Map<string, string>>();

  public version$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  public template$: Observable<TemplateRef<any>> = this.version$.pipe(
    filter(() => !!this.versionTemplates),
    map(version => this.versionTemplates.find(template => template.typeTemplate === (version ?? this.contract.type))?.templateRef)
  );

  constructor() { }

  ngOnInit() {
    this.contractTypesListEmitter.emit(
      new Map([ 
        ["Compra a Deposito", "compra_aDeposito"],
        ["Compra Bodega Terceros", "compra_bodegaTerceros"],
        ["Compra Precio Fijo", "compra_precioFijo"],
        ["Compra Precio sin Fijar", "compra_precioSinFijar"],
        ["Venta Precio Fijo", "deVenta_precioFijo"],
        ["Venta Precio Sin Fijar", "deVenta_precioSinFijar"],
        ["Sales Contract", "sellContract"],
      ])
    );
  }

  ngAfterViewInit() {
    this.version$.next(this.version$.getValue());
    this.template$.subscribe(val => console.log(val))
  }

}
