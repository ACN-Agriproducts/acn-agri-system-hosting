import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ContractInfoPage } from './contract-info.page';

describe('ContractInfoPage', () => {
  let component: ContractInfoPage;
  let fixture: ComponentFixture<ContractInfoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContractInfoPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ContractInfoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
