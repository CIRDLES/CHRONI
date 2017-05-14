CHRONI
=====================

**CHRONI** is a mobile application that presents archived data downloaded from the Geochron database in a customizable format for use by geologists in the field. The project is led and maintained by [CIRDLES](https://cirdles.org), an undergraduate research lab at the College of Charleston in Charleston, South Carolina.

This material is based upon work supported by the National Science Foundation under Grant Numbers [0930223](http://www.nsf.gov/awardsearch/showAward?AWD_ID=0930223) and [1443037](http://www.nsf.gov/awardsearch/showAward?AWD_ID=1443037).  Any opinions, findings, and conclusions or recommendations expressed in this material are those of the author(s) and do not necessarily reflect the views of the National Science Foundation.

For more information about this project, please contact [Jim Bowring](mailto://bowringj@cofc.edu).


<br/>

Getting Started for Contributors and Users:
-------------

Please have installed git tools, Xcode (mac), and a text editor. Make sure there is an updated Node.js version installed: http://nodejs.org/en/
Fork a copy of this project as your origin. Clone your repository onto your local and use the following commands to establish the upstream:

```bash
$ git remote add upstream https://github.com/CIRDLES/CHRONI.git
```

Installing Ionic: (Some commands might need sudo)

```bash
$ npm install -g cordova ionic
```
If this result in errors use this instead:

```bash
$ npm uninstall -g cordova
$ npm uninstall -g ionic
$ npm install -g cordova ionic
```
Ionic should now be installed with version 2 or higher. Use *ionic -v* to confirm. Continue with:

```bash
$ npm install
$ ionic resources
```

To emulate on an ios platform
-------------
Change directories to the CHRONI directory on the local and run:

```bash
$ ionic platform add ios
$ ionic emulate ios -lc
```

To emulate on android platform
-------------
Have Android Studio installed and create an AVD within Android Studio. Then add the android platform and check if its been installed:

```bash
$ ionic platform add android
$ ionic platform
```

Change directories to the CHRONI directory on the local and run:

```bash
$ ionic build android
$ ionic run android
```

<br/>

More info on this can be found on the Ionic [Getting Started](http://ionicframework.com/getting-started) page and the [Ionic CLI](https://github.com/driftyco/ionic-cli) repo.
