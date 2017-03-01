import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, ModalController } from 'ionic-angular';
import { StatusBar, Splashscreen, ScreenOrientation } from 'ionic-native';

import { FileUtility } from '../utilities/FileUtility';

import { About } from '../pages/about/about';
import { History } from '../pages/history/history';
import { Profile } from '../pages/profile/profile';
import { ViewFiles } from '../pages/viewFiles/viewFiles';
import { AliquotsPage } from '../pages/aliquots/aliquots';
import { ReportSettingsPage } from '../pages/reportSettings/reportSettings';
import { HelpPage } from '../pages/help/help';


@Component({
    templateUrl: 'app.html'
})
export class Chroni {
    @ViewChild(Nav) nav: Nav;

    rootPage: any = ViewFiles;
    pages: Array<{title: string, component: any}>;

    constructor(public platform: Platform, public modalCtrl: ModalController, public fileUtil: FileUtility) {
        this.initializeApp();

        // used for an example of ngFor and navigation
        this.pages = [
            { title: 'Manage Report Table', component: ViewFiles },
            { title: 'Aliquots', component: AliquotsPage },
            { title: 'Report Settings', component: ReportSettingsPage},
            { title: 'History', component: History },
            { title: 'GeoChron Credentials', component: Profile },
            { title: 'About', component: About },
            { title: 'Help', component: HelpPage }
        ];

        this.platform.ready().then(() => {
            this.fileUtil.createDefaultDirectories();
            this.fileUtil.downloadDefaultFiles();
            this.fileUtil.updateCurrentFiles();
        });
    }

    ionViewWillEnter() {
        this.platform.ready().then((val) => {
            ScreenOrientation.lockOrientation('portrait').catch((error) => console.log("Orientation Lock Error: " + error));
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
