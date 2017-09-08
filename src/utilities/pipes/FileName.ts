import { Pipe } from '@angular/core';

@Pipe({
  name: 'fileName'
})
export class FileNamePipe {
  transform(value, args) {
    if (value && value !== '') {
      var split = value.split('.');
      var lengthToCut = split[split.length - 1].length + 1;
      return value.substring(0, value.length - lengthToCut);
    }
  }
}
