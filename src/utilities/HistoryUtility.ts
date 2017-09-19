import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs/Observable';
import { FileEntry } from '@ionic-native/file';

import { ReportUtility, Report } from './ReportUtility';
import { FileUtility } from './FileUtility';

/**
 * Entry Schema:
 *     aliquot: string (filename),
 *     reportSettings: string (filename),
 *     date: Date
 */

@Injectable()
export class HistoryUtility {

  private maxSize: number = 10;
  // private historyJSON: Array<any> = [];
  private historyEntries: Array<HistoryEntry> = [];

  constructor(private platform: Platform, private storage: Storage, private fileUtil: FileUtility, private reportUtil: ReportUtility) {
    this.platform.ready().then(() => {
      this.storage.get('history').then((jsonResult) => {
        if (jsonResult) {
          // first creates the entry objects from the stored JSON object
          this.createEntriesFromJSON(jsonResult).subscribe(
            (entries: Array<HistoryEntry>) => {
              // then ensures all files are still valid (deletes if necessary
              // and saves the new JSON object)
              this.ensureEntryFiles(entries, jsonResult).subscribe((validEntries: Array<HistoryEntry>) => {
                this.historyEntries = validEntries;
                this.saveHistory();
              });
          });
        }
      }, (error) => console.log(JSON.stringify(error)));
    });
  }

  public addEntry(entry: HistoryEntry) {
    let place = 0;
    let index = -1;

    for (let x of this.historyEntries) {
      if (entry.getAliquotPath() === x.getAliquotPath()
        && entry.getReportSettingsPath() === x.getReportSettingsPath())
        index = place;
      place++;
    }
    if (index > -1)
      this.removeEntry(index);

    this.historyEntries.unshift(entry);
    // this.historyJSON.unshift(this.historyEntryToJSON(entry));
    this.trimToSize();
    this.saveHistory();
  }

  public updateEntry(index: number, newEntry: HistoryEntry) {
    this.historyEntries[index] = newEntry;
    // this.historyJSON[index] = this.historyEntryToJSON(newEntry);
    this.saveHistory();
  }

  public removeEntry(index: number) {
    this.historyEntries.splice(index, 1);
    // this.historyJSON.splice(index, 1);
    this.saveHistory();
  }

  public saveHistory() {
    this.storage.set('history', this.historyEntriesToJSON(this.historyEntries));
  }

  private trimToSize() {
    if (this.historyEntries.length > this.maxSize) {
      // deletes the concordia and probability density files
      let aliquot = this.historyEntries[this.maxSize].getReport().getAliquot();
      if (aliquot.hasConcordia())
        this.fileUtil.removeFile(aliquot.getConcordia().fullPath.slice(1), "cache");
      if (aliquot.hasProbabilityDensity())
        this.fileUtil.removeFile(aliquot.getProbabilityDensity().fullPath.slice(1), "cache");

      this.historyEntries = this.historyEntries.slice(0, this.maxSize);
    }
    // if (this.historyJSON.length > this.maxSize)
    //   this.historyJSON = this.historyJSON.slice(0, this.maxSize);
  }

  private createEntriesFromJSON(jsonItems: Array<any>): Observable<Array<HistoryEntry>> {
    return new Observable(observer => {
      let entries: Array<HistoryEntry> = [];
      let ob = new Observable(observer2 => {
        if (jsonItems.length == 0)
          observer2.next(0)
        else {
          for (let i in jsonItems)
            entries.push(null);
          for (let i in jsonItems) {
            this.historyEntryFromJSON(jsonItems[i]).subscribe((entry) => {
              entries[i] = entry;
              observer2.next(1);
            }, (error) => observer2.next(1));
          }
        }
      });

      let finished: number = 0;
      ob.subscribe((i: number) => {
        finished += i;
        if (finished === jsonItems.length)
          observer.next(entries);
      });
    });
  }

