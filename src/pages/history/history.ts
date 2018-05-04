import { Component } from '@angular/core';
import { NavController, PopoverController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { Storage } from '@ionic/storage';
import { TablePage } from '../table/table';
import { PopoverPage } from '../popover/popover';
import { HistoryEntry } from '../../models';
import { HistoryUtility } from '../../utilities/HistoryUtility';
import { FileNamePipe } from '../../utilities/pipes/FileName';

@Component({
  selector: 'page-history',
  templateUrl: 'history.html'
})
export class HistoryPage {

  history: Array<HistoryEntry> = [];
  opening: boolean = false;
  hasOverlay: boolean = false;

  constructor(public navCtrl: NavController, private storage: Storage, private statusBar: StatusBar, private historyUtil: HistoryUtility, private popoverCtrl: PopoverController) {
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

  showPopoverMenu(event) {
    let popover = this.popoverCtrl.create(PopoverPage);
    popover.present({
      ev: event
    });
  }

}
