import { Component } from '@angular/core';

import { Login } from '../profile/login';

import { ViewController, Platform } from 'ionic-angular';
// import { ScreenOrientation } from 'ionic-native';

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class Profile {

    constructor(public viewCtrl: ViewController, public platform: Platform) {

    }

    ionViewWillEnter() {
        // this.platform.ready().then((val) => {
        //     ScreenOrientation.lockOrientation('portrait').catch((error) => console.log("Orientation Lock Error: " + error));
        // });
    }

    login() {
        // TODO: finish login process
        this.viewCtrl.dismiss();
    }

}
