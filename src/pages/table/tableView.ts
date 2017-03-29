import { Component, ViewChild } from '@angular/core';

import { Platform, Content, NavParams, MenuController, NavController } from 'ionic-angular';
import { ScreenOrientation } from 'ionic-native';
import { FileName } from '../viewFiles/viewFiles';

@Component({
  selector: 'page-tableView',
  templateUrl: 'tableView.html'
})
export class TableView {

  @ViewChild("headerScroll")
  headerEl: Content;
  @ViewChild("mainBodyScroll")
  mainBodyEl: Content;
  @ViewChild("leftBodyScroll")
  leftBodyEl: Content;

  aliquot: any;
  reportSettings: any;

  headerHeight: number = 0;
  bodyScrollHeight: number = 0;

  firstRowColSpans: Array<number> = [];
  columnLengths: Array<number> = [];
  cellHeight: number = 30;

  headerArray: Array<Array<string>> = [];
  fractionArray: Array<Array<string>> = [];

  constructor(public platform: Platform, public params: NavParams, public menu: MenuController, public navCtrl: NavController) {

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
    this.platform.ready().then(() => {
      ScreenOrientation.unlockOrientation();
    });

    this.calculateHeights(0);
    this.menu.swipeEnable(false, "sideMenu");

    // subscribes to table scrolling to scroll other relevant table pieces
    this.headerEl.ionScroll.subscribe(value => {
      this.mainBodyEl._scroll.setLeft(value.startX + value.deltaX);
    });
    this.leftBodyEl.ionScroll.subscribe(value => {
      this.mainBodyEl._scroll.setTop(value.startY + value.deltaY);
    });
    this.mainBodyEl.ionScroll.subscribe(value => {
      this.leftBodyEl._scroll.setTop(value.startY + value.deltaY);
      this.headerEl._scroll.setLeft(value.startX + value.deltaX);
    });
  }

  ionViewWillLeave() {
    this.platform.ready().then((val) => {
      ScreenOrientation.lockOrientation('portrait').catch((error) => console.log("Orientation Lock Error: " + error));
    });
    this.menu.swipeEnable(true, "sideMenu");
  }

}
