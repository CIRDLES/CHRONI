import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';

import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { File } from '@ionic-native/file';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';
import { ThreeDeeTouch } from '@ionic-native/three-dee-touch';
import { ThemeableBrowser } from '@ionic-native/themeable-browser';
import { ScreenOrientation } from '@ionic-native/screen-orientation';

import { Chroni } from './app.component';
import { AboutPage } from '../pages/about/about';
import { DownloadPage } from '../pages/download/download';
import { FileBrowser } from '../pages/fileBrowser/fileBrowser';
import { HistoryPage } from '../pages/history/history';
import { ManageReportsPage } from '../pages/manageReports/manageReports';
import { TablePage, PopoverPage, ImageView } from '../pages/table/table';

import { XMLUtility } from '../utilities/XMLUtility';
import { HistoryUtility } from '../utilities/HistoryUtility';
import { FileUtility } from '../utilities/FileUtility';
import { GeochronUtility } from '../utilities/GeochronUtility';
import { ReportUtility } from '../utilities/ReportUtility';

import { FileNamePipe } from '../utilities/pipes/FileName';
import { FileNameFromPathPipe } from '../utilities/pipes/FileNameFromPath';

import { AppVersion } from '@ionic-native/app-version';

@NgModule({
  declarations: [
    Chroni,
    AboutPage,
    DownloadPage,
    FileBrowser,
    HistoryPage,
    ManageReportsPage,
    TablePage,
    PopoverPage,
    ImageView,
    FileNamePipe,
    FileNameFromPathPipe
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(Chroni),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    Chroni,
    AboutPage,
    DownloadPage,
    FileBrowser,
    HistoryPage,
    ManageReportsPage,
    TablePage,
    PopoverPage,
    ImageView
  ],
  providers: [
    StatusBar,
    SplashScreen,
    File,
    FileTransfer,
    FileTransferObject,
    ThreeDeeTouch,
    ThemeableBrowser,
    ScreenOrientation,
    AppVersion,
    XMLUtility, HistoryUtility, FileUtility, GeochronUtility, ReportUtility,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
