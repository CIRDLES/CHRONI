import { Component } from '@angular/core';
import { ToastController, PopoverController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { Storage } from '@ionic/storage';

import { GeochronUtility } from '../../utilities/GeochronUtility';
import { FileNamePipe } from '../../utilities/pipes/FileName';
import { PopoverPage } from '../popover/popover';

@Component({
  selector: 'page-download',
  templateUrl: 'download.html'
})
export class DownloadPage {
  downloadType: string = 'igsn';
  url: string = '';
  igsn: string = '';

  downloading: boolean = false;
  loggedIn: boolean = false;
  username: string = '';
  password: string = '';
  hasOverlay: boolean = false;

  constructor(
    private statusBar: StatusBar,
    private storage: Storage,
    private geochron: GeochronUtility,
    private toastCtrl: ToastController,
    private popoverCtrl: PopoverController,
  ) {
    this.storage.get('loggedIn').then(value => {
      if (value) {
        this.loggedIn = true;
        this.storage
          .get('geochronUsername')
          .then((user: string) => (this.username = user));
        this.storage
          .get('geochronPassword')
          .then((pass: string) => (this.password = pass));
      }
    });
    this.storage
      .get('hasOverlay')
      .then(
        (overlayed: boolean) => (this.hasOverlay = overlayed),
        error => (this.hasOverlay = false)
      );
  }

  downloadFromURL() {
    this.downloading = true;
    let url: string = this.url;
    if (!url.match(/https?:\/\/.*/)) url = 'http://' + url;

    this.geochron.downloadFromURL(url).subscribe(
      (valid: boolean) => {
        this.downloading = false;
        if (valid) {
          this.url = '';
        }
      },
      error => {
        this.downloading = false;
        this.displayToast('ERROR: unable to download file');
      }
    );
  }

  downloadIGSN() {
    this.downloading = true;
    let igsn: string = (this.igsn = this.igsn.toUpperCase());
    if (igsn.length === 9) {
      this.geochron
        .downloadIGSN(
          igsn,
          this.username !== '' && this.username,
          this.password !== '' && this.password
        )
        .subscribe(
          (valid: boolean) => {
            this.downloading = false;
            if (valid) {
              this.igsn = '';
            }
          },
          error => {
            this.downloading = false;
            this.displayToast('ERROR: unable to download file');
          }
        );
    } else {
      this.displayToast('ERROR: invalid IGSN');
      this.downloading = false;
    }
  }

  hideStatusBar(force: boolean = false) {
    (force || this.hasOverlay) && this.statusBar.hide();
  }

  displayToast(text: string) {
    this.toastCtrl
      .create({
        message: text,
        duration: 3000,
        position: 'bottom',
        cssClass: 'text-center'
      })
      .present();
  }

  showPopoverMenu(event) {
    let popover = this.popoverCtrl.create(PopoverPage);
    popover.present({
      ev: event
    });
  }
}
