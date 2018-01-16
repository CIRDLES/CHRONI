import { Aliquot, ReportSettings } from '.';

import { FileEntry } from '@ionic-native/file';

export class Report {
  private firstRowColSpans: Array<number> = [];
  private columnLengths: Array<number> = [];
  private displayArray: Array<Array<string>> = [];

  constructor(
    private aliquot: Aliquot,
    private reportSettings: ReportSettings,
    private tableArray: Array<Array<Array<string>>>
  ) {
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
          if (item && item != '') {
            // accounts for spaces, as HTML will remove them
            if (i > 4 && item.includes(' ')) {
              var re = new RegExp('\u0020', 'g');
              item = item.replace(re, '\u00A0');
            }
            newCategory.push(item);
          } else
            // puts just a space in if the field is empty
            newCategory.push('\u00A0');
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
    if (newPath && newPath.length > 0) this.aliquot.setFilePath(newPath);
  }

  public setAliquotFileEntry(newFile: FileEntry) {
    if (newFile) this.aliquot.setFileEntry(newFile);
  }

  public getReportSettings() {
    return this.reportSettings;
  }

  public setReportSettingsPath(newPath: string) {
    if (newPath && newPath.length > 0) this.reportSettings.setFilePath(newPath);
  }

  public setReportSettingsFileEntry(newFile: FileEntry) {
    if (newFile) this.reportSettings.setFileEntry(newFile);
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
