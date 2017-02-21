import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { File, FileEntry, DirectoryEntry, Entry, Transfer } from 'ionic-native';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';

declare var cordova: any;

const defaultAliquotURL: string = 'http://raw.githubusercontent.com/CIRDLES/cirdles.github.com/master/assets/Default-Aliquot-XML/Default Aliquot.xml';
const defaultReportSettingsURL: string = 'http://raw.githubusercontent.com/CIRDLES/cirdles.github.com/master/assets/Default Report Settings XML/Default Report Settings.xml';
const defaultReportSettings2URL: string = 'http://raw.githubusercontent.com/CIRDLES/cirdles.github.com/master/assets/Default Report Settings XML/Default Report Settings 2.xml';

@Injectable()
export class FileUtility {

    private fileSystem: string;
    private transfer: Transfer;

    constructor(public platform: Platform, public storage: Storage) {
        this.platform.ready().then(() => {
            this.fileSystem = cordova.file.dataDirectory;
            this.transfer = new Transfer();
        });
    }

    public getFile(filePath: string): Observable<FileEntry> {
        return new Observable(observer => {
            File.resolveDirectoryUrl(this.fileSystem).then((directory: DirectoryEntry) => {
                File.getFile(directory, filePath, {})
                    .then((file: FileEntry) => observer.next(file))
                    .catch((error) => observer.error(error));
            });
        });
    }

    public getDirectory(dirPath: string): Observable<DirectoryEntry> {
        return new Observable(observer => {
            File.resolveDirectoryUrl(this.fileSystem).then((directory: DirectoryEntry) => {
                File.getDirectory(directory, dirPath, {})
                    .then((dir: DirectoryEntry) => observer.next(dir))
                    .catch((error) => observer.error(error));
            });
        });
    }

    public removeFile(filePath: string): Observable<any> {
        return new Observable(observer => {
            File.removeFile(this.fileSystem, filePath)
                .then((success) => observer.next(success))
                .catch((error) => observer.error(error));
        });
    }

    public removeDirectory(dirPath: string): Observable<any> {
        return new Observable(observer => {
            File.removeRecursively(this.fileSystem, dirPath)
                .then((success) => observer.next(success))
                .catch((error) => observer.error(error));
        });
    }

    public readFileText(filePath: string): Observable<string> {
        return new Observable(observer => {
            File.readAsText(this.fileSystem, filePath)
                .then((fileData: string) => observer.next(fileData))
                .catch((error) => observer.error(error));
        });
    }

    public getFilesAtDirectory(dirPath: string): Observable<Array<Entry>> {
        return new Observable(observer => {
            File.listDir(this.fileSystem, dirPath)
                .then((entries: Array<Entry>) => observer.next(entries))
                .catch((error) => observer.error(error));
        });
    }

    public createFile(filePath: string, replace: boolean): Observable<any> {
        return new Observable(observer => {
            File.createFile(this.fileSystem, filePath, replace)
                .then((success) => observer.next(success))
                .catch((error) => observer.error(error));
        });
    }

    public createDirectory(dirPath: string, replace: boolean): Observable<any> {
        return new Observable(observer => {
            File.createDir(this.fileSystem, dirPath, replace)
                .then((success) => observer.next(success))
                .catch((error) => observer.error(error));
        });
    }

    public writeNewFile(filePath: string, text: string): Observable<Entry> {
        return new Observable(observer => {
            File.writeFile(this.fileSystem, filePath, text)
                .then((success) => observer.next(success))
                .catch((error) => observer.error(error));
        });
    }

    public moveFile(oldFilePath: string, newFilePath: string): Observable<Entry> {
        return new Observable(observer => {
            File.moveFile(this.fileSystem, oldFilePath, this.fileSystem, newFilePath)
                .then((newFile) => observer.next(newFile))
                .catch((error) => observer.error(error));
        });
    }

