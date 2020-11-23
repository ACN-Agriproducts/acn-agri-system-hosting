import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabletAuxComponent } from './tablet-aux.component';

describe('TabletAuxComponent', () => {
  let component: TabletAuxComponent;
  let fixture: ComponentFixture<TabletAuxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TabletAuxComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TabletAuxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
