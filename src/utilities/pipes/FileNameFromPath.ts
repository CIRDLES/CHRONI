import { Pipe } from '@angular/core';

@Pipe({
  name: 'fileNameFromPath'
})
export class FileNameFromPathPipe {
  transform(value, args) {
    if (value && value !== '') {
      var split = value.split('/');
      if (split[split.length - 1] === '')
        return split[split.length - 2];
      else
        return split[split.length - 1];
    }
  }
}
