import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';

import { File } from '@ionic-native/file';
import { Transfer, TransferObject } from '@ionic-native/transfer';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { ThemeableBrowser } from '@ionic-native/themeable-browser';

import { XMLUtility } from '../utilities/XMLUtility';
import { HistoryUtility } from '../utilities/HistoryUtility';
import { FileUtility } from '../utilities/FileUtility';

import { Chroni } from './app.component';
import { About } from '../pages/about/about';
import { History, Name } from '../pages/history/history';
import { Profile } from '../pages/profile/profile';
import { Login } from '../pages/profile/login';
import { ViewFiles, FileName } from '../pages/viewFiles/viewFiles';
import { TableView } from '../pages/table/tableView';
import { FileBrowser } from '../pages/fileBrowser/fileBrowser';
import { AliquotsPage } from '../pages/aliquots/aliquots';
import { ReportSettingsPage } from '../pages/reportSettings/reportSettings';
import { DownloadPage } from '../pages/download/download';

@NgModule({
  declarations: [
    Chroni,
    About,
    History,
    Name,
    Profile,
    Login,
    ViewFiles,
    TableView,
    FileName,
    FileBrowser,
    AliquotsPage,
    ReportSettingsPage,
    DownloadPage
  ],
  imports: [
    IonicModule.forRoot(Chroni),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    Chroni,
    About,
    History,
    Profile,
    Login,
    ViewFiles,
    TableView,
    FileBrowser,
    AliquotsPage,
    ReportSettingsPage,
    DownloadPage
  ],
  providers: [
    StatusBar, SplashScreen, ThemeableBrowser,
    File, Transfer, TransferObject,
    XMLUtility, HistoryUtility, FileUtility,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
