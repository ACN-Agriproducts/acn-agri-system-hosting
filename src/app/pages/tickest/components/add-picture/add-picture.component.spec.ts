import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddPictureComponent } from './add-picture.component';

describe('AddPictureComponent', () => {
  let component: AddPictureComponent;
  let fixture: ComponentFixture<AddPictureComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddPictureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPictureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
