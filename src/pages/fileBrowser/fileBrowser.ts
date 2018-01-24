import { Component } from '@angular/core';
import { ViewController, NavParams, ActionSheetController, AlertController, ToastController, ItemSliding } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Entry, FileEntry } from '@ionic-native/file';
import { HistoryEntry } from '../../models';
import { XMLUtility } from '../../utilities/XMLUtility';
import { FileUtility } from '../../utilities/FileUtility';
import { HistoryUtility } from '../../utilities/HistoryUtility';
import { FileNamePipe } from '../../utilities/pipes/FileName';

@Component({
  templateUrl: 'fileBrowser.html'
})
export class FileBrowser {

  files: Array<any>;
  fileSystem: string;

  currentDirectory: any;
  parentDirectory: any = {};
  parentName: string;
  inRoot: boolean = false;
  lookingFor: string = '';

  copiedFile: any = null;
  copying: any = false;
  cutting: boolean = false;

  constructor(private viewCtrl: ViewController, private params: NavParams, private actionSheetCtrl: ActionSheetController, private alertCtrl: AlertController, private toastCtrl: ToastController, private xml: XMLUtility, private fileUtil: FileUtility, private historyUtil: HistoryUtility) {
    let directory = this.params.get('directory');
    if (!directory || directory === '') {
      this.currentDirectory = '/chroni/'
      this.parentDirectory = '';
      this.parentName = '';
    } else {
      this.currentDirectory = directory;
      this.parentDirectory = '/chroni/';
      this.parentName = 'chroni'

      if (directory === '/chroni/Aliquots/')
        this.lookingFor = 'Aliquot';
      else if (directory === '/chroni/Report Settings/')
        this.lookingFor = 'Report Settings'
    }

    this.fileUtil.createDefaultDirectories().subscribe(_ => { }, _ => { }, () => {
      this.fileUtil.downloadDefaultFiles()
        .subscribe(_ => { }, _ => { }, () => this.updateFiles());;
    });

    this.updateFiles();
  }

  updateFiles() {
    // must remove leading '/' from currentDirectory file path
    this.fileUtil.getFilesAtDirectory(this.currentDirectory.substring(1))
      .subscribe(
        files => this.files = files,
        error => console.log(JSON.stringify(error))
      );
  }

  chooseFile(file) {
    if (file.isFile) {
      if (this.lookingFor === 'Aliquot') {
        // checks to make sure the file is an Aliquot XML file
        this.xml.isValidAliquot(file).subscribe(valid => {
          valid
            ? this.sendFileBack(file)
            : this.displayToast('"' + file.name + '" is not a valid Aliquot file...');
        });
      } else if (this.lookingFor === 'Report Settings') {
        // checks to make sure the file is an Report Settings XML file
        this.xml.isValidReportSettings(file).subscribe(valid => {
          valid
            ? this.sendFileBack(file)
            : this.displayToast('"' + file.name + '" is not a valid Report Settings file...');
        });
      } else
        // if not specifically looking for Aliquot or Report Settings, assumes valid
        this.sendFileBack(file);

    } else {
      this.parentDirectory = this.currentDirectory;
      this.parentName = this.getParentDirectoryName(this.parentDirectory);
      this.currentDirectory = file.fullPath;
      this.inRoot = false;
      this.updateFiles();
    }
  }

  sendFileBack(file) {
    this.viewCtrl.dismiss(file);
  }

  chooseBackFile() {
    this.currentDirectory = this.parentDirectory;
    this.parentDirectory = this.getParentsPath(this.currentDirectory);
    this.parentName = this.getParentDirectoryName(this.parentDirectory);
    if (this.parentDirectory === '/')
      this.inRoot = true;
    this.updateFiles();
  }

