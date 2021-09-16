import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';


@Component({
  selector: 'app-new-contact',
  templateUrl: './new-contact.page.html',
  styleUrls: ['./new-contact.page.scss'],
})
export class NewContactPage implements OnInit {

  contactForm: FormGroup;
  currentCompany: String;

  constructor(
    private fb: FormBuilder,
    private store: AngularFirestore,
    private navController: NavController,
    private localStore: Storage
  ) { }

  ngOnInit() {
    this.contactForm = this.fb.group({
      name: ['',[Validators.required, Validators.minLength(2)]],
      streetAddress: [''],
      city: [''],
      state: [''],
      zipCode: [''],
      phoneNumber: [''],
      email: [''],
      caat: [''],
      type: ['', Validators.required]
    })

    this.localStore.get('currentCompany').then(val => this.currentCompany = val);
  }

  public submitModal(){
    this.store.collection(`companies/${this.currentCompany}/directory`).add(this.contactForm.getRawValue());
    this.navController.navigateForward('dashboard/directory')
  }
}
