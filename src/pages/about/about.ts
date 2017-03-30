import { Component } from '@angular/core';

import { Platform } from 'ionic-angular';
// import { ScreenOrientation } from 'ionic-native';

@Component({
    selector: 'page-about',
    templateUrl: 'about.html'
})
export class About {

    constructor(public platform: Platform) {

    }

    ionViewWillEnter() {
        // this.platform.ready().then((val) => {
        //     ScreenOrientation.lockOrientation('portrait').catch((error) => console.log("Orientation Lock Error: " + error));
        // });
    }

}
