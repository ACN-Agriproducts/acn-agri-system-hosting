import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CreateInvoicePage } from './create-invoice.page';

describe('CreateInvoicePage', () => {
  let component: CreateInvoicePage;
  let fixture: ComponentFixture<CreateInvoicePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateInvoicePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateInvoicePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
