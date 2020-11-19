import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class LoginPage implements OnInit, OnDestroy {

  constructor(
    private cd: ChangeDetectorRef,
  ) { }

  ngOnDestroy(): void {
    this.cd.markForCheck();
  }

  ngOnInit() {
    this.cd.markForCheck();
  }

}
