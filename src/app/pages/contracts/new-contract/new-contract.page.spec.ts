import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NewContractPage } from './new-contract.page';

describe('NewContractPage', () => {
  let component: NewContractPage;
  let fixture: ComponentFixture<NewContractPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewContractPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NewContractPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
