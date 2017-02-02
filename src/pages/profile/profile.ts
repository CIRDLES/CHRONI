import { Component } from '@angular/core';

import { Login } from '../profile/login';

import { ModalController, Platform } from 'ionic-angular';
import { ScreenOrientation } from 'ionic-native';

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class Profile {

    constructor(public modalCtrl: ModalController, public platform: Platform) {
        
    }

    ionViewWillEnter() {
        this.platform.ready().then((val) => {
            ScreenOrientation.lockOrientation('portrait').catch((error) => console.log("Orientation Lock Error: " + error));
        });
    }

    showLogin() {
        let modal = this.modalCtrl.create(Login);
        modal.present();
    }

}