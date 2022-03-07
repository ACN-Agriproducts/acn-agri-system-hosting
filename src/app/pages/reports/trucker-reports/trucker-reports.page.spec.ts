import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TruckerReportsPage } from './trucker-reports.page';

describe('TruckerReportsPage', () => {
  let component: TruckerReportsPage;
  let fixture: ComponentFixture<TruckerReportsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TruckerReportsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TruckerReportsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
