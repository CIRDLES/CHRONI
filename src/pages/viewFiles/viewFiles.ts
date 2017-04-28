import { Component, Pipe } from '@angular/core';

import { NavController, Platform, ModalController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs/Observable';
import { ThreeDeeTouch, ThreeDeeTouchQuickAction } from '@ionic-native/three-dee-touch';

import { FileBrowser } from '../fileBrowser/fileBrowser';
import { TableView } from '../table/tableView';

import { XMLUtility, Aliquot, ReportSettings } from '../../utilities/XMLUtility';
import { FileUtility } from '../../utilities/FileUtility';
import { HistoryUtility, HistoryEntry } from '../../utilities/HistoryUtility';



@Component({
  selector: 'page-viewFiles',
  templateUrl: 'viewFiles.html'
})
export class ViewFiles {

  currentAliquot: any = {};
  currentReportSettings: any = {};

  constructor(private navCtrl: NavController, private params: NavParams, private modalCtrl: ModalController, private platform: Platform, private storage: Storage, private xml: XMLUtility, private fileUtil: FileUtility, private historyUtil: HistoryUtility, private threeDeeTouch: ThreeDeeTouch) {

    let finished: number = 0;
    this.getCurrentFiles().subscribe((num: number) => {
      finished++;
      if (finished >= 2) {
        this.threeDeeTouch.onHomeIconPressed().subscribe(
          (payload: ThreeDeeTouchQuickAction) => {
            if (payload.type === 'lastReport')
              this.openTable();
          });
      }
    });

  }

  ionViewWillEnter() {
    // this.platform.ready().then((val) => {
    //     ScreenOrientation.lockOrientation('portrait').catch((error) => console.log("Orientation Lock Error: " + error));
    // });
  }

  openFileViewer(directory) {
    var params = { directory: '' };

    if (directory === 'Aliquots')
      params.directory = '/chroni/Aliquots/';

    else if (directory === 'Report Settings')
      params.directory = '/chroni/Report Settings/';

    let fileViewer = this.modalCtrl.create(FileBrowser, params)
    fileViewer.present();

    fileViewer.onDidDismiss(file => {
      if (file) {
        if (directory === 'Aliquots')
          this.currentAliquot = file;
        else if (directory === 'Report Settings')
          this.currentReportSettings = file;
      }
    });
  }

  openTable() {
    this.xml.createAliquot(this.currentAliquot).subscribe(al => {
      if (al) {
        var aliquot: Aliquot = <Aliquot>al;
        this.xml.createReportSettings(this.currentReportSettings).subscribe(rs => {
          if (rs) {
            var reportSettings: ReportSettings = <ReportSettings>rs;
            var tableArray = this.xml.createTableData(aliquot, reportSettings);
            var entry = new HistoryEntry(this.currentAliquot, this.currentReportSettings, new Date());
            this.historyUtil.addEntry(entry);
            this.storage.set('currentAliquot', this.currentAliquot);
            this.storage.set('currentReportSettings', this.currentReportSettings);
            this.navCtrl.push(TableView, {
              tableArray: tableArray,
              aliquot: this.currentAliquot,
              reportSettings: this.currentReportSettings
            });
          }
        });
      }
    });
  }

  getCurrentFiles(): Observable<any> {
    return new Observable(observer => {
      this.storage.get('currentAliquot').then((value) => {
        if (!value) {
          this.fileUtil.getFile('chroni/Aliquots/Default Aliquot.xml').subscribe(
            file => {
              this.storage.set('currentAliquot', file);
              this.currentAliquot = file;
              observer.next(1);
            },
            error => {
              console.log(JSON.stringify(error));
              observer.next(1);
            });
        } else {
          this.currentAliquot = value;
          observer.next(1);
        }
      });
      this.storage.get('currentReportSettings').then((value) => {
        if (!value) {
          this.fileUtil.getFile('chroni/Report Settings/Default Report Settings.xml').subscribe(
            file => {
              this.storage.set('currentReportSettings', file);
              this.currentReportSettings = file;
              observer.next(1);
            },
            error => {
              console.log(JSON.stringify(error));
              observer.next(1);
            });
        } else {
          this.currentReportSettings = value;
          observer.next(1);
        }
      });
    });
  }

}

@Pipe({
  name: 'fileName'
})
export class FileName {
  transform(value, args) {
    if (value && value !== '') {
      var split = value.split('.');
      var lengthToCut = split[split.length - 1].length + 1;
      return value.substring(0, value.length - lengthToCut);
    }
  }
}
