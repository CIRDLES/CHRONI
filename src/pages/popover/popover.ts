import { ViewController, NavController, ModalController, ToastController } from "ionic-angular";
import { Component } from "@angular/core";
import { ThemeableBrowserOptions, ThemeableBrowser, ThemeableBrowserObject } from "@ionic-native/themeable-browser";
import { AboutPage } from "../about/about";
import { StatusBar } from "@ionic-native/status-bar";
import { LoginPage } from "../login/login";
import { Storage } from '@ionic/storage';

@Component({
    templateUrl: 'popover.html'
  })
  export class PopoverPage {
    isLoggedIn: boolean = false;

    constructor(public viewCtrl: ViewController, private navCtrl: NavController, private iab: ThemeableBrowser, private statusBar: StatusBar, private modalCtrl: ModalController, private storage: Storage, private toastCtrl: ToastController) {
      this.storage.get('loggedIn').then((val: boolean) => {
        let error = () => {
          this.isLoggedIn = false;
        }
        if (val === true) {
          this.isLoggedIn = true;
        }
      }, (err) => console.log(err));
    }
  
    helpURL: string = 'http://cirdles.org/projects/chroni/#Procedures';
    browser: ThemeableBrowserObject;
    hasOverlay: boolean = false;

    close() {
      this.viewCtrl.dismiss();
    }

    openAbout() {
      this.navCtrl.push(AboutPage);
      this.close();
    }

    openHelp() {
      let options: ThemeableBrowserOptions = {
        location: 'no',
        toolbarposition: 'top',
        toolbar: {
          height: 40,
          color: '#D26D56'
        },
        title: {
          color: '#3F3F3F',
          showPageTitle: true
        },
        backButton: {
          image: 'back',
          imagePressed: 'back_pressed',
          align: 'right',
          event: 'backPressed'
        },
        forwardButton: {
          image: 'forward',
          imagePressed: 'forward_pressed',
          align: 'right',
          event: 'forwardPressed'
        },
        closeButton: {
          wwwImage: 'assets/icon/browser/close-icon.png',
          wwwImagePressed: 'assets/icon/browser/close-icon-pressed.png',
          wwwImageDensity: 13,
          align: 'left',
          event: 'closePressed'
        },
        backButtonCanClose: false
      };
      this.browser = this.iab.create(this.helpURL, '_blank', options);
    }

    loginLogout() {
      if(this.isLoggedIn) {
        this.storage.set('loggedIn', false).then(() => {
          this.close();
          this.isLoggedIn = false;
        });
        let toast = this.toastCtrl.create({
          message: "Sucessfully logged out.",
          duration: 3000,
          position: "bottom"
        }); toast.present();
      } else {
        let modal = this.modalCtrl.create(LoginPage);
        modal.present();
        this.close();
      }
    }
  }