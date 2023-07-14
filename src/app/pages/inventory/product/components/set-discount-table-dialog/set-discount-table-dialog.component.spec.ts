import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SetDiscountTableDialogComponent } from './set-discount-table-dialog.component';

describe('SetDiscountTableDialogComponent', () => {
  let component: SetDiscountTableDialogComponent;
  let fixture: ComponentFixture<SetDiscountTableDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SetDiscountTableDialogComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SetDiscountTableDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
