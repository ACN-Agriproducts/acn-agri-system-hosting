import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { WarehouseReceiptStatusPopoverComponent } from './warehouse-receipt-status-popover.component';

describe('WarehouseReceiptStatusPopoverComponent', () => {
  let component: WarehouseReceiptStatusPopoverComponent;
  let fixture: ComponentFixture<WarehouseReceiptStatusPopoverComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WarehouseReceiptStatusPopoverComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(WarehouseReceiptStatusPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
