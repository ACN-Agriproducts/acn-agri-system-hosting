import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NewInvoicePage } from './new-invoice.page';

describe('NewInvoicePage', () => {
  let component: NewInvoicePage;
  let fixture: ComponentFixture<NewInvoicePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewInvoicePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NewInvoicePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
