import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TruckerFieldsDialog } from './trucker-fields.dialog';

describe('TruckerFieldsDialog', () => {
  let component: TruckerFieldsDialog;
  let fixture: ComponentFixture<TruckerFieldsDialog>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TruckerFieldsDialog ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TruckerFieldsDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
