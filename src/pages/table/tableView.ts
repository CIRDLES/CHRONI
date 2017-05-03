import { Component, ViewChild } from '@angular/core';

import { Platform, Col, NavParams, MenuController, NavController } from 'ionic-angular';
import { ScreenOrientation } from '@ionic-native/screen-orientation';

import { FileName } from '../viewFiles/viewFiles';

@Component({
  selector: 'page-tableView',
  templateUrl: 'tableView.html'
})
export class TableView {

  aliquot: any;
  reportSettings: any;

  headerHeight: number = 0;
  bodyScrollHeight: number = 0;

  firstRowColSpans: Array<number> = [];
  columnLengths: Array<number> = [];
  cellHeight: number = 30;

  headerArray: Array<Array<string>> = [];
  fractionArray: Array<Array<string>> = [];

  constructor(public platform: Platform, public params: NavParams, public menu: MenuController, public navCtrl: NavController, private screenOrientation: ScreenOrientation) {

    this.bodyScrollHeight = window.screen.height;

    window.addEventListener("orientationchange", () => {
      this.headerHeight = null;
      this.bodyScrollHeight = window.screen.height;
      this.calculateHeights(1);
    });

    // now calculates the data to be displayed in the table

    var tableArray = this.params.get("tableArray");
    this.aliquot = this.params.get("aliquot");
    this.reportSettings = this.params.get("reportSettings");

    // claculates the colspan values for the first row of Categories
    tableArray[1].forEach(categoryNames => {
      this.firstRowColSpans.push(categoryNames.length);
    });

    // alters the array so that it can be more easily placed within <th> tags
    var displayArray = tableArray;
    for (let i = 0; i < displayArray.length; i++) {
      var category = displayArray[i];
      var newCategory = [];
      category.forEach(function(column) {
        column.forEach(function(item, itemIndex) {
          if (item && item != "") {
            // accounts for spaces, as HTML will remove them
            if (i > 4 && item.includes(" ")) {
              var re = new RegExp("\u0020", "g");
              item = item.replace(re, "\u00A0");
            }
            newCategory.push(item);
          } else
            // puts just a space in if the field is empty
            newCategory.push("\u00A0");


        });
      });
      displayArray[i] = newCategory;
    }

    // first initializes all column lengths to 0 (uses the last row in header for this)
    for (let i = 0; i < displayArray[3].length; i++) {
      this.columnLengths.push(0);
    }
    // steps through each row except top one (displayArray contains row arrays which contain columns)
    for (let i = 1; i < displayArray.length; i++) {
      // steps through each column in the row
      for (let j = 0; j < displayArray[i].length; j++) {
        if (displayArray[i][j].length > this.columnLengths[j]) {
          // the column contains a longer item than already found, updates lengths array
          this.columnLengths[j] = displayArray[i][j].length;
        }
      }
    }

    this.headerArray = displayArray.slice(0, 4);
    this.fractionArray = displayArray.slice(4);
  }

  calculateHeights(decrement) {
    // sets the height of the table body scroll view to fit the page properly
    var contentHeight = document.getElementById("tableContent").offsetHeight;
    var toolbarHeight = document.getElementById("toolbar").offsetHeight;

    // uses decrement to differentiate between first openin and screen rotation
    this.headerHeight = document.getElementById("tableHeadLeft").offsetHeight - decrement;
    this.bodyScrollHeight = (contentHeight - toolbarHeight - this.headerHeight);
  };

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
