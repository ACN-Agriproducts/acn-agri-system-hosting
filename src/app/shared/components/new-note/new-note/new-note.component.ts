import { Component, Inject, OnInit } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { Note } from '@shared/classes/note';

@Component({
  selector: 'app-new-note',
  templateUrl: './new-note.component.html',
  styleUrls: ['./new-note.component.scss'],
})
export class NewNoteComponent implements OnInit {

  constructor(
    @Inject(MAT_LEGACY_DIALOG_DATA) public data: Note
  ) { }

  ngOnInit() {}

}
