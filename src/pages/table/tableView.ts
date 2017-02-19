import { Component, ViewChild } from '@angular/core';

import { Platform, Content, NavParams, Scroll } from 'ionic-angular';
import { ScreenOrientation } from 'ionic-native';
import { Gesture } from 'ionic-angular/gestures/gesture';

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

    headerHeight: number = 0;
    bodyScrollHeight: number = 0;

    headerGesture: Gesture;
    mainBodyGesture: Gesture;
    leftBodyGesture: Gesture;

    firstRowColSpans: Array<number> = [];
    columnLengths: Array<number> = [];
    cellHeight: number = 30;

    headerArray: Array<Array<string>> = [];
    fractionArray: Array<Array<string>> = [];

    constructor(public platform: Platform, public params: NavParams) {

        this.bodyScrollHeight = window.screen.height;

        window.addEventListener("orientationchange", () => {
            this.headerHeight = null;
            this.bodyScrollHeight = window.screen.height;
            this.calculateHeights(1);
        });

        // now calculates the data to be displayed in the table

        var tableArray = this.params.get("tableArray");

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

    // scrollHeader(event) {
    //     console.log("SCROLLING HEADER...");
    //     // called when performing a header scroll to turn on the header scroll gesture
    //     // this.headerGesture.on('scroll', this.scrollHeader);
    //     this.headerEl.scrollElement.addEventListener('scroll', this.scrollHeader);
        
    //     // turns off the scrolling gesture for the main body and left body
    //     // this.mainBodyGesture.off('scroll', this.scrollMainBody);
    //     // this.leftBodyGesture.off('scroll', this.scrollLeftBody);
    //     this.mainBodyEl.scrollElement.removeEventListener('scroll', this.scrollMainBody);
    //     this.leftBodyEl.scrollElement.removeEventListener('scroll', this.scrollLeftBody);

    //     // scrolls the body with the header in the x direction
    //     // this.mainBodyEl.scrollTo(
    //     //     this.headerEl.getContentDimensions().contentLeft,
    //     //     this.mainBodyEl.getContentDimensions().contentTop
    //     // );
    //     this.mainBodyEl.scrollElement.scrollTo(
    //         this.headerEl.scrollElement.scrollLeft,
    //         this.mainBodyEl.scrollElement.scrollTop
    //     );
    // }

    // scrollMainBody(event) {
    //     console.log("SCROLLING MAIN BODY...");
    //     // called when performing a body scroll to turn on the body scroll gesture
    //     // this.mainBodyGesture.on('scroll', this.scrollMainBody);
    //     this.mainBodyEl.scrollElement.addEventListener('scroll', this.scrollMainBody);

    //     // turns off the scrolling gesture for the header and left body
    //     // this.headerGesture.off('scroll', this.scrollHeader);
    //     // this.leftBodyGesture.off('scroll', this.scrollLeftBody);
    //     this.headerEl.scrollElement.removeEventListener('scroll', this.scrollHeader);
    //     this.leftBodyEl.scrollElement.removeEventListener('scroll', this.scrollLeftBody);

    //     // var mainPosition = this.mainBodyEl.getContentDimensions();

    //     // scrolls the header with the main body in the x direction
    //     // this.headerEl.scrollTo(
    //     //     mainPosition.contentLeft,
    //     //     this.headerEl.getContentDimensions().contentTop
    //     // );
    //     this.headerEl.scrollElement.scrollTo(
    //         this.mainBodyEl.scrollElement.scrollLeft,
    //         this.headerEl.scrollElement.scrollTop
    //     );

    //     // scrolls the left body with the main body in the y direction
    //     // this.leftBodyEl.scrollTo(
    //     //     this.leftBodyEl.getContentDimensions().contentLeft,
    //     //     mainPosition.contentTop
    //     // );
    //     this.leftBodyEl.scrollElement.scrollTo(
    //         this.leftBodyEl.scrollElement.scrollLeft,
    //         this.mainBodyEl.scrollElement.scrollTop
    //     );
    // }

    // scrollLeftBody(event) {
    //     console.log("SCROLLING LEFT BODY...");
    //     // called when performing a body scroll to turn on the body scroll gesture
    //     // this.leftBodyGesture.on('scroll', this.scrollLeftBody);
    //     this.leftBodyEl.scrollElement.addEventListener('scroll', this.scrollLeftBody);

    //     // turns off the scrolling gesture for the header and main body
    //     // this.mainBodyGesture.off('scroll', this.scrollMainBody);
    //     // this.headerGesture.off('scroll', this.scrollHeader);
    //     this.mainBodyEl.scrollElement.removeEventListener('scroll', this.scrollMainBody);
    //     this.headerEl.scrollElement.removeEventListener('scroll', this.scrollHeader);

    //     // scrolls the main body with the left body in the y direction
    //     // this.mainBodyEl.scrollTo(
    //     //     this.mainBodyEl.getContentDimensions().contentLeft,
    //     //     this.leftBodyEl.getContentDimensions().contentTop
    //     // );
    //     this.mainBodyEl.scrollElement.scrollTo(
    //         this.mainBodyEl.scrollElement.scrollLeft,
    //         this.leftBodyEl.scrollElement.scrollTop
    //     );
    // }

    calculateHeights(decrement) {
        // sets the height of the table body scroll view to fit the page properly
        var contentHeight = document.getElementById("tableContent").offsetHeight;
        var buttonDivHeight = document.getElementById("tableButtonDiv").offsetHeight;

        // uses decrement to differentiate between first openin and screen rotation
        this.headerHeight = document.getElementById("tableHeadLeft").offsetHeight - decrement;
        this.bodyScrollHeight = (contentHeight - buttonDivHeight - this.headerHeight);
    };

    ionViewDidEnter() {
        this.calculateHeights(0);
    }

    ionViewWillEnter() {
        this.platform.ready().then(() => {
            ScreenOrientation.unlockOrientation();
        });
    }

    ngAfterViewInit() {
        // this.headerScroll = <HTMLElement> document.getElementById("headerScrollRight").firstChild;
        // this.mainBodyScroll = <HTMLElement> document.getElementById("mainBodyScroll").firstChild;
        // this.leftBodyScroll = <HTMLElement> document.getElementById("leftBodyScroll").firstChild;

        this.headerEl.statusbarPadding = false;

        this.headerEl.ionScroll.subscribe(value => {
            console.log("he: " + JSON.stringify(value));
        });

        this.headerEl.ionScroll.subscribe(value => {
            console.log("hey: " + JSON.stringify(value));
            this.mainBodyEl._scroll.setLeft(value.startX + value.deltaX);
        });

        this.headerEl.ionScrollEnd.subscribe(value => {
            this.mainBodyEl._scroll.scrollTo(value.startX + value.deltaX, value.startY, 1000);
        });
        

        // sets scrolling gestures
        // this.headerGesture = new Gesture(this.headerEl.getNativeElement());
        // this.headerGesture.listen();
        // this.headerGesture.on('scroll', this.scrollHeader);

        // this.mainBodyGesture = new Gesture(this.mainBodyEl.getNativeElement());
        // this.mainBodyGesture.listen();
        // this.mainBodyGesture.on('scroll', this.scrollMainBody);

        // this.leftBodyGesture = new Gesture(this.leftBodyEl.getNativeElement());
        // this.leftBodyGesture.listen();
        // this.leftBodyGesture.on('scroll', this.scrollLeftBody);
    }

    ionViewWillLeave() {
        this.platform.ready().then((val) => {
            ScreenOrientation.lockOrientation('portrait').catch((error) => console.log("Orientation Lock Error: " + error));
        });
    }

}