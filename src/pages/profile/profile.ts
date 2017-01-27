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
        this.platform.ready().then(() => {
            ScreenOrientation.lockOrientation('portrait');
        });
    }

    showLogin() {
        let modal = this.modalCtrl.create(Login);
        modal.present();
    }

}