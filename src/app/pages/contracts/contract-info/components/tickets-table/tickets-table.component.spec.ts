import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TicketsTableComponent } from './tickets-table.component';

describe('TicketsTableComponent', () => {
  let component: TicketsTableComponent;
  let fixture: ComponentFixture<TicketsTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TicketsTableComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TicketsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
