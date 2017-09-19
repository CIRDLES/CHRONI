import { Injectable } from '@angular/core';
import { FileEntry } from '@ionic-native/file';
import { Observable } from 'rxjs/Observable';

import { FileUtility } from './FileUtility';

@Injectable()
export class ReportUtility {

  constructor(private fileUtil: FileUtility) { }

  public aliquotToJSON(aliquot: Aliquot): any {
    return {
      name: aliquot.getName(),
      fractions: aliquot.getFractions(),
      images: aliquot.getImages(),
      fileEntryPath: aliquot.getFilePath()
    };
  }

  public aliquotFromJSON(aliquotJSON: any): Observable<Aliquot> {
    return new Observable(observer => {
      this.fileUtil.getFile(aliquotJSON['fileEntryPath']).subscribe((file: FileEntry) => {
        observer.next(new Aliquot(aliquotJSON['name'],
          aliquotJSON['fractions'],
          aliquotJSON['images'],
          file,
          this.fileUtil));
      }, (error) => observer.error(error));
    });
  }

  public reportSettingsToJSON(reportSettings: ReportSettings): any {
    return {
      categories: reportSettings.getCategories(),
      fileEntryPath: reportSettings.getFilePath()
    };
  }

  public reportSettingsFromJSON(reportSettingsJSON: any): Observable<ReportSettings> {
    return new Observable(observer => {
      this.fileUtil.getFile(reportSettingsJSON['fileEntryPath']).subscribe(
        (file: FileEntry) => observer.next(new ReportSettings(reportSettingsJSON['categories'], file)),
        (error) => observer.error(error));
    });
  }

  public reportToJSON(report: Report): any {
    return {
      aliquot: this.aliquotToJSON(report.getAliquot()),
      reportSettings: this.reportSettingsToJSON(report.getReportSettings()),
      tableArray: report.getTableArray()
    };
  }

  public reportFromJSON(reportJSON: any): Observable<Report> {
    return new Observable(observer => {
      this.aliquotFromJSON(reportJSON['aliquot']).subscribe(
        (aliquot: Aliquot) => {
          this.reportSettingsFromJSON(reportJSON['reportSettings']).subscribe(
            (reportSettings: ReportSettings) => {
              observer.next(new Report(aliquot, reportSettings, reportJSON['tableArray']));
            }, (error) => observer.error(error));
        }, (error) => observer.error(error));
    });
  }

}

export class Aliquot {

  private concordiaFile: FileEntry;
  private probabilityDensityFile: FileEntry;

  constructor(private name: string, private fractions: Array<any>, private images: Array<any>, private fileEntry: FileEntry, private fileUtil: FileUtility) {
    for (let imageObj of images) {
      if (imageObj["imageType"] === "concordia") {
        let fileName = this.getFileName().split('.xml')[0] + "_concordia.svg";
        this.fileUtil.fileExists(fileName, "cache").subscribe((exists: boolean) => {
          if (exists) {
            this.fileUtil.getFile(fileName, "cache").subscribe(
              (file: FileEntry) => this.concordiaFile = file
            );
          } else {
            this.fileUtil.downloadFile(imageObj["imageURL"], fileName, "cache").subscribe(
              (file: FileEntry) => this.concordiaFile = file
            );
          }
        });
      } else if (imageObj["imageType"] === "probability_density") {
        let fileName = this.name + "_probability_density.svg";
        this.fileUtil.fileExists(fileName, "cache").subscribe((exists: boolean) => {
          if (exists) {
            this.fileUtil.getFile(fileName, "cache").subscribe(
              (file: FileEntry) => this.probabilityDensityFile = file
            );
          } else {
            this.fileUtil.downloadFile(imageObj["imageURL"], fileName, "cache").subscribe(
              (file: FileEntry) => this.probabilityDensityFile = file
            );
          }
        });
      }
    }
  }

  public getFileName(): string {
    return this.fileEntry.name;
  }

  public setFileEntry(newFile: FileEntry) {
    this.fileEntry = newFile;
  }

  public getName(): string {
    return this.name;
  }

  public getFractions() {
    return this.fractions;
  }

  public getImages() {
    return this.images;
  }

  public hasConcordia() {
    return this.concordiaFile !== null;
  }

