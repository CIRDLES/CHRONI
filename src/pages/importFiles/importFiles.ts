import { Component } from '@angular/core';

import { Platform } from 'ionic-angular';
import { ScreenOrientation } from 'ionic-native';

@Component({
    selector: 'page-importFiles',
    templateUrl: 'importFiles.html'
})
export class ImportFiles {

    constructor(public platform: Platform) {
        
    }

    ionViewWillEnter() {
        this.platform.ready().then((val) => {
            ScreenOrientation.lockOrientation('portrait').catch((error) => console.log("Orientation Lock Error: " + error));
        });
    }

}