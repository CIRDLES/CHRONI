import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { Storage } from '@ionic/storage';

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
import { AliquotDownloadPage } from '../pages/aliquot-download/aliquot-download';
import { HelpPage } from '../pages/help/help';
import { AliquotImportPage } from '../pages/aliquot-import/aliquot-import';
import { ReportSettingsImportPage } from '../pages/report-settings-import/report-settings-import';

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
    AliquotDownloadPage,
    HelpPage,
    AliquotImportPage,
    ReportSettingsImportPage
  ],
  imports: [
    IonicModule.forRoot(Chroni)
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
    AliquotDownloadPage,
    HelpPage,
    AliquotImportPage,
    ReportSettingsImportPage
  ],
  providers: [
    Storage, XMLUtility, HistoryUtility, FileUtility,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
