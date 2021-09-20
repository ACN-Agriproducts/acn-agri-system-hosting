import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ItemFixesPage } from './item-fixes.page';

describe('ItemFixesPage', () => {
  let component: ItemFixesPage;
  let fixture: ComponentFixture<ItemFixesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemFixesPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemFixesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
