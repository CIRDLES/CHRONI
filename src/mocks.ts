import { Observable } from 'rxjs/Observable';

export class ConfigMock {
  public get(): any {
    return '';
  }
  public getBoolean(): boolean {
    return true;
  }
  public getNumber(): number {
    return 1;
  }
  public setModeConfig() {}
  public setTransition() {}
}

export class FormMock {
  public register(): any {
    return true;
  }
}

export class NavMock {
  public pop(): any {
    return new Promise((resolve: Function) => {
      resolve();
    });
  }
  public push(): any {
    return new Promise((resolve: Function) => {
      resolve();
    });
  }
  public getActive(): any {
    return {
      'instance': {
        'model': 'something'
      }
    };
  }
  public setRoot(): any {
    return true;
  }
  public registerChildNav(nav: any): any {};
}

export class PlatformMock {
  public ready(): any {
    return new Promise((resolve: Function) => {
      resolve();
    });
  }
  public registerBackButtonAction(fn: Function, priority?: number): Function {
    return (() => true);
  }
  public hasFocus(ele: HTMLElement): boolean {
    return true;
  }
  public doc(): HTMLDocument {
    return document;
  }
  public is(): boolean {
    return true;
  }
  public getElementComputedStyle(container: any): any {
    return {
      paddingLeft: '10',
      paddingTop: '10',
      paddingRight: '10',
      paddingBottom: '10',
    };
  }
  public onResize(callback: any) {
    return callback;
  }
  public registerListener(ele: any, eventName: string, callback: any): Function {
    return (() => true);
  }
  public win(): Window {
    return window;
  }
  public raf(callback: any): number {
    return 1;
  }
  public timeout(callback: any, timer: number): any {
    return setTimeout(callback, timer);
  }
  public cancelTimeout(id: any) {
    // do nothing
  }
}

export class MenuMock {
  public close(): any {
    return new Promise((resolve: Function) => {
      resolve();
    });
  }
  public unregister(menu) {};
}

export class FileUtilityMock {
  public getFile(): any {
    return new Observable(observer => observer.complete());
  }
  public getDirectory(): any {
    return new Observable(observer => observer.complete());
  }
  public removeFile(): any {
    return new Observable(observer => observer.complete());
  }
  public removeDirectory(dirPath: string): any {
      return new Observable(observer => observer.complete());
  }
  public readFileText(filePath: string): any {
      return new Observable(observer => observer.complete());
  }
  public getFilesAtDirectory(dirPath: string): any {
      return new Observable(observer => observer.complete());
  }
  public createFile(filePath: string, replace: boolean): any {
      return new Observable(observer => observer.complete());
  }
  public createDirectory(dirPath: string, replace: boolean): any {
      return new Observable(observer => observer.complete());
  }
  public writeNewFile(filePath: string, text: string): any {
      return new Observable(observer => observer.complete());
  }
  public moveFile(oldFilePath: string, newFilePath: string): any {
      return new Observable(observer => observer.complete());
  }
  public moveDirectory(oldDirPath: string, newDirPath: string): any {
      return new Observable(observer => observer.complete());
  }
  public copyFile(oldFilePath: string, newFilePath: string): any {
      return new Observable(observer => observer.complete());
  }
  public copyDirectory(oldDirPath: string, newDirPath: string): any {
      return new Observable(observer => observer.complete());
  }
  public fileExists(filePath: string): Observable<boolean> {
      return new Observable(observer => observer.complete());
  }
  public directoryExists(dirPath: string): Observable<boolean> {
      return new Observable(observer => observer.complete());
  }
  public downloadFile(url: string, filePath: string): any {
      return new Observable(observer => observer.complete());
  }
  public createDefaultDirectories() {}
  public downloadDefaultFiles() {}
  public updateCurrentFiles() {}
}
