import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Platform } from 'ionic-angular';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { Storage } from '@ionic/storage';
import X2JS from 'x2js';

import { XMLUtility } from './XMLUtility'

const GEOCHRON_URL: string = "https://app.geosamples.org/webservices/credentials_service.php";

@Injectable()
export class GeochronUtility {

  private x2js: X2JS;

  constructor(private platform: Platform, private storage: Storage, private http: Http, private xml: XMLUtility) {
    this.platform.ready().then(() => this.x2js = new X2JS());
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
      this.http.post(GEOCHRON_URL, data, options).subscribe(
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

}
