import { Component } from '@angular/core';
import { ViewController, Platform, ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { GeochronUtility } from '../../utilities/GeochronUtility';

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class Profile {

  username: string = "";
  password: string = "";
  loggedIn: boolean = false;
  loggingIn: boolean = true;
  loggingOut: boolean = false;

  constructor(public viewCtrl: ViewController, public platform: Platform, private storage: Storage, private geochron: GeochronUtility, public toastCtrl: ToastController) {
    this.platform.ready().then(() => {
      this.storage.get('loggedIn').then((value) => {
        this.loggingIn = false;
        this.loggedIn = value !== null && value;
        if (this.loggedIn) {
          this.storage.get('geochronUsername').then((user: string) => {
            if (user)
              this.username = user;
          });
          this.storage.get('geochronPassword').then((pass: string) => {
            if (pass)
              this.password = pass;
          });
        }
      });
    });
  }

  login() {
    this.loggingIn = true;
    let user = this.username;
    let pass = this.password;
    this.geochron.validateCredentials(user, pass)
      .subscribe((valid: boolean) => {
        this.loggingIn = false;
        if (valid)
          this.geochron.saveCurrentUser(user, pass).subscribe(
            _ => this.loggingIn = false,
            _ => this.loggingIn = false,
            () => {
              this.loggingIn = false;
              this.loggedIn = true;
              this.displayToast('Successfully logged into Geochron as ' + user);
            });
        else
          this.displayToast('Could not log in, invalid Geochron credentials');
      });
  }

  logout() {
    this.loggingOut = true;
    this.storage.set('loggedIn', false).then(() => {
      this.loggedIn = false;
      this.loggingOut = false;
    });
  }

  displayToast(text: string) {
    this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'bottom',
      cssClass: 'text-center'
    }).present();
  }

}
