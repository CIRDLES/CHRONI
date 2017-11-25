import { Report } from '../models';

import { FileEntry } from '@ionic-native/file';

export class HistoryEntry {
  private date: Date;

  constructor(private report: Report, date: Date) {
    this.date = date;
  }

  public getAliquotPath() {
    return this.report.getAliquot().getFilePath();
  }

  public setAliquotFileEntry(newFile: FileEntry) {
    if (newFile) this.report.setAliquotFileEntry(newFile);
  }

  public getReportSettingsPath() {
    return this.report.getReportSettings().getFilePath();
  }

  public setReportSettingsFileEntry(newFile: FileEntry) {
    if (newFile) this.report.setReportSettingsFileEntry(newFile);
  }

  public aliquotInDirectory(path: string): boolean {
    if (path[0] === '/') path = path.slice(1);
    return this.getAliquotPath().split(path).length > 1;
  }

  public reportSettingsInDirectory(path: string): boolean {
    if (path[0] === '/') path = path.slice(1);
    return this.getReportSettingsPath().split(path).length > 1;
  }

  public updateAliquotPathPortion(
    oldPortion: string,
    newPortion: string
  ): boolean {
    let updated: boolean = false;
    if (this.aliquotInDirectory(oldPortion)) {
      if (oldPortion[0] !== '/') oldPortion = '/' + oldPortion;
      if (newPortion[0] !== '/') newPortion = '/' + newPortion;
      let split: Array<string> = ('/' + this.getAliquotPath()).split(
        oldPortion
      );
      let rightSide: string = split[split.length - 1];
      this.report.setAliquotPath(newPortion + rightSide);
      updated = true;
    }
    return updated;
  }

  public updateReportSettingsPathPortion(
    oldPortion: string,
    newPortion: string
  ) {
    let updated: boolean = false;
    if (this.reportSettingsInDirectory(oldPortion)) {
      if (oldPortion[0] !== '/') oldPortion = '/' + oldPortion;
      if (newPortion[0] !== '/') newPortion = '/' + newPortion;
      let split: Array<string> = ('/' + this.getReportSettingsPath()).split(
        oldPortion
      );
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
