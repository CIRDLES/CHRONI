import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs/Observable';

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
  private historyJSON: Array<any> = [];
  private historyEntries: Array<HistoryEntry> = [];

  constructor(private storage: Storage, private fileUtil: FileUtility, private reportUtil: ReportUtility) {

    this.storage.get('history').then((result) => {
      if (result) {
        this.historyJSON = result;
        this.createEntriesFromJSON(this.historyJSON).subscribe(
          (entries: Array<HistoryEntry>) => this.historyEntries = entries
        );
      }
    }, (error) => console.log(JSON.stringify(error)));

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
      this.removeIndex(index);

    this.historyEntries.unshift(entry);
    this.historyJSON.unshift(this.historyEntryToJSON(entry));
    this.trimToSize();
    this.saveHistory();
  }

  public removeIndex(index: number) {
    this.historyEntries.splice(index, 1);
    this.historyJSON.splice(index, 1);
  }

  public saveHistory() {
    this.storage.set('history', this.historyJSON);
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
    if (this.historyJSON.length > this.maxSize)
      this.historyJSON = this.historyJSON.slice(0, this.maxSize);
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
        if (finished == jsonItems.length) {
          observer.next(entries);
        }
      });
    });
  }

  public getHistoryEntries(): Array<HistoryEntry> {
    return this.historyEntries;
  }

  public getHistoryJSONList() {
    return this.historyJSON;
  }

  public getEntry(index: number) {
    if (index >= this.historyEntries.length)
      throw new RangeError('Index out of bounds...');

    return this.historyEntries[index];
  }

  public getHistoryJSON(index: number) {
    if (index >= this.historyJSON.length)
      throw new RangeError('Index out of bounds...');

    return this.historyJSON[index];
  }

  public getMaxSize() {
    return this.maxSize;
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
        (report: Report) =>
          observer.next(new HistoryEntry(report, historyEntryJSON['date']))
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

  public getReportSettingsPath() {
    return this.report.getReportSettings().getFilePath();
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
