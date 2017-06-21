import { Component } from '@angular/core';

import { Platform } from 'ionic-angular';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class About {

  constructor(public platform: Platform) { }

}
