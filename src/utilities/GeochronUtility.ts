import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Platform, ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { FileEntry } from '@ionic-native/file';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

import { XMLUtility } from './XMLUtility'
import { FileUtility } from './FileUtility'
import X2JS from 'x2js';

const CREDENTIALS_URL: string = "https://app.geosamples.org/webservices/credentials_service.php";
const BASE_ALIQUOT_URL: string = "http://www.geochronportal.org/getxml.php?igsn=";

@Injectable()
export class GeochronUtility {

  private x2js: X2JS;

  constructor(private platform: Platform, private storage: Storage, private http: Http, private xmlUtil: XMLUtility, private fileUtil: FileUtility, private toastCtrl: ToastController) {
    this.platform.ready().then(() => this.x2js = new X2JS());
  }

  public downloadIGSN(igsn: string, filePath: string, username?: string, password?: string): Observable<boolean> {
    return new Observable(observer => {
      let url = BASE_ALIQUOT_URL + igsn;
      if (username && username !== '' && password && password !== '')
        url += '&username=' + username + '&password=' + password;
      this.fileUtil.downloadFile(url, filePath, "temp").subscribe(
        (file: FileEntry) => {
          this.validateAndTransferTempFile(file).subscribe(
            (valid: boolean) => observer.next(valid),
            (error) => observer.error(error)
          );
        }, (error) => observer.error(error)
      );
    });
  }

  public downloadFromURL(url: string, fileName: string): Observable<boolean> {
    return new Observable(observer => {
      // downloads the file to a temp directory to check if it is valid
      this.fileUtil.downloadFile(url, fileName, "temp").subscribe((file: FileEntry) => {
        this.validateAndTransferTempFile(file).subscribe(
          (valid: boolean) => observer.next(valid),
          (error) => observer.error(error)
        );
      }, (error) => observer.error(error));
    });
  }

  private validateAndTransferTempFile(file: FileEntry): Observable<boolean> {
    return new Observable(observer => {
      let name = file.name;
      this.xmlUtil.checkFileValidity(file, "temp").subscribe((result: string) => {
        if (result === "Aliquot") {
          let path = "chroni/Aliquots/" + name;
          this.fileUtil.moveFile(name, path, true).subscribe(
            (newFile: FileEntry) => {
              this.displayToast(newFile.name + " has been successfully downloaded to the Aliquots directory");
              observer.next(true);
            }, (error) => {
              this.displayToast("ERROR: " + name + " could not be downloaded to the Aliquots directory");
              this.fileUtil.removeFile(name, "temp");
              observer.next(false);
            });
        } else if (result === "Report Settings") {
          let path = "chroni/Report Settings/" + name;
          this.fileUtil.moveFile(name, path, true).subscribe(
            (newFile: FileEntry) => {
              this.displayToast(name + " has been successfully downloaded to the Report Settings directory");
              observer.next(true);
            }, (error) => {
              this.displayToast("ERROR: " + name + " could not be downloaded to the Report Settings directory");
              this.fileUtil.removeFile(name, "temp");
              observer.next(false);
            });
        } else {
          this.displayToast("ERROR: the file specified is not a valid Aliquot or Report Settings XML file");
          this.fileUtil.removeFile(name, "temp");
          observer.next(false);
        }
      }, (error) => {
        this.displayToast("ERROR: the file specified is not a valid Aliquot or Report Settings XML file");
        this.fileUtil.removeFile(name, "temp");
        observer.next(false);
      });
    });
  }

  public validateCredentials(username: string, password: string): Observable<boolean> {
    let extractValid = (res: Response | any) => {
      if (res instanceof Response) {
        let resultJSON = this.x2js.xml2js(res.text().match(/<valid>.*<\/valid>/)[0]);
        return resultJSON && resultJSON['valid'] && resultJSON['valid'] === 'yes';
      } else
        return false;
    };
    return new Observable(observer => {
      let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
      let options = new RequestOptions({ headers: headers });
      let data = 'username=' + encodeURI(username) + '&password=' + encodeURI(password) + '&submit=submit';
      this.http.post(CREDENTIALS_URL, data, options).subscribe(
        (res: Response) => observer.next(extractValid(res)),
        (res: Response | any) => observer.next(extractValid(res)));
    });
  }

  public saveCurrentUser(username: string, password: string): Observable<any> {
    return new Observable(observer => {
      let ob = new Observable(observer2 => {
        this.storage.set('geochronUsername', username).then(
          (success) => observer2.next(1),
          (error) => observer2.next(1));
        this.storage.set('geochronPassword', password).then(
          (success) => observer2.next(1),
          (error) => observer2.next(1));
        this.storage.set('loggedIn', true).then(
          (success) => observer2.next(1),
          (error) => observer2.next(1));
      });
      let numFinsished = 0;
      ob.subscribe(value => {
        numFinsished++;
        if (numFinsished >= 3)
          observer.complete();
      });
    })
  }

  private displayToast(text: string) {
    this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'bottom',
      cssClass: 'text-center'
    }).present();
  }

}
