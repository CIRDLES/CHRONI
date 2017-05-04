import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, ModalController, ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { ThemeableBrowser, ThemeableBrowserObject, ThemeableBrowserOptions } from '@ionic-native/themeable-browser';
import { ThreeDeeTouch, ThreeDeeTouchQuickAction } from '@ionic-native/three-dee-touch';
import { ScreenOrientation } from '@ionic-native/screen-orientation';

import { FileUtility } from '../utilities/FileUtility';
import { GeochronUtility } from '../utilities/GeochronUtility';

import { About } from '../pages/about/about';
import { History } from '../pages/history/history';
import { Profile } from '../pages/profile/profile';
import { ViewFiles } from '../pages/viewFiles/viewFiles';
import { DownloadPage } from '../pages/download/download';


@Component({
  templateUrl: 'app.html'
})
export class Chroni {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = ViewFiles;
  pages: Array<{ title: string, component: any }>;

  private helpURL: string = 'http://cirdles.org/projects/chroni/#Procedures';
  private browser: ThemeableBrowserObject;

  constructor(private platform: Platform, private modalCtrl: ModalController, private geochron: GeochronUtility, private fileUtil: FileUtility, private statusBar: StatusBar, private storage: Storage, private splashScreen: SplashScreen, private iab: ThemeableBrowser, private threeDeeTouch: ThreeDeeTouch, public toastCtrl: ToastController, private screenOrientation: ScreenOrientation) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Manage Report Table', component: ViewFiles },
      { title: 'Download', component: DownloadPage },
      // { title: 'Aliquots', component: AliquotsPage },
      // { title: 'Report Settings', component: ReportSettingsPage},
      { title: 'History', component: History },
      { title: 'GeoChron Credentials', component: Profile },
      { title: 'About', component: About }
    ];
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT_PRIMARY);

      // creates and/or downloads default files and directories
      this.fileUtil.createDefaultDirectories();
      this.fileUtil.downloadDefaultFiles();
      this.fileUtil.updateCurrentFiles();

      // sets up 3D touch capabilities if possible
      this.threeDeeTouch.isAvailable().then((isAvailable: boolean) => {
        if (isAvailable) {
          let actions: Array<ThreeDeeTouchQuickAction> = [
            {
              type: 'lastReport',
              title: 'Last Report',
              subtitle: 'View last report',
              iconType: 'Time'
            }
          ];
          this.threeDeeTouch.configureQuickActions(actions);
        }
      });

      this.storage.set('loggedIn', false);
      // attempts to log into GeoChron
      this.storage.get('geochronUsername').then((user: string) => {
        if (user) {
          this.storage.get('geochronPassword').then((pass: string) => {
            if (pass) {
              this.geochron.validateCredentials(user, pass).subscribe((valid: boolean) => {
                // if credentials are valid, set loggedIn to true
                if (valid) {
                  this.storage.set('loggedIn', true);
                  this.displayToast('Successfully logged into GeoChron as ' + user);
                }
              });
            }
          });
        }
      });
    });
  }

  openPage(page) {
    // Resets the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }

  openHelp() {
    let options: ThemeableBrowserOptions = {
      location: 'no',
      toolbarposition: 'top',
      toolbar: {
        height: 40,
        color: '#D26D56'
      },
      title: {
        color: '#3F3F3F',
        showPageTitle: true
      },
      backButton: {
        wwwImage: 'assets/icon/close-icon.png',
        wwwImagePressed: 'assets/icon/close-icon-pressed.png',
        wwwImageDensity: 13,
        align: 'left',
        event: 'backPressed'
      },
      forwardButton: {
        image: 'forward',
        imagePressed: 'forward_pressed',
        align: 'left',
        event: 'forwardPressed'
      },
      closeButton: {
        image: 'close',
        imagePressed: 'close_pressed',
        align: 'left',
        event: 'closePressed'
      },
      backButtonCanClose: true
    };
    this.browser = this.iab.create(this.helpURL, '_blank', options);
  }

  displayToast(text: string) {
    this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'bottom',
      cssClass: 'text-center'
    }).present();
  }
}
