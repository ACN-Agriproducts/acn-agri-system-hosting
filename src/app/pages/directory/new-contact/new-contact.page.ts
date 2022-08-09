import { Component, OnInit } from '@angular/core';
import { addDoc, Firestore } from '@angular/fire/firestore';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Contact } from '@shared/classes/contact';


@Component({
  selector: 'app-new-contact',
  templateUrl: './new-contact.page.html',
  styleUrls: ['./new-contact.page.scss'],
})
export class NewContactPage implements OnInit {

  contactForm: UntypedFormGroup;
  currentCompany: string;

  constructor(
    private fb: UntypedFormBuilder,
    private db: Firestore,
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
    addDoc(Contact.getCollectionReference(this.db, this.currentCompany), this.contactForm.getRawValue())
    this.navController.navigateForward('dashboard/directory');
  }
}
