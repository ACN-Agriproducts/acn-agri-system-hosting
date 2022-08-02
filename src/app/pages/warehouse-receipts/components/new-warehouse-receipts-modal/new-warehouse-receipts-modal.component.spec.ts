import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NewWarehouseReceiptsModalComponent } from './new-warehouse-receipts-modal.component';

describe('NewWarehouseReceiptsModalComponent', () => {
  let component: NewWarehouseReceiptsModalComponent;
  let fixture: ComponentFixture<NewWarehouseReceiptsModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NewWarehouseReceiptsModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NewWarehouseReceiptsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
