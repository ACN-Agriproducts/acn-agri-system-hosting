import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TableHeaderUnitSelectComponent } from './unit-select.component';

describe('TableHeaderUnitSelectComponent', () => {
  let component: TableHeaderUnitSelectComponent;
  let fixture: ComponentFixture<TableHeaderUnitSelectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TableHeaderUnitSelectComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TableHeaderUnitSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
