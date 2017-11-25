import { FileEntry } from '@ionic-native/file';

export class ReportSettings {
  constructor(private categories: any, private fileEntry: FileEntry) {}

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
    return new ReportSettings(
      reportSettings['categories'],
      JSON.parse(reportSettings['fileEntry'])
    );
  }
}
