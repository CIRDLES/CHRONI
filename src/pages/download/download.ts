import { Component } from '@angular/core';
import { ToastController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { Storage } from '@ionic/storage';

import { GeochronUtility } from '../../utilities/GeochronUtility';
import { FileNamePipe } from '../../utilities/pipes/FileName';

@Component({
  selector: 'page-download',
  templateUrl: 'download.html'
})
export class DownloadPage {

  downloadType: string = "igsn";
  url: string = "";
  igsn: string = "";
  fileName: string = "";

  downloading: boolean = false;
  loggedIn: boolean = false;
  username: string = "";
  password: string = "";

  constructor(private statusBar: StatusBar, private storage: Storage, private geochron: GeochronUtility, private toastCtrl: ToastController) {
    this.storage.get('loggedIn').then((value) => {
      if (value) {
        this.loggedIn = true;
        this.storage.get('geochronUsername').then((user: string) => this.username = user);
        this.storage.get('geochronPassword').then((pass: string) => this.password = pass);
      }
    });
  }

  downloadFromURL() {
    this.downloading = true;
    let name = this.fileName;
    if (!this.fileName.endsWith(".xml"))
      name += ".xml";

    let url: string = this.url;
    if (!url.match(/https?:\/\/.*/))
      url = "http://" + url;

    this.geochron.downloadFromURL(url, name).subscribe((valid: boolean) => {
      this.downloading = false;
      if (valid) {
        this.url = "";
        this.fileName = "";
      }
    }, (error) => {
      this.downloading = false;
      this.displayToast('ERROR: unable to download file');
    });
  }

  downloadIGSN() {
    this.downloading = true;
    let name = this.fileName;
    if (!this.fileName.endsWith(".xml"))
      name += ".xml";

    let igsn: string = this.igsn = this.igsn.toUpperCase();
    if (igsn.length === 9) {
      this.geochron.downloadIGSN(igsn, name,
        this.username !== '' ? this.username : null,
        this.password !== '' ? this.password : null).subscribe((valid: boolean) => {
          this.downloading = false;
          if (valid) {
            this.igsn = "";
            this.fileName = "";
          }
        }, (error) => {
          this.downloading = false;
          this.displayToast('ERROR: unable to download file');
        });
    } else {
      this.displayToast('ERROR: invalid IGSN');
      this.downloading = false;
    }
  }

  hideStatusBar() {
    this.statusBar.hide();
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
