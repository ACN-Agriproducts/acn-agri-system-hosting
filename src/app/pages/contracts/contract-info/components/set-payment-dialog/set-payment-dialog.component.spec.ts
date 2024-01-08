import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SetPaymentDialogComponent } from './set-payment-dialog.component';

describe('SetPaymentDialogComponent', () => {
  let component: SetPaymentDialogComponent;
  let fixture: ComponentFixture<SetPaymentDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SetPaymentDialogComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SetPaymentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
