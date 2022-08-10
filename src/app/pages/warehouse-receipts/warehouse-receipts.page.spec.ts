import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { WarehouseReceiptsPage } from './warehouse-receipts.page';

describe('WarehouseReceiptsPage', () => {
  let component: WarehouseReceiptsPage;
  let fixture: ComponentFixture<WarehouseReceiptsPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WarehouseReceiptsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(WarehouseReceiptsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
