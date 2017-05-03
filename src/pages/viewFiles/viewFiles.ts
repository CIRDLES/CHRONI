import { Component, Pipe } from '@angular/core';

import { NavController, Platform, ModalController, NavParams, ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs/Observable';
import { ThreeDeeTouch, ThreeDeeTouchQuickAction } from '@ionic-native/three-dee-touch';
import { FileEntry } from '@ionic-native/file';

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

  currentAliquot: FileEntry;
  currentReportSettings: FileEntry;
  opening: boolean = false;

  constructor(private navCtrl: NavController, private params: NavParams, private modalCtrl: ModalController, private platform: Platform, private storage: Storage, private xml: XMLUtility, private fileUtil: FileUtility, private historyUtil: HistoryUtility, private threeDeeTouch: ThreeDeeTouch, public toastCtrl: ToastController) {
    this.platform.ready().then(() => {
      // first makes sure the default directories are created
      this.fileUtil.createDefaultDirectories().subscribe(_ => { }, _ => { }, () => {
        // then downloads the default files if not alreadt there
        this.fileUtil.downloadDefaultFiles().subscribe(_ => { }, _ => { }, () => {
          // then updates the current Aliquot and Report Settings files
          this.getCurrentFiles().subscribe(_ => { }, _ => { }, () => {
            // checks to see if coming from a 3D touch
            this.threeDeeTouch.onHomeIconPressed().subscribe(
              (payload: ThreeDeeTouchQuickAction) => {
                if (payload.type === 'lastReport')
                  this.openTable();
              });
          });
        });;
      });
    });
  }

  ionViewWillEnter() {
    this.opening = false;
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
    this.opening = true;
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
          } else {
            this.opening = false;
            this.displayToast("Could not open table, invalid Report Settings XML file");
          }
        }, (error) => {
          this.opening = false;
          this.displayToast("Could not open table, " + error);
        });
      } else {
        this.opening = false;
        this.displayToast("Could not open table, invalid Aliquot XML file");
      }
    }, (error) => {
      this.opening = false;
      this.displayToast("Could not open table, " + error);
    });
  }

  getCurrentFiles(): Observable<any> {
    return new Observable(observer => {
      let ob = new Observable<number>(observer2 => {
        this.storage.get('currentAliquot').then((file: FileEntry) => {
          if (!file)
            this.setCurrentAliquotAsDefault().subscribe(() => observer2.next(1));
          else {
            this.currentAliquot = file;
            this.fileUtil.fileExists(this.currentAliquot.fullPath.slice(1)).subscribe((exists) => {
              if (!exists)
                this.setCurrentAliquotAsDefault().subscribe(() => observer2.next(1));
              else
                observer2.next(1);
            }, error => observer2.next(1));
          }
        });
        this.storage.get('currentReportSettings').then((file: FileEntry) => {
          if (!file)
            this.setCurrentReportSettingsAsDefault().subscribe(() => observer2.next(1));
          else {
            this.currentReportSettings = file;
            this.fileUtil.fileExists(this.currentReportSettings.fullPath.slice(1)).subscribe((exists) => {
              if (!exists)
                this.setCurrentReportSettingsAsDefault().subscribe(() => observer2.next(1));
              else
                observer2.next(1);
            }, error => observer2.next(1));
          }
        });
      });

      let numFinsished = 0;
      ob.subscribe(value => {
        numFinsished++;
        if (numFinsished >= 2)
          observer.complete();
      });
    });
  }

  setCurrentAliquotAsDefault() {
    return new Observable<any>(observer => {
      this.fileUtil.getFile('chroni/Aliquots/Default Aliquot.xml').subscribe(
        (file: FileEntry) => {
          this.storage.set('currentAliquot', file);
          this.currentAliquot = file;
          observer.next();
        }, error => {
          console.log(JSON.stringify(error));
          observer.next();
        });
    });
  }

  setCurrentReportSettingsAsDefault() {
    return new Observable<any>(observer => {
      this.fileUtil.getFile('chroni/Report Settings/Default Report Settings.xml').subscribe(
        (file: FileEntry) => {
          this.storage.set('currentReportSettings', file);
          this.currentReportSettings = file;
          observer.next();
        }, error => {
          console.log(JSON.stringify(error));
          observer.next();
        });
    });
  }

  displayToast(text: string) {
    this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'bottom'
    }).present();
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
