import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';

import { TablePage } from '../table/table';

import { HistoryUtility, HistoryEntry } from '../../utilities/HistoryUtility';

import { FileNameFromPathPipe } from '../../utilities/pipes/FileNameFromPath';

@Component({
  selector: 'page-history',
  templateUrl: 'history.html'
})
export class HistoryPage {

  history: Array<HistoryEntry> = [];
  opening: boolean = false;

  constructor(public navCtrl: NavController, private statusBar: StatusBar, private historyUtil: HistoryUtility) { }

  ionViewWillEnter() {
    this.history = this.historyUtil.getHistoryEntries();
  }

  openTable(i: number) {
    if (!this.opening) {
      this.opening = true;
      let report = this.historyUtil.getEntry(i).getReport();
      this.historyUtil.addEntry(new HistoryEntry(report, new Date()));

      this.opening = false;
      this.navCtrl.push(TablePage, { report: report });
    }
  }

  hideStatusBar() {
    this.statusBar.hide();
  }

}
