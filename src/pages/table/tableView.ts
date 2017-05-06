import { Component, ViewChild } from '@angular/core';

import { Platform, Col, NavParams, MenuController, NavController, PopoverController, ViewController, ModalController } from 'ionic-angular';
import { ScreenOrientation } from '@ionic-native/screen-orientation';

import { FileName } from '../viewFiles/viewFiles';
import { Report, Aliquot, ReportSettings } from '../../utilities/ReportUtility';

@Component({
  selector: 'page-tableView',
  templateUrl: 'tableView.html'
})
export class TableView {

  report: Report;

  headerHeight: number = 0;
  bodyScrollHeight: number = 0;

  firstRowColSpans: Array<number> = [];
  columnLengths: Array<number> = [];
  cellHeight: number = 30;

  headerArray: Array<Array<string>> = [];
  fractionArray: Array<Array<string>> = [];

  constructor(private platform: Platform, private params: NavParams, private menu: MenuController, private popoverCtrl: PopoverController, private navCtrl: NavController, private screenOrientation: ScreenOrientation) {

    this.bodyScrollHeight = window.screen.height;

    window.addEventListener("orientationchange", () => {
      this.headerHeight = null;
      this.bodyScrollHeight = window.screen.height;
      this.calculateHeights(1);
    });

    this.report = this.params.get("report");

    this.columnLengths = this.report.getColumnLengths();
    this.firstRowColSpans = this.report.getFirstRowColSpans();
    this.headerArray = this.report.getHeaderArray();
    this.fractionArray = this.report.getFractionArray();

  }

  calculateHeights(decrement) {
    // sets the height of the table body scroll view to fit the page properly
    var contentHeight = document.getElementById("tableContent").offsetHeight;
    var toolbarHeight = document.getElementById("toolbar").offsetHeight;

    // uses decrement to differentiate between first openin and screen rotation
    this.headerHeight = document.getElementById("tableHeadLeft").offsetHeight - decrement;
    this.bodyScrollHeight = (contentHeight - toolbarHeight - this.headerHeight);
  }

  showMenu(event: Event) {
    let popover = this.popoverCtrl.create(PopoverPage);
    popover.present({
      ev: event
    });
  }

  ionViewWillEnter() {
    this.platform.ready().then(_ => this.screenOrientation.unlock());

    this.calculateHeights(0);
    this.menu.swipeEnable(false, "sideMenu");

    this.initCustomScrolling();
  }

  initCustomScrolling() {
    let mainBodyEl: HTMLElement = document.getElementById('mainBodyScroll');
    let leftBodyEl: HTMLElement = document.getElementById('leftBodyScroll');
    let headerEl: HTMLElement = document.getElementById('headerScrollRight');

    mainBodyEl.addEventListener('scroll', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (mainBodyEl.scrollLeft !== headerEl.scrollLeft)
        headerEl.scrollLeft = mainBodyEl.scrollLeft;
      if (mainBodyEl.scrollTop !== leftBodyEl.scrollTop)
        leftBodyEl.scrollTop = mainBodyEl.scrollTop;
    });

    leftBodyEl.addEventListener('scroll', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (leftBodyEl.scrollTop !== mainBodyEl.scrollTop)
        mainBodyEl.scrollTop = leftBodyEl.scrollTop;
    });

    headerEl.addEventListener('scroll', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (headerEl.scrollLeft !== mainBodyEl.scrollLeft)
        mainBodyEl.scrollLeft = headerEl.scrollLeft;
    });
  }

  ionViewWillLeave() {
    this.platform.ready().then(_ => {
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT_PRIMARY);
    });
    this.menu.swipeEnable(true, "sideMenu");
  }
}

@Component({
  template: `
    <ion-list>
      <button ion-item (click)="close(); openConcordia()">Concordia</button>
      <button ion-item (click)="close(); openProbabilityDensity()">Probability Density</button>
      <button ion-item (click)="close(); openHelp()">Help</button>
    </ion-list>
  `
})
export class PopoverPage {
  constructor(private viewCtrl: ViewController, private modalCtrl: ModalController) { }

  openConcordia() {

  }

  openProbabilityDensity() {

  }

  close() {
    this.viewCtrl.dismiss();
  }
}
