import { Component } from '@angular/core';

import { Platform } from 'ionic-angular';
// import { ScreenOrientation, FileEntry } from 'ionic-native';
import { Storage } from '@ionic/storage';

import { FileUtility } from '../../utilities/FileUtility';
import { FileName } from '../viewFiles/viewFiles';

@Component({
  selector: 'page-aliquots',
  templateUrl: 'aliquots.html'
})
export class AliquotsPage {

  currentAliquot: any = {};

  constructor(public platform: Platform, public storage: Storage, public fileUtil: FileUtility) {
    this.getCurrentAliquot();
  }

  ionViewWillEnter() {
    // this.platform.ready().then((val) => {
    //   ScreenOrientation.lockOrientation('portrait').catch((error) => console.log("Orientation Lock Error: " + error));
    // });
  }

  getCurrentAliquot() {
    this.storage.get('currentAliquot').then((value) => {
      if (!value) {
        this.fileUtil.getFile('chroni/Aliquots/Default Aliquot.xml')
          .subscribe(
              file => {
                  this.storage.set('currentAliquot', file);
                  this.currentAliquot = file;
              },
              error => console.log(JSON.stringify(error))
            );
      } else
        this.currentAliquot = value;
    });
  }

}
