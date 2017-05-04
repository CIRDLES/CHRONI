import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { File, FileEntry, DirectoryEntry, Entry } from '@ionic-native/file';
import { Transfer, TransferObject } from '@ionic-native/transfer';
import { Storage } from '@ionic/storage';

const defaultAliquotURL: string = 'https://raw.githubusercontent.com/CIRDLES/cirdles.github.com/master/assets/Default-Aliquot-XML/Default Aliquot.xml';
const defaultReportSettingsURL: string = 'https://raw.githubusercontent.com/CIRDLES/cirdles.github.com/master/assets/Default Report Settings XML/Default Report Settings.xml';
const defaultReportSettings2URL: string = 'https://raw.githubusercontent.com/CIRDLES/cirdles.github.com/master/assets/Default Report Settings XML/Default Report Settings 2.xml';

@Injectable()
export class FileUtility {

  private fileTransfer: TransferObject;

  constructor(private platform: Platform, private storage: Storage, private transfer: Transfer, private file: File) {
    this.platform.ready().then(_ => {
      this.fileTransfer = this.transfer.create();
    });
  }

  public getFile(filePath: string): Observable<FileEntry> {
    return new Observable(observer => {
      this.file.resolveDirectoryUrl(this.file.dataDirectory).then((directory: DirectoryEntry) => {
        this.file.getFile(directory, filePath, {})
          .then((file: FileEntry) => observer.next(file))
          .catch((error) => observer.error(error));
      });
    });
  }

  public getDirectory(dirPath: string): Observable<DirectoryEntry> {
    return new Observable(observer => {
      this.file.resolveDirectoryUrl(this.file.dataDirectory).then((directory: DirectoryEntry) => {
        this.file.getDirectory(directory, dirPath, {})
          .then((dir: DirectoryEntry) => observer.next(dir))
          .catch((error) => observer.error(error));
      });
    });
  }

  public removeFile(filePath: string, useTempDir: boolean = false): Observable<any> {
    let dir = useTempDir ? this.file.tempDirectory : this.file.dataDirectory;
    return new Observable(observer => {
      this.file.removeFile(dir, filePath)
        .then((success) => observer.next(success))
        .catch((error) => observer.error(error));
    });
  }

  public removeDirectory(dirPath: string): Observable<any> {
    return new Observable(observer => {
      this.file.removeRecursively(this.file.dataDirectory, dirPath)
        .then((success) => observer.next(success))
        .catch((error) => observer.error(error));
    });
  }

  public readFileText(filePath: string, useTempDir: boolean = false): Observable<string> {
    let dir = useTempDir ? this.file.tempDirectory : this.file.dataDirectory;
    return new Observable(observer => {
      this.file.readAsText(dir, filePath)
        .then((fileData: string) => observer.next(fileData))
        .catch((error) => observer.error(error));
    });
  }

  public getFilesAtDirectory(dirPath: string): Observable<Array<Entry>> {
    return new Observable(observer => {
      this.file.listDir(this.file.dataDirectory, dirPath)
        .then((entries: Array<Entry>) => observer.next(entries))
        .catch((error) => observer.error(error));
    });
  }

  public createFile(filePath: string, replace: boolean): Observable<any> {
    return new Observable(observer => {
      this.file.createFile(this.file.dataDirectory, filePath, replace)
        .then((success) => observer.next(success))
        .catch((error) => observer.error(error));
    });
  }

  public createDirectory(dirPath: string, replace: boolean): Observable<any> {
    return new Observable(observer => {
      this.file.createDir(this.file.dataDirectory, dirPath, replace)
        .then((success) => observer.next(success))
        .catch((error) => observer.error(error));
    });
  }

  public writeNewFile(filePath: string, text: string): Observable<Entry> {
    return new Observable(observer => {
      this.file.writeFile(this.file.dataDirectory, filePath, text)
        .then((success) => observer.next(success))
        .catch((error) => observer.error(error));
    });
  }

  public moveFile(oldFilePath: string, newFilePath: string, fromTempDir: boolean = false): Observable<Entry> {
    let oldDir = fromTempDir ? this.file.tempDirectory : this.file.dataDirectory;
    return new Observable(observer => {
      this.file.moveFile(oldDir, oldFilePath, this.file.dataDirectory, newFilePath)
        .then((newFile) => observer.next(newFile))
        .catch((error) => observer.error(error));
    });
  }

  public moveDirectory(oldDirPath: string, newDirPath: string): Observable<DirectoryEntry> {
    return new Observable(observer => {
      this.file.moveDir(this.file.dataDirectory, oldDirPath, this.file.dataDirectory, newDirPath)
        .then((newDir) => observer.next(newDir))
        .catch((error) => observer.error(error));
    });
  }

  public copyFile(oldFilePath: string, newFilePath: string): Observable<Entry> {
    return new Observable(observer => {
      this.file.copyFile(this.file.dataDirectory, oldFilePath, this.file.dataDirectory, newFilePath)
        .then((newFile) => observer.next(newFile))
        .catch((error) => observer.error(error));
    });
  }

  public copyDirectory(oldDirPath: string, newDirPath: string): Observable<DirectoryEntry> {
    return new Observable(observer => {
      this.file.copyDir(this.file.dataDirectory, oldDirPath, this.file.dataDirectory, newDirPath)
        .then((newDir) => observer.next(newDir))
        .catch((error) => observer.error(error));
    });
  }

