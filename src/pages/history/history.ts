import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { Storage } from '@ionic/storage';

import { TablePage } from '../table/table';

import { HistoryUtility, HistoryEntry } from '../../utilities/HistoryUtility';

import { FileNamePipe } from '../../utilities/pipes/FileName';

@Component({
  selector: 'page-history',
  templateUrl: 'history.html'
})
export class HistoryPage {

  history: Array<HistoryEntry> = [];
  opening: boolean = false;
  hasOverlay: boolean = false;

  constructor(public navCtrl: NavController, private storage: Storage, private statusBar: StatusBar, private historyUtil: HistoryUtility) {
    this.storage.get('hasOverlay').then(
      (overlayed: boolean) => this.hasOverlay = overlayed,
      (error) => this.hasOverlay = false
    );
    this.history = this.historyUtil.getHistoryEntries();
  }

  ionViewWillEnter() {
    this.history = this.historyUtil.getHistoryEntries();
  }

  openTable(i: number) {
    if (!this.opening) {
      this.opening = true;
      let report = this.historyUtil.getEntry(i).getReport();

      this.navCtrl.push(TablePage, { report: report }).then(() => {
        this.opening = false;
        this.historyUtil.addEntry(new HistoryEntry(report, new Date()));
      });
    }
  }

  hideStatusBar(force: boolean = false) {
    (force || this.hasOverlay) && this.statusBar.hide();
  }

}
