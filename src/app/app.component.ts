import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, ToastController } from 'ionic-angular';
import { Device } from '@ionic-native/device';
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
  loggingIn: boolean = false;
  loggingOut: boolean = false;
  hasOverlay: boolean = false;

  constructor(private platform: Platform, private device: Device, private statusBar: StatusBar, private splashScreen: SplashScreen, private storage: Storage, private screenOrientation: ScreenOrientation, private toastCtrl: ToastController, private geochron: GeochronUtility, private fileUtil: FileUtility, private iab: ThemeableBrowser, private threeDeeTouch: ThreeDeeTouch) {
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

      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);

      this.storage.get('hasOverlay').then(
        (overlay) =>  overlay ? this.hasOverlay = overlay : this.setOverlaySetting(),
        (error) => this.setOverlaySetting()
      );

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
        let error = () => {
          this.loggingIn = false;
          this.displayToast('There was an error while logging into GeoChron');
        }
        if (val === true) {
          this.loggingIn = true;
          // attempts to log into GeoChron
          this.storage.get('geochronUsername').then((user: string) => {
            if (user && user !== "") {
              error = () => {
                this.loggingIn = false;
                this.displayToast('There was an error while logging into GeoChron as ' + user);
              }
              this.username = user;
              this.storage.get('geochronPassword').then((pass: string) => {
                if (pass && pass !== "") {
                  this.password = pass;
                  this.geochron.validateCredentials(user, pass).subscribe((valid: boolean) => {
                    // if credentials are valid, set loggedIn to true
                    if (valid) {
                      this.loggingIn = false;
                      this.loggedIn = valid !== null && valid;
                      this.storage.set('loggedIn', true);
                      this.displayToast('Successfully logged into GeoChron as ' + user, 2000);
                    } else
                      error();
                  }, (err) => error());
                } else
                  error();
              }, (err) => error());
            } else
              error();
          }, (err) => error());
        }
      }, (err) => console.log(err));
    });
  }

  login() {
    this.loggingIn = true;
    let user = this.username;
    let pass = this.password;
    let error = () => {
      this.loggingIn = false;
      this.displayToast('There was an error while logging into GeoChron as ' + user);
    }
    this.geochron.validateCredentials(user, pass)
      .subscribe((valid: boolean) => {
        if (valid) {
          this.geochron.saveCurrentUser(user, pass).subscribe(_ => { }, _ => { },
            () => {
              this.loggingIn = false;
              this.loggedIn = true;
              this.displayToast('Successfully logged into Geochron as ' + user, 2000);
              this.geochron.getMyGeochronIGSNs(user, pass).subscribe((res) => {
                console.log(JSON.stringify(res));
              });
            });
        } else {
          this.loggingIn = false;
          this.displayToast('Error logging in, invalid Geochron credentials');
        }
      }, (err) => error());
  }

  logout() {
    this.loggingOut = true;
    this.storage.set('loggedIn', false).then(() => {
      this.loggedIn = false;
      this.loggingOut = false;
    });
  }

  hideStatusBar(force: boolean = false) {
    (force || this.hasOverlay) && this.statusBar.hide();
  }

  showStatusBar() {
    this.statusBar.show();
  }

  openPage(page) {
    this.nav.setRoot(page.component);
  }

  setOverlaySetting() {
    let noOverlay = this.platform.is('android') || this.device.model === 'iPhone X';
    this.storage.set('hasOverlay', !noOverlay);
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

  displayToast(text: string, duration=3000) {
    this.toastCtrl.create({
      message: text,
      duration: duration,
      position: 'top',
      cssClass: 'text-center'
    }).present();
  }

}
