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
const MY_IGSNS_URL: string = 'http://www.geochron.org/my_existing_igsns.php';

@Injectable()
export class GeochronUtility {

  private x2js: X2JS;

  constructor(private platform: Platform, private storage: Storage, private http: Http, private xmlUtil: XMLUtility, private fileUtil: FileUtility, private toastCtrl: ToastController) {
    this.platform.ready().then(() => this.x2js = new X2JS());
  }

  public downloadIGSN(igsn: string, username?: string, password?: string): Observable<boolean> {
    return new Observable(observer => {
      let url = BASE_ALIQUOT_URL + igsn;
      if (username && username !== '' && password && password !== '')
        url += '&username=' + username + '&password=' + password;
      const tempPath = igsn + "_temp_" + (new Date()).getMilliseconds().toString();
      this.fileUtil.downloadFile(url, tempPath, "temp").subscribe(
        (file: FileEntry) => {
          this.validateAndTransferTempFile(file).subscribe(
            (success: boolean) => observer.next(success),
            (error) => observer.error(error)
          );
        }, (error) => observer.error(error)
      );
    });
  }

  private validateAndTransferTempFile(file: FileEntry): Observable<boolean> {
    return new Observable(observer => {
      this.xmlUtil.convertXMLtoJSON(file, "temp").subscribe(json => {
        let type = null;
        let fileName = null;
        if (json && json['Aliquot']) {
          type = 'Aliquot';
          fileName = json['Aliquot']['aliquotName'];
        }
        if (json && json['ReportSettings']) {
          type = 'Report Settings';
          fileName = json['ReportSettings']['name'];
        }
        if (!type || !fileName) {
          this.displayToast("ERROR: the file specified is not a valid Aliquot or Report Settings XML file");
          this.fileUtil.removeFile(file.name, "temp");
          observer.next(false);
        } else {
          type += type === 'Aliquot' ? 's' : '';
          const newPath = 'chroni/' + type + '/' + fileName + '.xml';
          this.fileUtil.moveFile(file.name, newPath, true).subscribe(
            (newFile: FileEntry) => {
              this.displayToast(fileName + " has been successfully downloaded to the " + type + " directory");
              observer.next(true);
            }, (error) => {
              console.log(JSON.stringify(error));
              this.displayToast("ERROR: " + fileName + " could not be downloaded to the " + type + " directory");
              this.fileUtil.removeFile(file.name, "temp");
              observer.next(false);
            }
          );
        }
      }, (error) => {
        this.displayToast("ERROR: could not validate the file");
          this.fileUtil.removeFile(file.name, "temp");
          observer.next(false);
      });
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

  public validateCredentials(username: string, password: string): Observable<boolean> {
    let extractValid = (res: Response | any) => {
      let text = (res && res instanceof Response) && res.text();
      let match = (text && text.length > 0) && text.match(/<valid>.*<\/valid>/);
      if (match) {
        let resultJSON = this.x2js.xml2js(match[0]);
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
        (res: Response | any) => observer.error(extractValid(res)));
    });
  }

  public getMyGeochronIGSNs(username: string, password: string) {
    return new Observable(observer => {
      let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
      let options = new RequestOptions({ headers: headers });
      let data = 'username=' + encodeURI(username) + '&password=' + encodeURI(password) + '&submit=submit';
      this.http.post(MY_IGSNS_URL, data, options).subscribe(
        (res: Response) => {
          let igsns = res.json()['IGSNS']
          igsns = igsns && igsns.map(igsn => {
            const split = igsn.split('.');
            return split[split.length - 1];
          });
          observer.next(igsns);
        },
        (res: Response | any) => observer.error());
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
