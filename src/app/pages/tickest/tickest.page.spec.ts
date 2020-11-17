import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TickestPage } from './tickest.page';

describe('TickestPage', () => {
  let component: TickestPage;
  let fixture: ComponentFixture<TickestPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TickestPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TickestPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
