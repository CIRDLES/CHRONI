import { Component } from '@angular/core';

import { ViewController, Platform } from 'ionic-angular';
import { ScreenOrientation } from 'ionic-native';

@Component({
    templateUrl: 'login.html'
})
export class Login {

    constructor(public viewCtrl: ViewController, public platform: Platform) {
        
    }

    ionViewWillEnter() {
        this.platform.ready().then((val) => {
            ScreenOrientation.lockOrientation('portrait').catch((error) => console.log("Orientation Lock Error: " + error));
        });
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }

    login() {
        // TODO: finish login process
        this.viewCtrl.dismiss();
    }
}