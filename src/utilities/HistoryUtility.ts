import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs/Observable';
import { FileEntry } from '@ionic-native/file';

import { ReportUtility } from './ReportUtility';
import { FileUtility } from './FileUtility';

import { Report, HistoryEntry } from '../models';

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
              this.checkValidity(entries, jsonResult).subscribe();
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
            entries.forEach((entry: HistoryEntry, i: number) => {
              if (entry && positionsToDelete.indexOf(i) < 0)
                newEntries.push(entry);
            });
            observer.next(newEntries);
          }
        }, (error) => console.log(JSON.stringify(error))
      );
    });
  }

  public checkValidity(entries: Array<HistoryEntry> = null, json: any = null): Observable<any> {
    return new Observable(observer => {
      entries = entries || this.historyEntries;
      json = json || this.getHistoryJSONList();
      // ensures all files are still valid (deletes if necessary and saves the new JSON object)
      this.ensureEntryFiles(entries, json).subscribe((validEntries: Array<HistoryEntry>) => {
        this.historyEntries = validEntries;
        this.saveHistory();
        observer.next(this.historyEntries.length !== validEntries.length);
      }, (error) => observer.error(error));
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
