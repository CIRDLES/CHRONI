import { Component } from '@angular/core';

import { Platform, ToastController} from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { FileEntry } from '@ionic-native/file';

import { FileUtility } from '../../utilities/FileUtility';
import { XMLUtility } from '../../utilities/XMLUtility';
import { GeochronUtility } from '../../utilities/GeochronUtility';
import { FileName } from '../viewFiles/viewFiles';

@Component({
  selector: 'page-download',
  templateUrl: 'download.html'
})
export class DownloadPage {

  downloadType: string = "url";
  url: string = "";
  igsn: string = "";
  fileName: string = "";

  downloading: boolean = false;
  loggedIn: boolean = false;
  username: string = "";
  password: string = "";

  constructor(public platform: Platform, public storage: Storage, public fileUtil: FileUtility, public xmlUtil: XMLUtility, private geochron: GeochronUtility, public toastCtrl: ToastController) {
    this.storage.get('loggedIn').then((value) => {
      if (value) {
        this.downloadType = 'igsn';
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
    }, (error) => console.log(JSON.stringify(error)));
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
            this.url = "";
            this.fileName = "";
          }
        }, (error) => console.log(JSON.stringify(error)));
    } else {
      this.displayToast('ERROR: invalid IGSN');
      this.downloading = false;
    }
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
