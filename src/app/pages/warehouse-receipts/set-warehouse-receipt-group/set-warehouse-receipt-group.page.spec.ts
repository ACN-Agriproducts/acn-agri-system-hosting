import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SetWarehouseReceiptGroupPage } from './set-warehouse-receipt-group.page';

describe('SetWarehouseReceiptGroupPage', () => {
  let component: SetWarehouseReceiptGroupPage;
  let fixture: ComponentFixture<SetWarehouseReceiptGroupPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SetWarehouseReceiptGroupPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SetWarehouseReceiptGroupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