    public moveDirectory(oldDirPath: string, newDirPath: string): Observable<DirectoryEntry> {
        return new Observable(observer => {
            File.moveDir(this.fileSystem, oldDirPath, this.fileSystem, newDirPath)
                .then((newDir) => observer.next(newDir))
                .catch((error) => observer.error(error));
        });
    }

    public copyFile(oldFilePath: string, newFilePath: string): Observable<Entry> {
        return new Observable(observer => {
            File.copyFile(this.fileSystem, oldFilePath, this.fileSystem, newFilePath)
                .then((newFile) => observer.next(newFile))
                .catch((error) => observer.error(error));
        });
    }

    public copyDirectory(oldDirPath: string, newDirPath: string): Observable<DirectoryEntry> {
        return new Observable(observer => {
            File.copyDir(this.fileSystem, oldDirPath, this.fileSystem, newDirPath)
                .then((newDir) => observer.next(newDir))
                .catch((error) => observer.error(error));
        });
    }

    public fileExists(filePath: string): Observable<boolean> {
        return new Observable(observer => {
            File.checkFile(this.fileSystem, filePath)
                .then((exists) => observer.next(true))
                .catch((error) => observer.next(false));
        });
    }

    public directoryExists(dirPath: string): Observable<boolean> {
        return new Observable(observer => {
            File.checkDir(this.fileSystem, dirPath)
                .then((exists) => observer.next(true))
                .catch((error) => observer.next(false));
        });
    }

    public downloadFile(url: string, filePath: string): Observable<any> {
        var webURI = encodeURI(url);
        var filePathURI = encodeURI(this.fileSystem + filePath);
        return new Observable(observer => {
            this.transfer.download(webURI, filePathURI)
                .then((success) => observer.next("success"))
                .catch((error) => observer.next(error));
        });
    }

    public createDefaultDirectories() {
        // checks the default directories and creates them if they don't exist
        this.directoryExists('chroni/Aliquots').subscribe((exists) => {
            if (!exists) {
                this.createDirectory('chroni/Aliquots', false)
                    .subscribe(
                        success => console.log("Created chroni/Aliquots directory..."),
                        error => console.log("Could not create chroni/Aliquots directory... " + error)
                    );
            }
        });
        this.directoryExists('chroni/Report Settings').subscribe((exists) => {
            if (!exists) {
                this.createDirectory('chroni/Report Settings', false)
                    .subscribe(
                        success => console.log("Created chroni/Report Settings directory..."),
                        error => console.log("Could not create chroni/Report Settings directory... " + error)
                    );
            }
        });
    }

    public downloadDefaultFiles() {
        // checks the default files and downloads if they don't exist
        this.fileExists('chroni/Aliquots/Default Aliquot.xml').subscribe((exists) => {
            if (!exists) {
                this.downloadFile(defaultAliquotURL, 'chroni/Aliquots/Default Aliquot.xml')
                .subscribe(
                    success => {
                        this.updateCurrentFiles();
                        console.log("Downloaded Default Aliquot...");
                    },
                    error => console.log("Could not download Default Aliquot... " + error)
                );
            }
        });
        this.fileExists('chroni/Report Settings/Default Report Settings.xml').subscribe((exists) => {
            if (!exists) {
                this.downloadFile(defaultReportSettingsURL, 'chroni/Report Settings/Default Report Settings.xml')
                .subscribe(
                    success => {
                        this.updateCurrentFiles();
                        console.log("Downloaded Default Report Settings...");
                    },
                    error => console.log("Could not download Default Report Settings... " + error)
                );
            }
        });
        this.fileExists('chroni/Report Settings/Default Report Settings 2.xml').subscribe((exists) => {
            if (!exists) {
                this.downloadFile(defaultReportSettings2URL, 'chroni/Report Settings/Default Report Settings 2.xml')
                .subscribe(
                    success => console.log("Downloaded Default Report Settings 2..."),
                    error => console.log("Could not download Default Report Settings 2... " + error)
                );
            }
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