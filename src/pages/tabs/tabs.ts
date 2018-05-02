import { Component } from '@angular/core';

import { DownloadPage } from '../download/download';
import { HistoryPage } from '../history/history';
import { ManageReportsPage } from '../manageReports/manageReports';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = DownloadPage;
  tab2Root = ManageReportsPage;
  tab3Root = HistoryPage;

  constructor() {

  }
}
