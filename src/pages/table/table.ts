import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';

@Component({
  selector: 'page-table',
  templateUrl: 'table.html'
})
export class TablePage {

  constructor(public navCtrl: NavController, private statusBar: StatusBar) { }

  hideStatusBar() {
    this.statusBar.hide();
  }

}
