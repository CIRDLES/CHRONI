import { Component } from '@angular/core';

import { Platform } from 'ionic-angular';
import { ScreenOrientation } from 'ionic-native';
import { Storage } from '@ionic/storage';

import { FileUtility } from '../../utilities/FileUtility';
import { FileName } from '../viewFiles/viewFiles';

@Component({
  selector: 'page-reportSettings',
  templateUrl: 'reportSettings.html'
})
export class ReportSettingsPage {

  currentReportSettings: any = {};

  constructor(public platform: Platform, public storage: Storage, public fileUtil: FileUtility) {
    this.getCurrentReportSettings();
  }

  ionViewWillEnter() {
    this.platform.ready().then((val) => {
      ScreenOrientation.lockOrientation('portrait').catch((error) => console.log("Orientation Lock Error: " + error));
    });
  }

  getCurrentReportSettings() {
    this.storage.get('currentReportSettings').then((value) => {
      if (!value) {
        this.fileUtil.getFile('chroni/Aliquots/Default Aliquot.xml')
          .subscribe(
              file => {
                  this.storage.set('currentReportSettings', file);
                  this.currentReportSettings = file;
              },
              error => console.log(JSON.stringify(error))
            );
      } else
        this.currentReportSettings = value;
    });
  }

}
