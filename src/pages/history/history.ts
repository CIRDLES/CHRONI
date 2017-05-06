import { Component, Pipe } from '@angular/core';
import { HistoryUtility, HistoryEntry } from '../../utilities/HistoryUtility';

import { XMLUtility } from '../../utilities/XMLUtility';
import { Aliquot, ReportSettings } from '../../utilities/ReportUtility';
import { TableView } from '../table/tableView';
import { NavController, Platform, ModalController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

declare var cordova: any;

@Component({
  templateUrl: 'history.html'
})
export class History {

  history: Array<HistoryEntry> = [];
  opening: boolean = false;

  constructor(private platform: Platform, private historyUtil: HistoryUtility, private navCtrl: NavController, private xml: XMLUtility, private modalCtrl: ModalController, private storage: Storage) { }

  ionViewWillEnter() {
    this.history = this.historyUtil.getHistoryEntries();
  }

  openTable(i: number) {
    if (!this.opening) {
      this.opening = true;
      let report = this.historyUtil.getEntry(i).getReport();
      this.historyUtil.addEntry(new HistoryEntry(report, new Date()));

      this.opening = false;
      this.navCtrl.push(TableView, {
        report: report
      });
    }
  }

}

@Pipe({
  name: 'name'
})
export class Name {
  transform(value, args) {
    if (value && value !== '') {
      var split = value.split('/');
      if (split[split.length - 1] === '')
        return split[split.length - 2];
      else
        return split[split.length - 1];
    }
  }
}
