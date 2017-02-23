import { Component, Pipe } from '@angular/core';
import { HistoryUtility, HistoryEntry } from '../../utilities/HistoryUtility';

import { Platform } from 'ionic-angular';
import { ScreenOrientation, File } from 'ionic-native';

declare var cordova: any;

@Component({
    templateUrl: 'history.html'
})
export class History {

	fileSystem: string;
	public history: Array<HistoryEntry> = [];

    constructor(public platform: Platform, public historyUtil: HistoryUtility) {
    	this.platform.ready().then(() => {
            this.fileSystem = cordova.file.dataDirectory;
        });

        this.history = this.historyUtil.getHistoryEntries();

    }

    ionViewWillEnter() {
        this.platform.ready().then((val) => {
            ScreenOrientation.lockOrientation('portrait').catch((error) => console.log("Orientation Lock Error: " + error));
        });
    }

}

@Pipe({
    name: 'name'
})
export class Name {
    transform(value, args) {
        if (value && value !== '') {
            var split = value.split('/');
            if (split[split.length - 1] === '')
                return split[split.length - 2];
            else
                return split[split.length - 1];
        }
    }
}