import { Component } from '@angular/core';

import { Platform } from 'ionic-angular';
import { ScreenOrientation } from 'ionic-native';

@Component({
    selector: 'page-tableView',
    templateUrl: 'tableView.html'
})
export class TableView {

    constructor(public platform: Platform) {
        
    }

    ionViewWillEnter() {
        this.platform.ready().then(() => {
            ScreenOrientation.unlockOrientation();
        });
    }

    ionViewWillLeave() {
        this.platform.ready().then((val) => {
            ScreenOrientation.lockOrientation('portrait').catch((error) => console.log("Orientation Lock Error: " + error));
        });
    }

}