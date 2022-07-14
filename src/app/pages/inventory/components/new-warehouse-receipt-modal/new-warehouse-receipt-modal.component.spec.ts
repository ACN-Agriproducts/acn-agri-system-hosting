import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NewWarehouseReceiptModalComponent } from './new-warehouse-receipt-modal.component';

describe('NewWarehouseReceiptModalComponent', () => {
  let component: NewWarehouseReceiptModalComponent;
  let fixture: ComponentFixture<NewWarehouseReceiptModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NewWarehouseReceiptModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NewWarehouseReceiptModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
