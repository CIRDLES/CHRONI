import { Component } from '@angular/core';
import { HistoryUtility } from '../utilities/HistoryUtility';

import { Platform } from 'ionic-angular';
import { ScreenOrientation } from 'ionic-native';

@Component({
    templateUrl: 'history.html'
})
export class History {

    constructor(public platform: Platform) {
        
    }

    ionViewWillEnter() {
        this.platform.ready().then((val) => {
            ScreenOrientation.lockOrientation('portrait').catch((error) => console.log("Orientation Lock Error: " + error));
        });
    }

}