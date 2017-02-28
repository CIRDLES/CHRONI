import './polyfills.ts';
 
import 'zone.js/dist/long-stack-trace-zone';
import 'zone.js/dist/proxy.js';
import 'zone.js/dist/sync-test';
import 'zone.js/dist/jasmine-patch';
import 'zone.js/dist/async-test';
import 'zone.js/dist/fake-async-test';
 
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { getTestBed, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { App, Config, Form, IonicModule, Keyboard, DomController, MenuController, NavController, Platform } from 'ionic-angular';
import { ConfigMock, PlatformMock, NavMock, MenuMock, FileUtilityMock } from './mocks';
import { Storage } from '@ionic/storage';

import { XMLUtility } from './utilities/XMLUtility';
import { HistoryUtility } from './utilities/HistoryUtility';
import { FileUtility } from './utilities/FileUtility'

import { Chroni } from './app/app.component';
import { About } from './pages/about/about';
import { History, Name } from './pages/history/history';
import { Profile } from './pages/profile/profile';
import { Login } from './pages/profile/login';
import { ViewFiles, FileName } from './pages/viewFiles/viewFiles';
import { TableView } from './pages/table/tableView';
import { FileBrowser } from './pages/fileBrowser/fileBrowser';
import { AliquotsPage } from './pages/aliquots/aliquots';
import { ReportSettingsPage } from './pages/reportSettings/reportSettings';
import { HelpPage } from './pages/help/help';

// Unfortunately there's no typing for the `__karma__` variable. Just declare it as any.
declare var __karma__: any;
declare var require: any;
 
// Prevent Karma from running prematurely.
__karma__.loaded = function (): void {
  // noop
};
 
// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);
 
// Then we find all the tests.
let context: any = require.context('./', true, /\.spec\.ts/);
 
// And load the modules.
context.keys().map(context);
 
// Finally, start Karma to run the tests.
__karma__.start();

export class TestUtils {

  public static beforeEachCompiler(components: Array<any>): Promise<{fixture: any, instance: any}> {
    return TestUtils.configureIonicTestingModule(components)
      .compileComponents().then(() => {
        let fixture: any = TestBed.createComponent(components[0]);
        return {
          fixture: fixture,
          instance: fixture.debugElement.componentInstance
        };
      });
  }

  public static configureIonicTestingModule(components: Array<any>): typeof TestBed {
    return TestBed.configureTestingModule({
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
        HelpPage
      ],
      providers: [
        {provide: App, useClass: ConfigMock},
        {provide: Config, useClass: ConfigMock},
        {provide: Keyboard, useClass: ConfigMock},
        {provide: MenuController, useClass: MenuMock},
        {provide: NavController, useClass: NavMock},
        {provide: Platform, useClass: PlatformMock},
        Form,
        Storage, XMLUtility, HistoryUtility,
        {provide: FileUtility, useClass: FileUtilityMock}
      ],
      imports: [
        IonicModule.forRoot(Chroni),
        FormsModule,
        IonicModule,
        ReactiveFormsModule
      ]
    });
  }

}
