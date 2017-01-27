import { Component } from '@angular/core';

import { Platform } from 'ionic-angular';
import { ScreenOrientation } from 'ionic-native';

@Component({
    selector: 'page-importFiles',
    templateUrl: 'importFiles.html'
})
export class ImportFiles {

    constructor(public platform: Platform) {
        this.platform.ready().then(() => {
            ScreenOrientation.lockOrientation('portrait');
        });
    }

}