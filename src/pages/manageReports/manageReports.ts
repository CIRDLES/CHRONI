import { Component } from '@angular/core';
import { NavController, Platform, ModalController, ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs/Observable';
import { ThreeDeeTouch, ThreeDeeTouchQuickAction } from '@ionic-native/three-dee-touch';
import { FileEntry } from '@ionic-native/file';
import { StatusBar } from '@ionic-native/status-bar';

import { FileBrowser } from '../fileBrowser/fileBrowser';
import { TablePage } from '../table/table';

import { XMLUtility } from '../../utilities/XMLUtility';
import { Report, Aliquot, ReportSettings } from '../../utilities/ReportUtility';
import { FileUtility } from '../../utilities/FileUtility';
import { HistoryUtility, HistoryEntry } from '../../utilities/HistoryUtility';

import { FileNamePipe } from '../../utilities/pipes/FileName';

@Component({
  selector: 'page-manage-reports',
  templateUrl: 'manageReports.html'
})
export class ManageReportsPage {

  currentAliquot: FileEntry;
  currentReportSettings: FileEntry;
  opening: boolean = false;

  constructor(public navCtrl: NavController, private statusBar: StatusBar, private modalCtrl: ModalController, private platform: Platform, private storage: Storage, private xml: XMLUtility, private fileUtil: FileUtility, private historyUtil: HistoryUtility, private threeDeeTouch: ThreeDeeTouch, public toastCtrl: ToastController) {
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
        let aliquot: Aliquot = <Aliquot> al;
        this.xml.createReportSettings(this.currentReportSettings).subscribe(rs => {
          if (rs) {
            let reportSettings: ReportSettings = <ReportSettings> rs;
            let report = new Report(aliquot,
              reportSettings,
              this.xml.createTableData(aliquot, reportSettings)
            );
            let entry = new HistoryEntry(report, new Date());
            this.historyUtil.addEntry(entry);
            this.storage.set('currentAliquot', this.currentAliquot);
            this.storage.set('currentReportSettings', this.currentReportSettings);
            this.opening = false;
            this.navCtrl.push(TablePage, { report: report });
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
      position: 'bottom',
      cssClass: 'text-center'
    }).present();
  }

  hideStatusBar() {
    this.statusBar.hide();
  }

}
