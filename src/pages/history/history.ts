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

    	// TEMPORARY
    	//for (let i = 0; i < 10; i++) {
    	//	var al = "chroni/Aliquots/aliquot" + i;
    	//	var rs = "chroni/Report Settings/reportSettings" + i;
    	//	var date = new Date();
    	//	var entry = {
    	//		aliquot: al,
    	//		reportSettings: rs,
    	//		date: date
    	//	};
    		//this.history.push(entry);
    	//}
    	// end TEMPORARY

         // this.history = historyUtil.getHistory();


        // PERMANENT
        // for (let i = 0; i < this.history.length; i++) {
        // 	var al = this.history[i][0];
        // 	var rs = this.history[i][1];
        // 	var date = this.history[i][2];
        // 	var entry = {
        // 		aliquot: al,
        // 		reportSettings: rs,
        // 		date: date
        // 	};
        // 	this.history.push(entry);
        // }


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