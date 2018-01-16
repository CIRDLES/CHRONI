import { Component } from '@angular/core';
import { ToastController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { Storage } from '@ionic/storage';

import { GeochronUtility } from '../../utilities/GeochronUtility';

@Component({
  selector: 'page-myIGSNs',
  templateUrl: 'myIGSNs.html'
})
export class MyIGSNsPage {

  hasOverlay: boolean = false;
  igsns: Array<any> = [];
  loading: boolean = true;
  username: string;
  password: string;

  constructor(private storage: Storage, private statusBar: StatusBar, private toastCtrl: ToastController, private geochron: GeochronUtility) {
    this.storage.get('hasOverlay').then(
      (overlayed: boolean) => this.hasOverlay = overlayed,
      (error) => this.hasOverlay = false
    );
  }

  ionViewWillEnter() {
    let error = () => {
      this.loading = false;
      this.displayToast('There was an error while logging into GeoChron');
    }
    this.storage.get('loggedIn').then((loggedIn: boolean) => {
      if (loggedIn) {
        this.storage.get('geochronUsername').then((user: string) => {
            if (user && user !== "") {
              this.username = user;
              this.storage.get('geochronPassword').then((pass: string) => {
                if (pass && pass !== "") {
                  this.password = pass;
                  this.getIGSNs();
                } else error();
              }, (err) => error());
            } else error();
          }, (err) => error());
      } else error();
    });
  }

  getIGSNs() {
    this.geochron.getMyGeochronIGSNs(this.username, this.password).subscribe((igsns: Array<any>) => {
      this.igsns = igsns;
      this.loading = false;
    }, error => error());
  }

  refresh(refresher) {
    this.geochron.getMyGeochronIGSNs(this.username, this.password).subscribe((igsns: Array<any>) => {
      this.igsns = igsns;
      refresher.complete();
    }, error => {
      this.displayToast("ERROR: Unable to refresh IGSNs...")
      refresher.complete();
    });
  }

  displayToast(text: string, duration=3000) {
    this.toastCtrl.create({
      message: text,
      duration: duration,
      position: 'top',
      cssClass: 'text-center'
    }).present();
  }

  hideStatusBar(force: boolean = false) {
    (force || this.hasOverlay) && this.statusBar.hide();
  }

}
