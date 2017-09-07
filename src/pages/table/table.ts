import { Component, NgZone } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NavController, Platform, MenuController, NavParams, PopoverController, ViewController, ModalController, Modal } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { ScreenOrientation } from '@ionic-native/screen-orientation';

import { Report } from '../../utilities/ReportUtility';
import { FileUtility } from '../../utilities/FileUtility';

import { FileNamePipe } from '../../utilities/pipes/FileName';

import IScroll from  'iscroll';
import { CustomScroll } from '../../utilities/CustomScroll/CustomScroll';

@Component({
  selector: 'page-table',
  templateUrl: 'table.html'
})
export class TablePage {

  report: Report;

  headerHeight: number = 0;
  bodyScrollHeight: number = 0;

  firstRowColSpans: Array<number> = [];
  columnLengths: Array<number> = [];
  cellHeight: number = 30;

  headerArray: Array<Array<string>> = [];
  fractionArray: Array<Array<string>> = [];

  mainScroll: CustomScroll;
  leftScroll: CustomScroll;
  topScroll: CustomScroll;

  constructor(public navCtrl: NavController, private statusBar: StatusBar, private platform: Platform, private params: NavParams, private menu: MenuController, private popoverCtrl: PopoverController, private screenOrientation: ScreenOrientation, private zone: NgZone) {

    this.bodyScrollHeight = window.screen.height;

    window.addEventListener("orientationchange", () => {
      this.headerHeight = null;
      this.bodyScrollHeight = window.screen.height;
      this.calculateHeights(1);
      this.mainScroll.updateScrollHeight(this.bodyScrollHeight);
      this.leftScroll.updateScrollHeight(this.bodyScrollHeight);
      this.topScroll.updateScrollWidth(document.getElementById('mainBodyScroll').clientWidth);
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
    let popover = this.popoverCtrl.create(PopoverPage, { report: this.report });
    popover.present({
      ev: event
    });
    popover.onDidDismiss((data) => {
      if (data && data.modal) {
        data.modal.onDidDismiss(() => {
          // allows the table sections to scroll again
          document.getElementById('mainBodyScroll').style.overflow = "scroll";
          document.getElementById('leftBodyScroll').style.overflow = "scroll";
          document.getElementById('headerScrollRight').style.overflow = "scroll";
        });
      }
    });
  }

  ionViewWillEnter() {
    this.screenOrientation.unlock();

    this.calculateHeights(0);
    this.menu.swipeEnable(false, "left");
    this.menu.swipeEnable(false, "right");

    this.initCustomScrolling();
  }

  initCustomScrolling() {
    // must run outside of angular so events are fired properly
    this.zone.runOutsideAngular(() => {
      this.mainScroll = new CustomScroll('#mainBodyScroll', {
        bounce: false,
        scrollHeight: this.bodyScrollHeight
      });
      this.leftScroll = new CustomScroll('#leftBodyScroll', {
        bounce: false,
        scrollX: false,
        scrollHeight: this.bodyScrollHeight
      });
      this.topScroll = new CustomScroll('#headerScrollRight', {
        bounce: false,
        scrollY: false
      });
      this.mainScroll.addVerticalSync(this.leftScroll);
      this.mainScroll.addHorizontalSync(this.topScroll);
      this.leftScroll.addVerticalSync(this.mainScroll);
      this.topScroll.addHorizontalSync(this.mainScroll);
    });
  }

  ionViewWillLeave() {
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT_PRIMARY);
    this.menu.swipeEnable(true, "left");
    this.menu.swipeEnable(true, "right");
  }

  hideStatusBar() {
    this.statusBar.hide();
  }

}

@Component({
  template: `
    <ion-list>
      <button ion-item (click)="openConcordia(); close()">Concordia</button>
      <button ion-item (click)="openProbabilityDensity(); close()">Probability Density</button>
    </ion-list>
  `
})
export class PopoverPage {

  report: Report;
  modal: Modal;

  constructor(private viewCtrl: ViewController, private modalCtrl: ModalController, private params: NavParams) {
    this.report = this.params.get('report');
  }

  openConcordia() {
    let aliquot = this.report.getAliquot();
    if (aliquot.hasConcordia()) {
      this.modal = this.modalCtrl.create(ImageView, {
        title: 'Concordia',
        path: aliquot.getConcordia().fullPath.slice(1)
      });
      this.modal.present();
    }
  }

  openProbabilityDensity() {
    let aliquot = this.report.getAliquot();
    if (aliquot.hasProbabilityDensity()) {
      this.modal = this.modalCtrl.create(ImageView, {
        title: 'Probability Density',
        path: aliquot.getProbabilityDensity().fullPath.slice(1)
      });
      this.modal.present();
    }
  }

  close() {
    this.viewCtrl.dismiss({ modal: this.modal });
  }
}

@Component({
  template: `
    <ion-header id="header">
      <ion-toolbar>
        <ion-title>{{ title }}</ion-title>
        <ion-buttons end>
          <button ion-button clear (click)="dismiss()">Close</button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content no-bounce id="content">
      <ion-scroll zoom="true" scrollX="true" scrollY="true" style="width: 100%; height: 100%;">
        <div (DOMNodeInserted)="setSize()" [innerHTML]="imgData" style="padding: 8px 0px 0px 8px"></div>
      </ion-scroll>
    </ion-content>
  `,
  selector: 'page-imageView'
})
export class ImageView {

  title: string = '';
  imgData: SafeResourceUrl;
  originalImgData: string = '';

  height: number = 0;
  width: number = 0;

  constructor(private viewCtrl: ViewController, private params: NavParams, private fileUtil: FileUtility, private sanitizer: DomSanitizer) {
    this.title = this.params.get('title');
    let path = this.params.get('path');
    this.fileUtil.readFileText(path, "cache").subscribe((result: string) => {
      this.originalImgData = result;
      this.setSize();
    });
  }

  ionViewWillEnter() {
    // disables table section scrolling while modal is open
    document.getElementById('mainBodyScroll').style.overflow = "hidden";
    document.getElementById('leftBodyScroll').style.overflow = "hidden";
    document.getElementById('headerScrollRight').style.overflow = "hidden";
  }

  setSize() {
    // obtains the real SVG height and width if it has been inserted yet
    let el: any = document.getElementById('image');
    if (el) {
      let bbox = el.getBBox();
      this.height = bbox.height;
      this.width = bbox.width;
    }
    // must sanitize the SVG data to insert it inside of the div
    let idx = this.originalImgData.indexOf("<svg") + 4;
    this.imgData = this.sanitizer.bypassSecurityTrustHtml('<svg id="image" width="' + (this.width-20) + '" height="' + this.height + '"' + this.originalImgData.slice(idx));
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
