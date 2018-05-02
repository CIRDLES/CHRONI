import { ViewController, NavController } from "ionic-angular";
import { Component } from "@angular/core";
import { ThemeableBrowserOptions, ThemeableBrowser, ThemeableBrowserObject } from "@ionic-native/themeable-browser";
import { AboutPage } from "../about/about";

@Component({
    templateUrl: 'popover.html'
  })
  export class PopoverPage {
    constructor(public viewCtrl: ViewController, private navCtrl: NavController, private iab: ThemeableBrowser, ) {}
  
    helpURL: string = 'http://cirdles.org/projects/chroni/#Procedures';
    browser: ThemeableBrowserObject;

    close() {
      this.viewCtrl.dismiss();
    }

    openAbout() {
      this.navCtrl.push(AboutPage);
      this.viewCtrl.dismiss();
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
  }