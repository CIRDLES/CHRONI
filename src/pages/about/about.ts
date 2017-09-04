import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { ThemeableBrowser, ThemeableBrowserObject, ThemeableBrowserOptions } from '@ionic-native/themeable-browser';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {

  constructor(public navCtrl: NavController, private statusBar: StatusBar, private iab: ThemeableBrowser) { }

  openBrowser(url: string) {
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
    this.iab.create(url, '_blank', options);
  }

  hideStatusBar() {
    this.statusBar.hide();
  }

}
