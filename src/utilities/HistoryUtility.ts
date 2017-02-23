import { Component, Injectable } from '@angular/core';
import { FileEntry } from 'ionic-native';
import { Storage } from '@ionic/storage';

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

    constructor(public storage: Storage) {

        this.storage.get('history').then((result) => {
            if (result) {
                this.historyJSON = result;
                this.historyEntries = this.createEntriesFromJSON(this.historyJSON);
            }
        }, (error) => {
            this.storage.set('history', history);
        });

    }

    public addEntry(entry: HistoryEntry) {
        this.historyEntries.unshift(entry);
        this.historyJSON.unshift(entry.toJSON());
        this.trimToSize();
        this.saveHistory();
    }

    public saveHistory() {
        this.storage.set('history', this.historyJSON);
    }

    private trimToSize() {
        if (this.historyEntries.length > this.maxSize)
            this.historyEntries = this.historyEntries.slice(0, this.maxSize);
        if (this.historyJSON.length > this.maxSize)
            this.historyJSON = this.historyJSON.slice(0, this.maxSize);
    }

    private createEntriesFromJSON(jsonItems: Array<any>) {
        var entries: Array<HistoryEntry> = [];
        for (let item of jsonItems) {
            var entry: HistoryEntry = new HistoryEntry(
                item['aliquot'],
                item['reportSettings'],
                item['date']
            );
            entries.push(entry);
        }
        return entries;
    }

    public getHistoryEntries(): Array<HistoryEntry> {
        return this.historyEntries;
    }

    public getHistoryJSONList() {
        return this.historyJSON;
    }

    public getHistoryEntry(index: number) {
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

}

export class HistoryEntry {

    private _aliquotFile: FileEntry;
    private _reportSettingsFile: FileEntry;
    private _date: Date;

    constructor(aliquotFile: FileEntry, reportSettingsFile: FileEntry, date: Date) {
        this._aliquotFile = aliquotFile;
        this._reportSettingsFile = reportSettingsFile
        this._date = date;
    }

    public getAliquotFile(): FileEntry {
        return this._aliquotFile;
    }

    public getReportSettingsFile(): FileEntry {
        return this._reportSettingsFile;
    }

    public getDate(): Date {
        return this._date;
    }

    public setAliquotFile(newFile: FileEntry) {
        this._aliquotFile = newFile;
    }

    public setReportSettingsFile(newFile: FileEntry) {
        this._reportSettingsFile = newFile;
    }

    public setDate(newDate: Date) {
        this._date = newDate;
    }

    public toJSON() {
        return {
            aliquot: this._aliquotFile,
            reportSettings: this._reportSettingsFile,
            date: this._date
        };
    }

}
