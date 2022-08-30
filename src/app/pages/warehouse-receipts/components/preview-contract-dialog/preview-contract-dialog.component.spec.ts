import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PreviewContractDialogComponent } from './preview-contract-dialog.component';

describe('PreviewContractDialogComponent', () => {
  let component: PreviewContractDialogComponent;
  let fixture: ComponentFixture<PreviewContractDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PreviewContractDialogComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PreviewContractDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
