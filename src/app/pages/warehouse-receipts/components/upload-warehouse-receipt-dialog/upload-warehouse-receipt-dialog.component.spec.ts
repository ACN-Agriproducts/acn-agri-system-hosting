import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { UploadWarehouseReceiptDialogComponent } from './upload-warehouse-receipt-dialog.component';

describe('UploadWarehouseReceiptDialogComponent', () => {
  let component: UploadWarehouseReceiptDialogComponent;
  let fixture: ComponentFixture<UploadWarehouseReceiptDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadWarehouseReceiptDialogComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(UploadWarehouseReceiptDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
