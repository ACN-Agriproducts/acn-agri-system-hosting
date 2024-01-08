import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ContractDialogComponent } from './contract-dialog.component';

describe('ContractDialogComponent', () => {
  let component: ContractDialogComponent;
  let fixture: ComponentFixture<ContractDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ContractDialogComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ContractDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