  deleteWarning(file, itemSliding: ItemSliding) {
    let alert = this.alertCtrl.create({
      title: 'Delete Confirmation',
      message: 'Are you sure you want to delete "' + file.name + '"?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: () => {
            this.deleteFile(file);
          }
        }
      ]
    });
    alert.present();

    alert.onDidDismiss(_ => {
      itemSliding.close();
    });
  }

  deleteFile(file) {
    let filePath = file.fullPath.substring(1);
    if (file.isFile) {
      this.fileUtil.removeFile(filePath)
        .subscribe(
          success => {
            this.deleteFromHistory(file);
            this.updateFiles();
          }, error => console.log(JSON.stringify(error))
        );
    } else {
      this.alertCtrl.create({
        title: 'WARNING!',
        message: 'Removing "' + file.name + '" will also delete all files and folders inside of it. Do you wish to continue?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Continue',
            handler: () => {
              this.fileUtil.removeDirectory(filePath)
                .subscribe(
                  success => this.updateFiles(),
                  error => console.log(JSON.stringify(error))
                );
            }
          }
        ]
      }).present();
    }
  }

  renameFile(file: Entry, newName) {
    if (newName && newName !== '') {
      let newPath = '';
      let oldPath = file.fullPath.substring(1);
      if (file.isFile) {
        let split = file.name.split('.');
        let extension = '.' + split[split.length - 1];
        newPath = oldPath.substring(0, oldPath.length - file.name.length) + newName + extension;

        this.fileUtil.moveFile(oldPath, newPath)
          .subscribe(
            (newFile: Entry) => {
              this.updateFiles();
              this.updateHistory(file, newFile);
            }, error => console.log(JSON.stringify(error))
          );
      } else {
        newPath = oldPath.substring(0, oldPath.length - file.name.length) + newName;
        this.fileUtil.moveDirectory(oldPath, newPath)
          .subscribe(
            (newDir: Entry) => {
              this.updateFiles();
              this.updateHistory(file, newDir);
            }, error => console.log(JSON.stringify(error))
          );
      }
    } else {
      this.alertCtrl.create({
        title: 'Invalid File Name!',
        buttons: ['OK']
      }).present();
    }
  }

  copyFile(file) {
    this.copiedFile = file;
    this.cutting = false;
    this.copying = true;
  }

  cutFile(file) {
    this.copiedFile = file;
    this.copying = false;
    this.cutting = true;
  }

  pasteFile() {
    if (this.copiedFile) {
      let newPath = (this.currentDirectory + '/' + this.copiedFile.name).substring(1);
      this.fileUtil.fileExists(newPath)
        .subscribe(exists => {
          if (!exists) {
            if (this.cutting) {
              if (this.copiedFile.isFile)
                this.fileUtil.moveFile(this.copiedFile.fullPath.substring(1), newPath)
                  .subscribe(
                    (newFile: Entry) => {
                      this.updateFiles();
                      this.updateHistory(this.copiedFile, newFile);
                      this.copiedFile = null;
                      this.cutting = false;
                    }, error => {
                      this.copiedFile = null;
                      this.cutting = false;
                    });
              else
                this.fileUtil.moveDirectory(this.copiedFile.fullPath.substring(1), newPath)
                  .subscribe(
                    (newDir: Entry) => {
                      this.updateFiles();
                      this.updateHistory(this.copiedFile, newDir);
                      this.copiedFile = null;
                      this.cutting = false;
                    }, error => {
                      this.copiedFile = null;
                      this.cutting = false;
                    });
            } else {
              if (this.copiedFile.isFile)
                this.fileUtil.copyFile(this.copiedFile.fullPath.substring(1), newPath)
                  .subscribe(
                    success => this.updateFiles(),
                    error => console.log(JSON.stringify(error))
                  );
              else
                this.fileUtil.copyDirectory(this.copiedFile.fullPath.substring(1), newPath)
                  .subscribe(
                    success => this.updateFiles(),
                    error => console.log(JSON.stringify(error))
                  );
            }
          }
        }, error => console.log(JSON.stringify(error)));
    }
  }

  updateCurrents() {

  }

  deleteFromHistory(fileEntry: Entry) {
    let entries: Array<HistoryEntry> = this.historyUtil.getHistoryEntries();
    if (fileEntry.isDirectory) {
      // if deleting directory, delete all files in history entries whose paths
      // are within the deleted folder
      let i = 0;
      while (i < entries.length) {
        let historyEntry: HistoryEntry = entries[i];
        let historyPath: string = fileEntry.fullPath.slice(1);
        let aliquotMatch: boolean = historyEntry.aliquotInDirectory(historyPath);
        let reportSettingsMatch: boolean = historyEntry.reportSettingsInDirectory(historyPath);
        (aliquotMatch || reportSettingsMatch) ? this.historyUtil.removeEntry(i) : i++;
      }
    } else {
      // if deleting file, delete all files in history entries whose paths match
      // the deleted file
      let i = 0;
      while (i < entries.length) {
        let historyEntry: HistoryEntry = entries[i];
        let historyPath: string = fileEntry.fullPath.slice(1);
        let aliquotMatch: boolean = historyEntry.getAliquotPath() === fileEntry.fullPath.slice(1);
        let reportSettingsMatch: boolean = historyEntry.getReportSettingsPath() === fileEntry.fullPath.slice(1);
        (aliquotMatch || reportSettingsMatch) ? this.historyUtil.removeEntry(i) : i++;
      }
    }
  }

  updateHistory(fileEntry: Entry, newFileEntry: Entry) {
    let entries: Array<HistoryEntry> = this.historyUtil.getHistoryEntries();
    if (fileEntry.isDirectory) {
      // if updating directory, change all files' paths in history entries that
      // exist within the changed folder
      let i = 0;
      while (i < entries.length) {
        let historyEntry: HistoryEntry = entries[i];
        let historyPath: string = fileEntry.fullPath.slice(1);
        let aliquotMatch: boolean = historyEntry.aliquotInDirectory(historyPath);
        let reportSettingsMatch: boolean = historyEntry.reportSettingsInDirectory(historyPath);
        if (aliquotMatch || reportSettingsMatch) {
          aliquotMatch ? historyEntry.updateAliquotPathPortion(fileEntry.fullPath, newFileEntry.fullPath) : historyEntry.updateReportSettingsPathPortion(fileEntry.fullPath, newFileEntry.fullPath);
          this.historyUtil.updateEntry(i, historyEntry);
        }
        i++;
      }
    } else {
      // if updating a file, change the aliquot or report settings for history
      // entries that contain that file
      let i = 0;
      while (i < entries.length) {
        let historyEntry: HistoryEntry = entries[i];
        let aliquotMatch: boolean = historyEntry.getAliquotPath() === fileEntry.fullPath.slice(1);
        let reportSettingsMatch: boolean = historyEntry.getReportSettingsPath() === fileEntry.fullPath.slice(1);
        if (aliquotMatch || reportSettingsMatch) {
          aliquotMatch ? historyEntry.setAliquotFileEntry(<FileEntry> newFileEntry) : historyEntry.setReportSettingsFileEntry(<FileEntry> newFileEntry);
          this.historyUtil.updateEntry(i, historyEntry);
        }
        i++;
      }
    }
  }

  newFolder() {
    this.alertCtrl.create({
      title: 'New Folder',
      message: "Enter the new folder's name",
      inputs: [
        {
          name: 'name',
          placeholder: 'Folder Name'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Create',
          handler: (data: any) => {
            if (data.name && data.name !== "") {
              let dirPath = (this.currentDirectory + '/' + data.name).substring(1);
              this.fileUtil.createDirectory(dirPath).subscribe(
                (dir) => {
                  this.displayToast('"' + dir.name + '"' + ' created successfully');
                  this.updateFiles();
                }, (error) => console.log(JSON.stringify(error))
              );
            }
          }
        }
      ]
    }).present();
  }

  getParentDirectoryName(parentDir) {
    let split = parentDir.split('/');
    if (split.length > 2) {
      return split[split.length - 2];
    } else
      return '';
  }

  getParentsPath(parentDir) {
    let split = parentDir.split('/');
    if (split.length > 2) {
      let name = split[split.length - 2] + '/';
      return parentDir.substring(0, parentDir.length - name.length);
    } else
      return '/';
  }

  showMoreOptions(file: Entry, itemSliding) {
    let actionsheet = this.actionSheetCtrl.create({
      title: 'Modify File',
      buttons: [
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.deleteFile(file);
          }
        },
        {
          text: 'Rename',
          handler: () => {
            let prompt = this.alertCtrl.create({
              title: 'Rename File',
              message: 'Enter a new name for "' + file.name + '" (without file extension)',
              inputs: [
                {
                  name: 'name',
                  placeholder: 'File Name'
                }
              ],
              buttons: [
                {
                  text: 'Cancel'
                },
                {
                  text: 'Submit',
                  handler: (data: any) => {
                    this.renameFile(file, data.name);
                  }
                }
              ]
            });
            prompt.present();
          }
        },
        {
          text: 'Cut',
          handler: () => {
            this.cutFile(file);
          }
        },
        {
          text: 'Copy',
          handler: () => {
            this.copyFile(file);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    actionsheet.present();
    actionsheet.onDidDismiss(_ => {
      itemSliding.close();
    });
  }

  displayToast(text: string) {
    this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'bottom',
      cssClass: 'text-center'
    }).present();
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
