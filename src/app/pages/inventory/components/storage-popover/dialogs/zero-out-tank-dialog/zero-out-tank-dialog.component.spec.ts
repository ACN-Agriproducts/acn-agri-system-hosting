import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ZeroOutTankDialogComponent } from './zero-out-tank-dialog.component';

describe('ZeroOutTankDialogComponent', () => {
  let component: ZeroOutTankDialogComponent;
  let fixture: ComponentFixture<ZeroOutTankDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ZeroOutTankDialogComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ZeroOutTankDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
