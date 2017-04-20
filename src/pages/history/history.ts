import { Component, Pipe } from '@angular/core';
import { HistoryUtility, HistoryEntry } from '../../utilities/HistoryUtility';

import { ScreenOrientation, File } from 'ionic-native';

import { XMLUtility, Aliquot, ReportSettings } from '../../utilities/XMLUtility';
import { FileBrowser } from '../fileBrowser/fileBrowser';
import { TableView } from '../table/tableView';
import { FileUtility } from '../../utilities/FileUtility';
import { NavController, Platform, ModalController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

declare var cordova: any;

@Component({
    templateUrl: 'history.html'
})
export class History {

	fileSystem: string;
	public history: Array<HistoryEntry> = [];
    public historyIndex: HistoryEntry;

    constructor(public platform: Platform, public historyUtil: HistoryUtility, public navCtrl: NavController, public xml: XMLUtility, public fileUtil: FileUtility, public modalCtrl: ModalController, public storage: Storage) {
    	this.platform.ready().then(() => {
            this.fileSystem = cordova.file.dataDirectory;
        });

        this.history = this.historyUtil.getHistoryEntries();

    }

    ionViewWillEnter() {
        this.history = this.historyUtil.getHistoryEntries();
        // this.platform.ready().then((val) => {
        //     ScreenOrientation.lockOrientation('portrait').catch((error) => console.log("Orientation Lock Error: " + error));
        // });
    }

    openTable(i) {

        this.historyIndex = this.historyUtil.getHistoryEntry(i);
        this.xml.createAliquot(this.historyIndex.getAliquotFile()).subscribe(al => {
            if (al) {
                var aliquot: Aliquot = <Aliquot> al;
                this.xml.createReportSettings(this.historyIndex.getReportSettingsFile()).subscribe(rs => {
                    if (rs) {
                        var reportSettings: ReportSettings = <ReportSettings> rs;
                        var tableArray = this.xml.createTableData(aliquot, reportSettings);
                        var entry = new HistoryEntry(this.historyIndex.getAliquotFile(), this.historyIndex.getReportSettingsFile(), new Date());
                        this.historyUtil.addEntry(entry);
                        this.navCtrl.push(TableView, {
                            tableArray: tableArray,
                            aliquot: this.historyIndex.getAliquotFile(),
                            reportSettings: this.historyIndex.getReportSettingsFile()
                        });
                    }
                });
            }
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
