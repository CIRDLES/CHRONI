import { Injectable } from '@angular/core';
import { FileEntry } from '@ionic-native/file';
import { Observable } from 'rxjs/Observable';

import { FileUtility } from './FileUtility';
import { Aliquot, ReportSettings } from '../models';

import { Report } from '../models';

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
