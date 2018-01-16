import { FileEntry } from '@ionic-native/file';

import { FileUtility } from '../utilities/FileUtility';

export class Aliquot {
  private concordiaFile: FileEntry;
  private probabilityDensityFile: FileEntry;

  constructor(
    private name: string,
    private fractions: Array<any>,
    private images: Array<any>,
    private fileEntry: FileEntry,
    private fileUtil: FileUtility
  ) {
    for (let imageObj of images) {
      if (imageObj['imageType'] === 'concordia') {
        let fileName = this.getFileName().split('.xml')[0] + '_concordia.svg';
        this.fileUtil
          .fileExists(fileName, 'cache')
          .subscribe((exists: boolean) => {
            if (exists) {
              this.fileUtil
                .getFile(fileName, 'cache')
                .subscribe((file: FileEntry) => (this.concordiaFile = file));
            } else {
              this.fileUtil
                .downloadFile(imageObj['imageURL'], fileName, 'cache')
                .subscribe((file: FileEntry) => (this.concordiaFile = file));
            }
          });
      } else if (imageObj['imageType'] === 'probability_density') {
        let fileName = this.name + '_probability_density.svg';
        this.fileUtil
          .fileExists(fileName, 'cache')
          .subscribe((exists: boolean) => {
            if (exists) {
              this.fileUtil
                .getFile(fileName, 'cache')
                .subscribe(
                  (file: FileEntry) => (this.probabilityDensityFile = file)
                );
            } else {
              this.fileUtil
                .downloadFile(imageObj['imageURL'], fileName, 'cache')
                .subscribe(
                  (file: FileEntry) => (this.probabilityDensityFile = file)
                );
            }
          });
      }
    }
  }

  public getFileName(): string {
    return this.fileEntry.name;
  }

  public setFileEntry(newFile: FileEntry) {
    this.fileEntry = newFile;
  }

  public getName(): string {
    return this.name;
  }

  public getFractions() {
    return this.fractions;
  }

  public getImages() {
    return this.images;
  }

  public hasConcordia() {
    return this.concordiaFile !== null;
  }

  public hasProbabilityDensity() {
    return this.probabilityDensityFile !== null;
  }

  public getProbabilityDensity(): FileEntry {
    return this.probabilityDensityFile;
  }

  public getConcordia(): FileEntry {
    return this.concordiaFile;
  }

  public setProbabilityDensity(probabilityDensity: FileEntry): void {
    this.probabilityDensityFile = probabilityDensity;
  }

  public setConcordia(concordia: FileEntry): void {
    this.concordiaFile = concordia;
  }

  public getFilePath(): string {
    return this.fileEntry.fullPath.slice(1);
  }

  public setFilePath(newPath: string) {
    if (newPath[0] !== '/') newPath = '/' + newPath;
    this.fileEntry.fullPath = newPath;
  }
}
