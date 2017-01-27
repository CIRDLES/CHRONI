import { Component } from '@angular/core';

import { ViewController, Platform } from 'ionic-angular';
import { ScreenOrientation } from 'ionic-native';

@Component({
    templateUrl: 'login.html'
})
export class Login {

    constructor(public viewCtrl: ViewController, public platform: Platform) {
        this.platform.ready().then(() => {
            ScreenOrientation.lockOrientation('portrait');
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