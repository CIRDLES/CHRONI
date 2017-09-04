import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, ToastController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { ThemeableBrowser, ThemeableBrowserObject, ThemeableBrowserOptions } from '@ionic-native/themeable-browser';
import { ThreeDeeTouch, ThreeDeeTouchQuickAction } from '@ionic-native/three-dee-touch';

import { ManageReportsPage } from '../pages/manageReports/manageReports';
import { DownloadPage } from '../pages/download/download';
import { HistoryPage } from '../pages/history/history';
import { AboutPage } from '../pages/about/about';

import { FileUtility } from '../utilities/FileUtility';
import { GeochronUtility } from '../utilities/GeochronUtility';

@Component({
  templateUrl: 'app.html'
})
export class Chroni {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = ManageReportsPage;
  pages: Array<{ title: string, component: Component }> = [];

  helpURL: string = 'http://cirdles.org/projects/chroni/#Procedures';
  browser: ThemeableBrowserObject;

  // Geochron menu variables
  username: string = "";
  password: string = "";
  loggedIn: boolean = false;
  loggingIn: boolean = true;
  loggingOut: boolean = false;

  constructor(private platform: Platform, private statusBar: StatusBar, private splashScreen: SplashScreen, private storage: Storage, private screenOrientation: ScreenOrientation, private toastCtrl: ToastController, private geochron: GeochronUtility, private fileUtil: FileUtility, private iab: ThemeableBrowser, private threeDeeTouch: ThreeDeeTouch) {
    this.pages = [
      { title: 'Manage Report Table', component: ManageReportsPage },
      { title: 'Download', component: DownloadPage },
      { title: 'History', component: HistoryPage },
      { title: 'About', component: AboutPage }
    ];

    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.statusBar.show();

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

      this.storage.get('loggedIn').then((val: boolean) => {
        if (val === true) {
          // attempts to log into GeoChron
          this.storage.get('geochronUsername').then((user: string) => {
            if (user && user !== "") {
              this.username = user;
              this.storage.get('geochronPassword').then((pass: string) => {
                if (pass && pass !== "") {
                  this.password = pass;
                  this.geochron.validateCredentials(user, pass).subscribe((valid: boolean) => {
                    // if credentials are valid, set loggedIn to true
                    this.loggingIn = false;
                    this.loggedIn = valid !== null && valid;
                    if (valid) {
                      this.storage.set('loggedIn', true);
                      this.displayToast('Successfully logged into GeoChron as ' + user);
                    }
                  }, (error) => this.loggingIn = false);
                } else
                  this.loggingIn = false;
              }, (error) => this.loggingIn = false);
            } else
              this.loggingIn = false;
          }, (error) => this.loggingIn = false);
        } else
          this.loggingIn = false;
      }, (error) => this.loggingIn = false);
    });
  }

  login() {
    this.loggingIn = true;
    let user = this.username;
    let pass = this.password;
    this.geochron.validateCredentials(user, pass)
      .subscribe((valid: boolean) => {
        if (valid)
          this.geochron.saveCurrentUser(user, pass).subscribe(
            _ => this.loggingIn = false,
            _ => this.loggingIn = false,
            () => {
              this.loggingIn = false;
              this.loggedIn = true;
              this.displayToast('Successfully logged into Geochron as ' + user);
            });
        else {
          this.loggingIn = false;
          this.displayToast('Could not log in, invalid Geochron credentials');
        }
      });
  }

  logout() {
    this.loggingOut = true;
    this.storage.set('loggedIn', false).then(() => {
      this.loggedIn = false;
      this.loggingOut = false;
    });
  }

  hideStatusBar() {
    this.statusBar.hide();
  }

  showStatusBar() {
    this.statusBar.show();
  }

  openPage(page) {
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
        image: 'back',
        imagePressed: 'back_pressed',
        align: 'right',
        event: 'backPressed'
      },
      forwardButton: {
        image: 'forward',
        imagePressed: 'forward_pressed',
        align: 'right',
        event: 'forwardPressed'
      },
      closeButton: {
        wwwImage: 'assets/icon/browser/close-icon.png',
        wwwImagePressed: 'assets/icon/browser/close-icon-pressed.png',
        wwwImageDensity: 13,
        align: 'left',
        event: 'closePressed'
      },
      backButtonCanClose: false
    };
    this.browser = this.iab.create(this.helpURL, '_blank', options);
  }

  displayToast(text: string) {
    this.toastCtrl.create({
      message: text,
      duration: 2000,
      position: 'bottom',
      cssClass: 'text-center'
    }).present();
  }

}
