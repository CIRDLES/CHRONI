import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { Storage } from '@ionic/storage';
import { ThemeableBrowser, ThemeableBrowserOptions } from '@ionic-native/themeable-browser';
import { AppVersion } from '@ionic-native/app-version';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {

  appVer: string;
  hasOverlay: boolean = false;

  constructor(public navCtrl: NavController, private storage: Storage, private statusBar: StatusBar, private iab: ThemeableBrowser, private appVersion: AppVersion, private platform: Platform) {
    this.storage.get('hasOverlay').then(
      (overlayed: boolean) => this.hasOverlay = overlayed,
      (error) => this.hasOverlay = false
    );
  }

  openBrowser(url: string) {
    let options: ThemeableBrowserOptions = {
      location: 'no',
      toolbarposition: 'top',
      toolbar: {
        height: 40,
        color: '#D26D56'
      },
      statusbar: {
        color: '#ffffffff'
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
    this.iab.create(url, '_blank', options);
  }

  hideStatusBar(force: boolean = false) {
    (force || this.hasOverlay) && this.statusBar.hide();
  }

  ionViewDidLoad() {
    if (this.platform.is('cordova')) {
      this.appVersion.getVersionNumber().then((ver: string) => this.appVer = ver);
    }
  }

}
