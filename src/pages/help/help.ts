import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { InAppBrowser } from 'ionic-native';
import { Platform } from 'ionic-angular';

/*
  Generated class for the Help page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-help',
  templateUrl: 'help.html'
})
export class HelpPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, public plt: Platform) {
    this.plt = plt;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HelpPage');
  }

  launch(url) {
    this.plt.ready().then(() => {
      let browser = new InAppBrowser(url, "_blank");
    });
  }

}
