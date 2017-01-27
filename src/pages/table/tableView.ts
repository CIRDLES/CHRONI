import { Component } from '@angular/core';

import { Platform } from 'ionic-angular';
import { ScreenOrientation } from 'ionic-native';

@Component({
    selector: 'page-tableView',
    templateUrl: 'tableView.html'
})
export class TableView {

    constructor(public platform: Platform) {

        this.platform.ready().then(() => {
            ScreenOrientation.unlockOrientation();
        });
        
    }

    ionViewWillLeave() {
        ScreenOrientation.lockOrientation('portrait');
    }

}