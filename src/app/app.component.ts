import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, ModalController } from 'ionic-angular';
import { StatusBar, Splashscreen, File, Transfer } from 'ionic-native';
import { Storage } from '@ionic/storage';

import { About } from '../pages/about/about';
import { History } from '../pages/history/history';
import { ImportFiles } from '../pages/importFiles/importFiles';
import { Profile } from '../pages/profile/profile';
import { ViewFiles } from '../pages/viewFiles/viewFiles';

declare var cordova: any;

@Component({
    templateUrl: 'app.html'
})
export class Chroni {
    @ViewChild(Nav) nav: Nav;

    rootPage: any = ViewFiles;
    pages: Array<{title: string, component: any}>;
    fileSystem: string;

    constructor(public platform: Platform, public modalCtrl: ModalController, public storage: Storage) {
        this.initializeApp();

        // used for an example of ngFor and navigation
        this.pages = [
            { title: 'View Files', component: ViewFiles },
            { title: 'Import Files', component: ImportFiles },
            { title: 'History', component: History },
            { title: 'Profile', component: Profile },
            { title: 'About', component: About }
        ];

        this.platform.ready().then(() => {
            this.fileSystem = cordova.file.dataDirectory;
            const fileTransfer = new Transfer();

            const aliquotRawURI = encodeURI('http://raw.githubusercontent.com/CIRDLES/cirdles.github.com/master/assets/Default-Aliquot-XML/Default Aliquot.xml');
            const reportSettingsRawURI = encodeURI('http://raw.githubusercontent.com/CIRDLES/cirdles.github.com/master/assets/Default Report Settings XML/Default Report Settings.xml');
            const reportSettings2RawURI = encodeURI('http://raw.githubusercontent.com/CIRDLES/cirdles.github.com/master/assets/Default Report Settings XML/Default Report Settings 2.xml');

            const localAliquotURI = encodeURI(this.fileSystem + 'chroni/Aliquots/Default Aliquot.xml');
            const localReportSettingsURI = encodeURI(this.fileSystem + 'chroni/Report Settings/Default Report Settings.xml');
            const localReportSettings2URI = encodeURI(this.fileSystem + 'chroni/Report Settings/Default Report Settings 2.xml');

            // checks the directories and creates them if they don't exist
            File.checkDir(this.fileSystem, 'chroni')
                .catch(err => File.createDir(this.fileSystem, 'chroni', true));

            File.checkDir(this.fileSystem, 'chroni/Aliquots')
                .catch(err => File.createDir(this.fileSystem, 'chroni/Aliquots', true));

            File.checkDir(this.fileSystem, 'chroni/Report Settings')
                .catch(err => File.createDir(this.fileSystem, 'chroni/Report Settings', true));

            // checks the default files and downloads if they don't exist
            File.checkFile(this.fileSystem, 'chroni/Aliquots/Default Aliquot.xml').catch(err => {
                fileTransfer.download(aliquotRawURI, localAliquotURI).then((entry) => {}, (error) => {
                    console.log('DOWNLOAD ERROR: ' + JSON.stringify(error));
                });
            });

            File.checkFile(this.fileSystem, 'chroni/Report Settings/Default Report Settings.xml').catch(err => {
                fileTransfer.download(reportSettingsRawURI, localReportSettingsURI).then((entry) => {}, (error) => {
                    console.log('DOWNLOAD ERROR: ' + JSON.stringify(error));
                });
            });

            File.checkFile(this.fileSystem, 'chroni/Report Settings/Default Report Settings 2.xml').catch(err => {
                fileTransfer.download(reportSettings2RawURI, localReportSettings2URI).then((entry) => {}, (error) => {
                    console.log('DOWNLOAD ERROR: ' + JSON.stringify(error));
                });
            });

            try {
                this.checkCurrentFiles();
            } catch(error) {
                console.log(error);
            }

        });
    }

    checkCurrentFiles() {
        // checks to make sure there are default current files
        this.storage.get('currentAliquot').then((value) => {
            if (!value) {
                // sets the current Aliquot to the Default Aliquot
                File.resolveDirectoryUrl(this.fileSystem).then((directory) => {
                File.getFile(directory, 'chroni/Aliquots/Default Aliquot.xml', {}).then((file) => {
                    if (file)
                        this.storage.set('currentAliquot', file);
                    else
                        throw new Error('Could not set current Aliquot');
                    }).catch(error => {
                        console.log('Could not set current Aliquot: ' + JSON.stringify(error));
                    });
                });
            }
        });
        this.storage.get('currentReportSettings').then((value) => {
            if (!value) {
                // sets the current Report Settings to the Default Report Settings
                File.resolveDirectoryUrl(this.fileSystem).then((directory) => {
                    File.getFile(directory, 'chroni/Report Settings/Default Report Settings.xml', {}).then((file) => {
                        if (file)
                            this.storage.set('currentReportSettings', file);
                        else
                            throw new Error('Could not set current Report Settings');
                    }).catch(error => {
                        console.log('Could not set current Report Settings: ' + JSON.stringify(error));
                    });
                });
            }
        });
    }

    initializeApp() {
        this.platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            StatusBar.styleDefault();
            Splashscreen.hide();
        });
    }

    openPage(page) {
        // Resets the content nav to have just this page
        // we wouldn't want the back button to show in this scenario
        this.nav.setRoot(page.component);
    }
}
