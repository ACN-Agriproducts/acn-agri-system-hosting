import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NeedsAdminAttentionComponent } from './needs-admin-attention.component';

describe('NeedsAdminAttentionComponent', () => {
  let component: NeedsAdminAttentionComponent;
  let fixture: ComponentFixture<NeedsAdminAttentionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NeedsAdminAttentionComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NeedsAdminAttentionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
