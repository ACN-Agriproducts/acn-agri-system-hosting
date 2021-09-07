import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TruckerTableComponent } from './trucker-table.component';

describe('TruckerTableComponent', () => {
  let component: TruckerTableComponent;
  let fixture: ComponentFixture<TruckerTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TruckerTableComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TruckerTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
