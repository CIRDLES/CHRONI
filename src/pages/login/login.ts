import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, ViewController } from 'ionic-angular';
import { GeochronUtility } from '../../utilities/GeochronUtility';
import { Storage } from '@ionic/storage';


/**
 * Generated class for the LoginPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

//@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  username: string = "";
  password: string = "";
  loginEnabled: boolean = false;
  loggedIn: boolean = false;
  loggingIn: boolean = false;
  loggingOut: boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, private toastCtrl: ToastController, private geochron: GeochronUtility, private storage: Storage, private viewCtrl: ViewController) {

    this.storage.get('loggedIn').then((val: boolean) => {
      let error = () => {
        this.loggingIn = false;
        this.displayToast('There was an error while logging into GeoChron');
      }
      if (val === true) {
        this.loggingIn = true;
        // attempts to log into GeoChron
        this.storage.get('geochronUsername').then((user: string) => {
          if (user && user !== "") {
            error = () => {
              this.loggingIn = false;
              this.displayToast('There was an error while logging into GeoChron as ' + user);
            }
            this.username = user;
            this.storage.get('geochronPassword').then((pass: string) => {
              if (pass && pass !== "") {
                this.password = pass;
                this.geochron.validateCredentials(user, pass).subscribe((valid: boolean) => {
                  // if credentials are valid, set loggedIn to true
                  if (valid) {
                    this.loggingIn = false;
                    this.loggedIn = valid !== null && valid;
                    this.storage.set('loggedIn', true);
                    this.displayToast('Successfully logged into GeoChron as ' + user, 2000);
                  } else error();
                }, (err) => error());
              } else error();
            }, (err) => error());
          } else error();
        }, (err) => error());
      }
    }, (err) => console.log(err));
  }


  login() {
    this.loggingIn = true;
    let user = this.username;
    let pass = this.password;
    let error = () => {
      this.loggingIn = false;
      this.displayToast('There was an error while logging into GeoChron as ' + user);
    }
    this.geochron.validateCredentials(user, pass)
      .subscribe((valid: boolean) => {
        if (valid) {
          this.geochron.saveCurrentUser(user, pass).subscribe(_ => { }, _ => { },
            () => {
              this.loggingIn = false;
              this.loggedIn = true;
              // this.pages.splice(1, 0, { title: 'My IGSNs', component: MyIGSNsPage });
              this.displayToast('Successfully logged into Geochron as ' + user, 2000);
              this.close();
            });
        } else {
          this.loggingIn = false;
          this.displayToast('Error logging in, invalid Geochron credentials');
        }
      }, (err) => error());
  }

  logout() {
    this.loggingOut = true;
    this.storage.set('loggedIn', false).then(() => {
      this.loggedIn = false;
      this.loggingOut = false;
      // this.pages.splice(1, 1);
      // if (this.nav.getActive().name === "MyIGSNsPage") {
      //   this.openPage(this.pages[0]);
      // }
    });
  }

  displayToast(text: string, duration=4000) {
    this.toastCtrl.create({
      message: text,
      duration: duration,
      position: 'bottom',
      cssClass: 'text-center'
    }).present();
  }

  close() {
    this.viewCtrl.dismiss();
  }

  checkRequiredFields() {
    if(this.username.length == 0 || this.password.length == 0) {
      this.loginEnabled = false;
    } else {
      this.loginEnabled = true;
    }
  }

}
