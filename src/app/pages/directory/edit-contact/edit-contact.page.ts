import { Component, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Contact } from '@shared/classes/contact';

@Component({
  selector: 'app-edit-contact',
  templateUrl: './edit-contact.page.html',
  styleUrls: ['./edit-contact.page.scss'],
})
export class EditContactPage implements OnInit {

  public id: string;
  public currentCompany: string;
  public contactForm: UntypedFormGroup;
  public doc: Contact;

  constructor(
    private fb: UntypedFormBuilder,
    private route: ActivatedRoute,
    private db: Firestore,
    private localStorage: Storage,
    private navController: NavController
  ) { 
    this.localStorage.get('currentCompany').then(val => {
      this.currentCompany = val;

      Contact.getDoc(this.db, this.currentCompany, this.id).then(contact => {
        this.doc = contact;
        this.setForm();
      })
    });
    this.id = this.route.snapshot.paramMap.get('id');


  }

  async ngOnInit() {
    if(this.contactForm == null) {
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
    }
  }

  private setForm() {
    if(this.contactForm == null) {
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
    }

    this.contactForm.get('name').setValue(this.doc['name']);
    this.contactForm.get('streetAddress').setValue(this.doc['streetAddress']);
    this.contactForm.get('city').setValue(this.doc['city']);
    this.contactForm.get('state').setValue(this.doc['state']);
    this.contactForm.get('zipCode').setValue(this.doc['zipCode']);
    this.contactForm.get('phoneNumber').setValue(this.doc['phoneNumber']);
    this.contactForm.get('email').setValue(this.doc['email']);
    this.contactForm.get('caat').setValue(this.doc['caat']);
    this.contactForm.get('type').setValue(this.doc['type']);

  }

  submitButton() {
    this.doc.update(this.contactForm.getRawValue()).then(() => {
      this.navController.navigateForward('dashboard/directory');
    });

  }
}
