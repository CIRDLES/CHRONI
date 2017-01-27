import { Component } from '@angular/core';

import { ViewController, NavParams, Platform, ActionSheetController, AlertController, ToastController, ItemSliding } from 'ionic-angular';
import { File, ScreenOrientation } from 'ionic-native';

import { XMLUtility } from '../../utilities/XMLUtility';

declare var cordova: any;

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

    constructor(public viewCtrl: ViewController, public params: NavParams, public platform: Platform, public actionSheetCtrl: ActionSheetController, public alertCtrl: AlertController, public toastCtrl: ToastController, public xml: XMLUtility) {
        
        this.platform.ready().then(() => {
            ScreenOrientation.lockOrientation('portrait');
        });

        this.fileSystem = cordova.file.dataDirectory;

        var directory = params.get('directory');
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

        // checks the directories and creates them if they don't exist
        File.checkDir(this.fileSystem, 'chroni')
            .catch(err => File.createDir(this.fileSystem, 'chroni', true));

        File.checkDir(this.fileSystem, 'chroni/Aliquots')
            .catch(err => File.createDir(this.fileSystem, 'chroni/Aliquots', true));

        File.checkDir(this.fileSystem, 'chroni/Report Settings')
            .catch(err => File.createDir(this.fileSystem, 'chroni/Report Settings', true));

        this.updateFiles();
    }

    updateFiles() {
        // must remove leading '/' from currentDirectory file path
        File.listDir(this.fileSystem, this.currentDirectory.substring(1)).then((files) => {
            this.files = files;
        }).catch(err => console.log(JSON.stringify(err)));
    }

    chooseFile(file) {
        if (file.isFile) {
            if (this.lookingFor === 'Aliquot') {
                // checks to make sure the file is an Aliquot XML file
                this.xml.checkFileValidity(file).then((result) => {
                    if (result === 'Aliquot') {
                        this.sendFileBack(file);
                    } else {
                        this.toastCtrl.create({
                            message: '"' + file.name + '" is not a valid Aliquot file...',
                            duration: 3000,
                            position: 'bottom'
                        }).present();
                    }
                        
                });

            } else if (this.lookingFor === 'Report Settings') {
                // checks to make sure the file is an Report Settings XML file
                this.xml.checkFileValidity(file).then((result) => {
                    if (result === 'Report Settings') {
                        this.sendFileBack(file);
                    } else {
                        this.toastCtrl.create({
                            message: '"' + file.name + '" is not a valid Report Settings file...',
                            duration: 3000,
                            position: 'bottom'
                        }).present();
                    }
                        
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
                    text: 'Continue',
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
        var filePath = file.fullPath.substring(1);
        if (file.isFile)
            File.removeFile(this.fileSystem, filePath).then(() => this.updateFiles(), (error) => console.log(JSON.stringify(error)));
        else {
            this.alertCtrl.create({
                title: 'WARNING!',
                message: 'Removing "' + file.name + '" will also delete all files/folders contained within it. Do you wish to continue?',
                buttons: [
                    {
                        text: 'Cancel',
                        role: 'cancel'
                    },
                    {
                        text: 'Continue',
                        handler: () => {
                            File.removeRecursively(this.fileSystem, filePath).then(() => this.updateFiles(), (error) => console.log(JSON.stringify(error)));
                        }
                    }
                ]
            }).present();
        }
    }

    renameFile(file, newName) {
        if (newName && newName !== '') {
            var newPath = '';
            var oldPath = file.fullPath.substring(1);
            if (file.isFile) {
                var split = file.name.split('.');
                var extension = '.' + split[split.length-1];
                newPath = oldPath.substring(0, oldPath.length - file.name.length) + newName + extension;

                File.moveFile(this.fileSystem, oldPath, this.fileSystem, newPath).then(_ => this.updateFiles());
            } else {
                newPath = oldPath.substring(0, oldPath.length - file.name.length) + newName;
                File.moveDir(this.fileSystem, oldPath, this.fileSystem, newPath).then(_ => this.updateFiles());
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
            var newPath = (this.currentDirectory + '/' + this.copiedFile.name).substring(1);
            File.checkFile(this.fileSystem, newPath).catch(err => {
                if (this.cutting) {
                    if (this.copiedFile.isFile)
                        File.moveFile(this.fileSystem, this.copiedFile.fullPath.substring(1), this.fileSystem, newPath).then(() => this.updateFiles(), (error) => console.log(JSON.stringify(error)));
                    else
                        File.moveDir(this.fileSystem, this.copiedFile.fullPath.substring(1), this.fileSystem, newPath).then(() => this.updateFiles());
                    this.copiedFile = null;
                    this.cutting = false;
                } else {
                    if (this.copiedFile.isFile)
                        File.copyFile(this.fileSystem, this.copiedFile.fullPath.substring(1), this.fileSystem, newPath).then(() => this.updateFiles());
                    else
                        File.copyDir(this.fileSystem, this.copiedFile.fullPath.substring(1), this.fileSystem, newPath).then(() => this.updateFiles());
                }
            });
        }
    }

    getParentDirectoryName(parentDir) {
        var split = parentDir.split('/');
        if (split.length > 2) {
            return split[split.length-2];
        } else
            return '';
    }

    getParentsPath(parentDir) {
        var split = parentDir.split('/');
        if (split.length > 2) {
            var name = split[split.length-2] + '/';
            return parentDir.substring(0, parentDir.length-name.length);
        } else
            return '/';
    }

    showMoreOptions(file, itemSliding) {
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
                                    handler: data => {
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

    dismiss() {
        this.viewCtrl.dismiss();
    }

}