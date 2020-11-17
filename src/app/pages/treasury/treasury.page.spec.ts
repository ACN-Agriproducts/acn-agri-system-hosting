import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TreasuryPage } from './treasury.page';

describe('TreasuryPage', () => {
  let component: TreasuryPage;
  let fixture: ComponentFixture<TreasuryPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreasuryPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TreasuryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