  private ensureEntryFiles(entries: Array<HistoryEntry>, jsonItems: any): Observable<Array<HistoryEntry>> {
    return new Observable(observer => {
      let finished = 0;
      let positionsToDelete: Array<number> = [];
      let ob = new Observable(observer2 => {
        entries.forEach((entry, i) => {
          if (!entry) {
            let aliquotPath = jsonItems[i].report.aliquot.fileEntryPath;
            let reportSettingsPath = jsonItems[i].report.reportSettings.fileEntryPath;
            this.fileUtil.fileExists(aliquotPath).subscribe((exists1: boolean) => {
              this.fileUtil.fileExists(reportSettingsPath).subscribe((exists2: boolean) => {
                finished++;
                observer2.next(i);
              });
            });
          } else {
            finished++;
            observer2.next();
          }
        });
      });
      ob.subscribe(
        (index: number) => {
          index && positionsToDelete.push(index);
          if (finished === entries.length) {
            let newEntries: Array<HistoryEntry> = [];
            let newJson: any = [];
            entries.forEach((entry: HistoryEntry, i: number) => {
              if (positionsToDelete.indexOf(i) < 0) {
                newEntries.push(entries[i]);
                newJson.push(jsonItems[i]);
              }
            });
            // this.historyJSON = newJson;
            this.historyEntries = newEntries;
            // this.saveHistory();
            observer.next(entries);
          }
        }, (error) => console.log(JSON.stringify(error))
      );
    });
  }

  public getHistoryEntries(): Array<HistoryEntry> {
    return this.historyEntries;
  }

  public getHistoryJSONList() {
    return this.historyEntriesToJSON(this.historyEntries);
  }

  public getEntry(index: number) {
    if (index >= this.historyEntries.length)
      throw new RangeError('Index out of bounds...');

    return this.historyEntries[index];
  }

  // public getHistoryJSON(index: number) {
  //   if (index >= this.historyJSON.length)
  //     throw new RangeError('Index out of bounds...');
  //
  //   return this.historyJSON[index];
  // }

  public getMaxSize() {
    return this.maxSize;
  }

  public historyEntriesToJSON(historyEntries: Array<HistoryEntry>) {
    let json = [];
    for (let entry of historyEntries) {
      json.push(this.historyEntryToJSON(entry));
    }
    return json;
  }

  public historyEntryToJSON(historyEntry: HistoryEntry): any {
    return {
      report: this.reportUtil.reportToJSON(historyEntry.getReport()),
      date: historyEntry.getDate()
    };
  }

  public historyEntryFromJSON(historyEntryJSON: any): Observable<HistoryEntry> {
    return new Observable(observer => {
      this.reportUtil.reportFromJSON(historyEntryJSON['report']).subscribe(
        (report: Report) => observer.next(new HistoryEntry(report, historyEntryJSON['date'])),
        (error) => observer.error(error)
      );
    });
  }

}

export class HistoryEntry {

  private date: Date;

  constructor(private report: Report, date: Date) {
    this.date = date;
  }

  public getAliquotPath() {
    return this.report.getAliquot().getFilePath();
  }

  public setAliquotFileEntry(newFile: FileEntry) {
    if (newFile)
      this.report.setAliquotFileEntry(newFile);
  }

  public getReportSettingsPath() {
    return this.report.getReportSettings().getFilePath();
  }

  public setReportSettingsFileEntry(newFile: FileEntry) {
    if (newFile)
      this.report.setReportSettingsFileEntry(newFile);
  }

  public aliquotInDirectory(path: string): boolean {
    if (path[0] === '/')
      path = path.slice(1);
    return this.getAliquotPath().split(path).length > 1;
  }

  public reportSettingsInDirectory(path: string): boolean {
    if (path[0] === '/')
      path = path.slice(1);
    return this.getReportSettingsPath().split(path).length > 1;
  }

  public updateAliquotPathPortion(oldPortion: string, newPortion: string): boolean {
    let updated: boolean = false;
    if (this.aliquotInDirectory(oldPortion)) {
      if (oldPortion[0] !== '/')
        oldPortion = '/' + oldPortion;
      if (newPortion[0] !== '/')
        newPortion = '/' + newPortion;
      let split: Array<string> = ('/' + this.getAliquotPath()).split(oldPortion);
      let rightSide: string = split[split.length - 1];
      this.report.setAliquotPath(newPortion + rightSide);
      updated = true;
    }
    return updated;
  }

  public updateReportSettingsPathPortion(oldPortion: string, newPortion: string) {
    let updated: boolean = false;
    if (this.reportSettingsInDirectory(oldPortion)) {
      if (oldPortion[0] !== '/')
        oldPortion = '/' + oldPortion;
      if (newPortion[0] !== '/')
        newPortion = '/' + newPortion;
      let split: Array<string> = ('/' + this.getReportSettingsPath()).split(oldPortion);
      let rightSide: string = split[split.length - 1];
      this.report.setReportSettingsPath(newPortion + rightSide);
      updated = true;
    }
    return updated;
  }

  public getReport(): Report {
    return this.report;
  }

  public setReport(report: Report) {
    this.report = report;
  }

  public getDate(): Date {
    return this.date;
  }

  public setDate(newDate: Date) {
    this.date = newDate;
  }

}