  public hasProbabilityDensity() {
    return this.probabilityDensityFile !== null;
  }

  public getProbabilityDensity(): FileEntry {
    return this.probabilityDensityFile;
  }

  public getConcordia(): FileEntry {
    return this.concordiaFile;
  }

  public setProbabilityDensity(probabilityDensity: FileEntry): void {
    this.probabilityDensityFile = probabilityDensity;
  }

  public setConcordia(concordia: FileEntry): void {
    this.concordiaFile = concordia;
  }

  public getFilePath(): string {
    return this.fileEntry.fullPath.slice(1);
  }

  public setFilePath(newPath: string) {
    if (newPath[0] !== '/')
      newPath = '/' + newPath;
    this.fileEntry.fullPath = newPath;
  }

}

export class ReportSettings {

  constructor(private categories: any, private fileEntry: FileEntry) { }

  public getCategories() {
    return this.categories;
  }

  public getFilePath(): string {
    return this.fileEntry.fullPath.slice(1);
  }

  public setFilePath(newPath: string) {
    this.fileEntry.fullPath = newPath;
  }

  public setFileEntry(newFile: FileEntry) {
    this.fileEntry = newFile;
  }

  public getFileName(): string {
    return this.fileEntry.name;
  }

  public static fromJSON(reportSettings: any): ReportSettings {
    return new ReportSettings(reportSettings['categories'],
      JSON.parse(reportSettings['fileEntry']));
  }

}

export class Report {

  private firstRowColSpans: Array<number> = [];
  private columnLengths: Array<number> = [];
  private displayArray: Array<Array<string>> = [];

  constructor(private aliquot: Aliquot, private reportSettings: ReportSettings, private tableArray: Array<Array<Array<string>>>) {
    // claculates the colspan values for the first row of Categories
    this.tableArray[1].forEach(categoryNames => {
      this.firstRowColSpans.push(categoryNames.length);
    });

    // alters the array so that it can be more easily placed within <th> tags
    for (let i = 0; i < this.tableArray.length; i++) {
      var category = this.tableArray[i];
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
      this.displayArray[i] = newCategory;
    }

    // first initializes all column lengths to 0 (uses the last row in header for this)
    for (let i = 0; i < this.displayArray[3].length; i++) {
      this.columnLengths.push(0);
    }
    // steps through each row except top one (displayArray contains row arrays which contain columns)
    for (let i = 1; i < this.displayArray.length; i++) {
      // steps through each column in the row
      for (let j = 0; j < this.displayArray[i].length; j++) {
        if (this.displayArray[i][j].length > this.columnLengths[j]) {
          // the column contains a longer item than already found, updates lengths array
          this.columnLengths[j] = this.displayArray[i][j].length;
        }
      }
    }
  }

  public getAliquot() {
    return this.aliquot;
  }

  public setAliquotPath(newPath: string) {
    if (newPath && newPath.length > 0)
      this.aliquot.setFilePath(newPath);
  }

  public setAliquotFileEntry(newFile: FileEntry) {
    if (newFile)
      this.aliquot.setFileEntry(newFile);
  }

  public getReportSettings() {
    return this.reportSettings;
  }

  public setReportSettingsPath(newPath: string) {
    if (newPath && newPath.length > 0)
      this.reportSettings.setFilePath(newPath);
  }

  public setReportSettingsFileEntry(newFile: FileEntry) {
    if (newFile)
      this.reportSettings.setFileEntry(newFile);
  }

  public getAliquotFileName() {
    return this.aliquot.getFileName();
  }

  public getReportSettingsFileName() {
    return this.reportSettings.getFileName();
  }

  public getFirstRowColSpans(): Array<number> {
    return this.firstRowColSpans;
  }

  public getColumnLengths(): Array<number> {
    return this.columnLengths;
  }

  public getTableArray(): Array<Array<Array<string>>> {
    return this.tableArray;
  }

  public getDisplayArray(): Array<Array<string>> {
    return this.displayArray;
  }

  public getHeaderArray(): Array<Array<string>> {
    return this.displayArray.slice(0, 4);
  }

  public getFractionArray(): Array<Array<string>> {
    return this.displayArray.slice(4);
  }

}
