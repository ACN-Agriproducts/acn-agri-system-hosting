import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CloseContractFieldsDialogComponent } from './close-contract-fields-dialog.component';

describe('CloseContractFieldsDialogComponent', () => {
  let component: CloseContractFieldsDialogComponent;
  let fixture: ComponentFixture<CloseContractFieldsDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CloseContractFieldsDialogComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CloseContractFieldsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
