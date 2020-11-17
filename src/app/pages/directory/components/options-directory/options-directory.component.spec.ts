import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OptionsDirectoryComponent } from './options-directory.component';

describe('OptionsDirectoryComponent', () => {
  let component: OptionsDirectoryComponent;
  let fixture: ComponentFixture<OptionsDirectoryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OptionsDirectoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OptionsDirectoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
