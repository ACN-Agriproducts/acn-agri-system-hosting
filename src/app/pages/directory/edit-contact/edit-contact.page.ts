import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-edit-contact',
  templateUrl: './edit-contact.page.html',
  styleUrls: ['./edit-contact.page.scss'],
})
export class EditContactPage implements OnInit {

  public id: string;
  public currentCompany: string;
  public contactForm: FormGroup

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private db: AngularFirestore,
    private localStorage: Storage,
    private navController: NavController
  ) { }

  async ngOnInit() {
    this.currentCompany = await this.localStorage.get('currentCompany');
    this.id = this.route.snapshot.paramMap.get('id');

    let doc = (await this.db.doc(`companies/${this.currentCompany}/directory/${this.id}`).get().toPromise()).data();

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

    this.contactForm.get('name').setValue(doc['name']);
    this.contactForm.get('streetAddress').setValue(doc['streetAddress']);
    this.contactForm.get('city').setValue(doc['city']);
    this.contactForm.get('state').setValue(doc['state']);
    this.contactForm.get('zipCode').setValue(doc['zipCode']);
    this.contactForm.get('phoneNumber').setValue(doc['phoneNumber']);
    this.contactForm.get('email').setValue(doc['email']);
    this.contactForm.get('caat').setValue(doc['caat']);
    this.contactForm.get('type').setValue(doc['type']);
  }

  submitButton() {
    this.db.doc(`companies/${this.currentCompany}/directory/${this.id}`).update(this.contactForm.getRawValue()).then(() => {
      this.navController.navigateForward('dashboard/directory');
    });

  }
}
