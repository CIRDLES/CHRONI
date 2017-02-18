import { Component, Pipe } from '@angular/core';

import { NavController, Platform, ModalController } from 'ionic-angular';
import { File, ScreenOrientation } from 'ionic-native';
import { Storage } from '@ionic/storage';

import { FileBrowser } from '../fileBrowser/fileBrowser';
import { TableView } from '../table/tableView';
import { XMLUtility, Aliquot, ReportSettings } from '../../utilities/XMLUtility';

declare var cordova: any;

@Component({
    selector: 'page-viewFiles',
    templateUrl: 'viewFiles.html'
})
export class ViewFiles {

    fileSystem: string;
    currentAliquot: any = {};
    currentReportSettings: any = {};

    constructor(public navCtrl: NavController, public modalCtrl: ModalController, public platform: Platform, public storage: Storage, public xml: XMLUtility) {

        this.platform.ready().then(() => {
            this.fileSystem = cordova.file.dataDirectory;
            this.getCurrentFiles();
        });

    }

    ionViewWillEnter() {
        this.platform.ready().then((val) => {
            ScreenOrientation.lockOrientation('portrait').catch((error) => console.log("Orientation Lock Error: " + error));
        });
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
                if (directory === 'Aliquots')
                    this.currentAliquot = file;
                else if (directory === 'Report Settings')
                    this.currentReportSettings = file;
            }
        });
    }

    openTable() {
        this.xml.createAliquot(this.currentAliquot).then(al => {
            if (al) {
                var aliquot: Aliquot = <Aliquot> al;
                this.xml.createReportSettings(this.currentReportSettings).then(rs => {
                    if (rs) {
                        var reportSettings: ReportSettings = <ReportSettings> rs;
                        var tableArray = this.xml.createTableData(aliquot, reportSettings);
                        this.navCtrl.push(TableView, {
                            tableArray: tableArray
                        });
                    }
                });
            }
        });
    }

    getCurrentFiles() {
        this.storage.get('currentAliquot').then((value) => {
            if (!value) {
                // if no current aliquot, sets it to Default Aliquot
                File.resolveDirectoryUrl(this.fileSystem).then((directory) => {
                    File.getFile(directory, 'chroni/Aliquots/Default Aliquot.xml', {}).then((file) => {
                        if (file) {
                            this.storage.set('currentAliquot', file);
                            this.currentAliquot = file;
                        }
                        else
                            this.currentAliquot = null;
                    }).catch(error => {
                        console.log('Could not set current Aliquot: ' + JSON.stringify(error));
                    });
                });
            } else
                this.currentAliquot = value;
        });
        this.storage.get('currentReportSettings').then((value) => {
            if (!value) {
                // if no current aliquot, sets it to Default Aliquot
                File.resolveDirectoryUrl(this.fileSystem).then((directory) => {
                    File.getFile(directory, 'chroni/Report Settings/Default Report Settings.xml', {}).then((file) => {
                        if (file) {
                            this.storage.set('currentReportSettings', file);
                            this.currentReportSettings = file;
                        } else
                            this.currentReportSettings = null;
                    }).catch(error => {
                        console.log('Could not set current Report Settings: ' + JSON.stringify(error));
                    });
                });
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