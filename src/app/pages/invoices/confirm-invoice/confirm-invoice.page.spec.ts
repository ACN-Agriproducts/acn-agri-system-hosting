import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ConfirmInvoicePage } from './confirm-invoice.page';

describe('ConfirmInvoicePage', () => {
  let component: ConfirmInvoicePage;
  let fixture: ComponentFixture<ConfirmInvoicePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmInvoicePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmInvoicePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
