import { Pipe } from '@angular/core';

@Pipe({
  name: 'fileName'
})
export class FileNamePipe {
  transform(value, keepExt) {
    let retVal: string = '';
    if (value && value !== '') {
      let slashSplit = value.split('/');
      if (slashSplit.length > 1 && slashSplit[slashSplit.length - 1] === '')
        retVal = slashSplit[slashSplit.length - 2];
      else
        retVal = keepExt === true ? slashSplit[slashSplit.length - 1] : slashSplit[slashSplit.length - 1].split('.')[0];
    }
    return retVal;
  }
}
