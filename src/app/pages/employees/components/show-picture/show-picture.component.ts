import { MediaMatcher } from '@angular/cdk/layout';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-show-picture',
  templateUrl: './show-picture.component.html',
  styleUrls: ['./show-picture.component.scss']
})
export class ShowPictureComponent implements OnInit {
  public picture: string;
  @Input() private pictureMovil: string;
  constructor(
    private mediaMatcher: MediaMatcher,
    @Inject(MAT_DIALOG_DATA) public pictureCompu,
  ) {
  }

  ngOnInit(): void {
    const mediaScreen = this.mediaMatcher.matchMedia('(max-width: 768px)');
    this.picture = mediaScreen.matches ? this.pictureMovil : this.pictureCompu;
  }

}
