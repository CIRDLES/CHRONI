import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

/**
 * Entry Schema:
 *     aliquot: string (filename),
 *     reportSettings: string (filename),
 *     date: Date
 */

@Injectable()
export class HistoryUtility {

    maxSize: number = 10;
    history: Array<any> = [];

    constructor(public storage: Storage) {

        this.storage.get('history').then((result) => {
            history = result;
        }, (error) => {
            this.storage.set('history', history);
        });

    }

    addEntry(entry: any) {
        this.history.unshift(entry);
        this.trimToSize();
        this.saveHistory();
    }

    trimToSize() {
        if (this.history.length > this.maxSize)
            this.history = this.history.slice(0, this.maxSize);
    }

    saveHistory() {
        this.storage.set('history', this.history);
    }

    getHistory() {
        return this.history;
    }

    getMaxSize() {
        return this.maxSize;
    }

}