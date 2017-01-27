import { Component } from '@angular/core';

import { Platform } from 'ionic-angular';
import { ScreenOrientation } from 'ionic-native';

@Component({
    selector: 'page-about',
    templateUrl: 'about.html'
})
export class About {

    constructor(public platform: Platform) {

        this.platform.ready().then(() => {
            ScreenOrientation.lockOrientation('portrait');
        });

    }
    
}