  public fileExists(filePath: string): Observable<boolean> {
    return new Observable(observer => {
      this.file.checkFile(this.file.dataDirectory, filePath)
        .then((exists) => observer.next(true))
        .catch((error) => observer.next(false));
    });
  }

  public directoryExists(dirPath: string): Observable<boolean> {
    return new Observable(observer => {
      this.file.checkDir(this.file.dataDirectory, dirPath)
        .then((exists) => observer.next(true))
        .catch((error) => observer.next(false));
    });
  }

  public downloadFile(url: string, filePath: string, useTempDir: boolean = false): Observable<any> {
    return new Observable(observer => {
      let path = useTempDir ?
        encodeURI(this.file.tempDirectory + filePath) :
        encodeURI(this.file.dataDirectory + filePath);
      this.fileTransfer.download(encodeURI(url), path)
        .then((file: FileEntry) => observer.next(file))
        .catch((error) => observer.error(error));
    });
  }

  public createDefaultDirectories() {
    return new Observable<any>(observer => {
      let ob = new Observable<number>(observer2 => {
        // checks the default directories and creates them if they don't exist
        this.directoryExists('chroni').subscribe((chroniExists) => {
          let createInner = () => {
            this.directoryExists('chroni/Aliquots').subscribe((exists) => {
              if (!exists) {
                this.createDirectory('chroni/Aliquots', false)
                  .subscribe(
                  success => observer2.next(1),
                  error => {
                    console.log("Could not create chroni/Aliquots directory... " + JSON.stringify(error));
                    observer2.next(1);
                  });
              } else
                observer2.next(1);
            });
            this.directoryExists('chroni/Report Settings').subscribe((exists) => {
              if (!exists) {
                this.createDirectory('chroni/Report Settings', false)
                  .subscribe(
                  success => observer2.next(1),
                  error => {
                    console.log("Could not create chroni/Report Settings directory... " + JSON.stringify(error));
                    observer2.next(1);
                  });
              } else
                observer2.next(1);
            });
          };
          if (!chroniExists) {
            this.createDirectory('chroni', false).subscribe(
              success => createInner(),
              error => {
                console.log("Could not create chroni directory... " + JSON.stringify(error));
                observer2.next(2);
              });
          } else
            createInner();
        });

      });

      let numFinsished = 0;
      ob.subscribe(value => {
        numFinsished++;
        if (numFinsished >= 2)
          observer.complete();
      });
    });
  }

  public downloadDefaultFiles() {
    return new Observable<any>(observer => {
      let ob = new Observable<number>(observer2 => {
        // checks the default files and downloads if they don't exist
        this.fileExists('chroni/Aliquots/Default Aliquot.xml').subscribe((exists) => {
          if (!exists) {
            this.downloadFile(defaultAliquotURL, 'chroni/Aliquots/Default Aliquot.xml')
              .subscribe(
              success => {
                this.updateCurrentFiles();
                console.log("Downloaded Default Aliquot...");
                observer2.next(1);
              },
              error => {
                console.log("Could not download Default Aliquot... " + JSON.stringify(error));
                observer2.next(1);
              });
          } else
            observer2.next(1);
        });
        this.fileExists('chroni/Report Settings/Default Report Settings.xml').subscribe((exists) => {
          if (!exists) {
            this.downloadFile(defaultReportSettingsURL, 'chroni/Report Settings/Default Report Settings.xml')
              .subscribe(
              success => {
                this.updateCurrentFiles();
                console.log("Downloaded Default Report Settings...");
                observer2.next(1);
              },
              error => {
                console.log("Could not download Default Report Settings... " + JSON.stringify(error));
                observer2.next(1);
              });
          } else
            observer2.next(1);
        });
        this.fileExists('chroni/Report Settings/Default Report Settings 2.xml').subscribe((exists) => {
          if (!exists) {
            this.downloadFile(defaultReportSettings2URL, 'chroni/Report Settings/Default Report Settings 2.xml')
              .subscribe(
              success => {
                console.log("Downloaded Default Report Settings 2...");
                observer2.next(1);
              },
              error => {
                console.log("Could not download Default Report Settings 2... " + JSON.stringify(error));
                observer2.next(1);
              });
          } else
            observer2.next(1);
        });
      });

      let numFinsished = 0;
      ob.subscribe(value => {
        numFinsished++;
        if (numFinsished >= 3)
          observer.complete();
      });
    });
  }

  public updateCurrentFiles() {
    // checks to make sure there are default current files
    this.storage.get('currentAliquot').then((value) => {
      if (!value) {
        // sets the current Aliquot to the Default Aliquot
        this.getFile('chroni/Aliquots/Default Aliquot.xml')
          .subscribe(
          file => {
            this.storage.set('currentAliquot', file);
            console.log('Set current Aliquot to Default Aliquot...');
          },
          error => console.log("Could not set current Aliquot... " + error.message)
          );
      }
    });
    this.storage.get('currentReportSettings').then((value) => {
      if (!value) {
        // sets the current Report Settings to the Default Report Settings
        this.getFile('chroni/Report Settings/Default Report Settings.xml')
          .subscribe(
          file => {
            this.storage.set('currentReportSettings', file);
            console.log('Set current Report Settings to Default Report Settings...');
          },
          error => console.log("Could not set current Report Settings... " + error.message)
          );
      }
    });
  }

}
