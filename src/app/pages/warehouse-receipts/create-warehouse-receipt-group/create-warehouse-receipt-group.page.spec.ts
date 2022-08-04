import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CreateWarehouseReceiptGroupPage } from './create-warehouse-receipt-group.page';

describe('CreateWarehouseReceiptGroupPage', () => {
  let component: CreateWarehouseReceiptGroupPage;
  let fixture: ComponentFixture<CreateWarehouseReceiptGroupPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateWarehouseReceiptGroupPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateWarehouseReceiptGroupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
