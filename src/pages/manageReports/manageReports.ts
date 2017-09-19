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
  entryFromHistory: HistoryEntry = null;

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
    let params = { directory: '' };

    if (directory === 'Aliquots')
      params.directory = '/chroni/Aliquots/';

    else if (directory === 'Report Settings')
      params.directory = '/chroni/Report Settings/';

    let fileViewer = this.modalCtrl.create(FileBrowser, params)
    fileViewer.present();

    fileViewer.onDidDismiss(file => {
      if (file) {
        if (directory === 'Aliquots')
          this.setCurrentAliquot(file);
        else if (directory === 'Report Settings')
          this.setCurrentReportSettings(file);
      }
    });
  }

  openTable() {
    this.opening = true;
    if (this.entryFromHistory) {
      // obtains the report from history if it exists
      let report = this.entryFromHistory.getReport();
      this.navCtrl.push(TablePage, { report: report }).then(() => this.afterTableOpened(report));
    } else {
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
              this.navCtrl.push(TablePage, { report: report }).then(() => this.afterTableOpened(report));
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
  }

  afterTableOpened(report: Report) {
    let entry = new HistoryEntry(report, new Date());
    this.historyUtil.addEntry(entry);
    this.storage.set('currentAliquot', this.currentAliquot);
    this.storage.set('currentReportSettings', this.currentReportSettings);
    this.opening = false;
    this.updateHistoryEntry();
  }

  getCurrentFiles(): Observable<any> {
    return new Observable(observer => {
      let ob = new Observable<number>(observer2 => {
        this.storage.get('currentAliquot').then((file: FileEntry) => {
          if (!file)
            this.setCurrentAliquotAsDefault().subscribe(() => observer2.next(1));
          else {
            this.setCurrentAliquot(file);
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
            this.setCurrentReportSettings(file);
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

  setCurrentAliquot(file: FileEntry) {
    this.currentAliquot = file;
    this.updateHistoryEntry();
  }

  setCurrentReportSettings(file: FileEntry) {
    this.currentReportSettings = file;
    this.updateHistoryEntry();
  }

  updateHistoryEntry() {
    let i = 0;
    let found = false;
    let entries: Array<HistoryEntry> = this.historyUtil.getHistoryEntries();
    if (this.currentAliquot && this.currentReportSettings) {
      while (!found && i < entries.length) {
        let entry: HistoryEntry = entries[i];
        if (entry.getAliquotPath() === this.currentAliquot.fullPath.slice(1) &&
            entry.getReportSettingsPath() === this.currentReportSettings.fullPath.slice(1)) {
          this.entryFromHistory = entry;
          found = true
        }
        i++;
      }
    }
    if (!found)
      this.entryFromHistory = null;
  }

  setCurrentAliquotAsDefault() {
    return new Observable<any>(observer => {
      this.fileUtil.getFile('chroni/Aliquots/Default Aliquot.xml').subscribe(
        (file: FileEntry) => {
          this.storage.set('currentAliquot', file);
          this.setCurrentAliquot(file);
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
          this.setCurrentReportSettings(file);
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
