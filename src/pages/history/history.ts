import { Component } from '@angular/core';
import { HistoryUtility } from '../utilities/HistoryUtility';

import { Platform } from 'ionic-angular';
import { ScreenOrientation } from 'ionic-native';

@Component({
    templateUrl: 'history.html'
})
export class History {

    constructor(public platform: Platform) {
        this.platform.ready().then(() => {
            ScreenOrientation.lockOrientation('portrait');
        });
    }

}