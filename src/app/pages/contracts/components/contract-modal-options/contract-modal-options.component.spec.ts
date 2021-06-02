import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ContractModalOptionsComponent } from './contract-modal-options.component';

describe('ContractModalOptionsComponent', () => {
  let component: ContractModalOptionsComponent;
  let fixture: ComponentFixture<ContractModalOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContractModalOptionsComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ContractModalOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
