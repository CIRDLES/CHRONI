import { Component, Pipe } from '@angular/core';

import { NavController, Platform, ModalController } from 'ionic-angular';
// import { ScreenOrientation } from 'ionic-native';
import { Storage } from '@ionic/storage';

import { FileBrowser } from '../fileBrowser/fileBrowser';
import { TableView } from '../table/tableView';

import { XMLUtility, Aliquot, ReportSettings } from '../../utilities/XMLUtility';
import { FileUtility } from '../../utilities/FileUtility';
import { HistoryUtility, HistoryEntry } from '../../utilities/HistoryUtility';



@Component({
    selector: 'page-viewFiles',
    templateUrl: 'viewFiles.html'
})
export class ViewFiles {

    currentAliquot: any = {};
    currentReportSettings: any = {};

    constructor(public navCtrl: NavController, public modalCtrl: ModalController, public platform: Platform, public storage: Storage, public xml: XMLUtility, public fileUtil: FileUtility, public historyUtil: HistoryUtility) {

        this.getCurrentFiles();

    }

    ionViewWillEnter() {
        // this.platform.ready().then((val) => {
        //     ScreenOrientation.lockOrientation('portrait').catch((error) => console.log("Orientation Lock Error: " + error));
        // });
    }

    openFileViewer(directory) {
        var params = {directory: ''};

        if (directory === 'Aliquots')
            params.directory = '/chroni/Aliquots/';

        else if (directory === 'Report Settings')
            params.directory = '/chroni/Report Settings/';

        let fileViewer = this.modalCtrl.create(FileBrowser, params)
        fileViewer.present();

        fileViewer.onDidDismiss(file => {
            if (file) {
                if (directory === 'Aliquots') {
                    this.currentAliquot = file;
                    this.storage.set('currentAliquot', this.currentAliquot);
                  }
                else if (directory === 'Report Settings') {
                    this.currentReportSettings = file;
                    this.storage.set('currentReportSettings', this.currentReportSettings);
                  }
            }
        });
    }

    openTable() {
        this.xml.createAliquot(this.currentAliquot).subscribe(al => {
            if (al) {
                var aliquot: Aliquot = <Aliquot> al;
                this.xml.createReportSettings(this.currentReportSettings).subscribe(rs => {
                    if (rs) {
                        var reportSettings: ReportSettings = <ReportSettings> rs;
                        var tableArray = this.xml.createTableData(aliquot, reportSettings);
                        var entry = new HistoryEntry(this.currentAliquot, this.currentReportSettings, new Date());
                        this.historyUtil.addEntry(entry);
                        this.navCtrl.push(TableView, {
                            tableArray: tableArray,
                            aliquot: this.currentAliquot,
                            reportSettings: this.currentReportSettings
                        }, {
                          animate: false
                        });
                    }
                });
            }
        });
    }

    getCurrentFiles() {
        this.storage.get('currentAliquot').then((value) => {
            if (!value) {
                this.fileUtil.getFile('chroni/Aliquots/Default Aliquot.xml')
                    .subscribe(
                        file => {
                            this.storage.set('currentAliquot', file);
                            this.currentAliquot = file;
                        },
                        error => console.log(JSON.stringify(error))
                    );
            } else
                this.currentAliquot = value;
        });
        this.storage.get('currentReportSettings').then((value) => {
            if (!value) {
                this.fileUtil.getFile('chroni/Report Settings/Default Report Settings.xml')
                    .subscribe(
                        file => {
                            this.storage.set('currentReportSettings', file);
                            this.currentReportSettings = file;
                        },
                        error => console.log(JSON.stringify(error))
                    );
            } else
                this.currentReportSettings = value;
        });
    }

}

@Pipe({
    name: 'fileName'
})
export class FileName {
    transform(value, args) {
        if (value && value !== '') {
            var split = value.split('.');
            var lengthToCut = split[split.length-1].length + 1;
            return value.substring(0, value.length-lengthToCut);
        }
    }
}
