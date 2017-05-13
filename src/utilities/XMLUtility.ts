import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { FileEntry } from '@ionic-native/file';

import { BigNumber } from 'bignumber.js';
import X2JS from 'x2js';

import { FileUtility } from './FileUtility';
import { Aliquot, ReportSettings } from './ReportUtility';

@Injectable()
export class XMLUtility {

  REPORT_CATEGORY_LIST: Array<string> = [
    "fractionCategory",
    "compositionCategory",
    "isotopicRatiosCategory",
    "isotopicRatiosPbcCorrCategory",
    "datesCategory",
    "datesPbcCorrCategory",
    "rhosCategory",
    "traceElementsCategory",
    "fractionCategory2"
  ];
  // groups these nodes into arrays (for duplicate nodes)
  NODES_AS_ARRAYS: Array<string> = [
    "ReportSettings./([A-Za-z])*Category([1-9])?/.categoryColumns.ReportColumn",
    "Aliquot.analysisFractions.AnalysisFraction",
    "Aliquot.analysisImages.AnalysisImage",
    "Aliquot.analysisFractions.AnalysisFraction.ValueModel"
  ]

  private x2js: X2JS;

  constructor(private platform: Platform, private fileUtil: FileUtility) {

    this.platform.ready().then(() => {
      this.x2js = new X2JS({
        arrayAccessFormPaths: this.NODES_AS_ARRAYS
      });
      // sets the config for BigNumber so that it doesn't use scientific notation
      BigNumber.config({ EXPONENTIAL_AT: 1e+9, ERRORS: false });
    });

  }

  private createReportSettingsArray(reportSettings: ReportSettings) {
    // the Report Settings section of the table will have 4 rows
    var reportSettingsArray = [
      [],
      [],
      [],
      []
    ];
    var visibleCategories = [];

    var categories = reportSettings.getCategories();

    // first orders the Categories by position index
    var orderedCategories = new Array(this.REPORT_CATEGORY_LIST.length);
    var orderedCategoryNames = new Array(this.REPORT_CATEGORY_LIST.length);
    this.REPORT_CATEGORY_LIST.forEach(function(categoryName) {
      var category = categories[categoryName];
      orderedCategories[category["positionIndex"]] = category;
      orderedCategoryNames[category["positionIndex"]] = categoryName;
    });

    // then steps through the ordered categories
    for (let i = 0; i < orderedCategories.length; i++) {
      var category = orderedCategories[i];

      // only adds Category if it is visible
      if (category["visible"] === "true") {
        visibleCategories.push(orderedCategoryNames[i]);

        // the first row contains Category names
        reportSettingsArray[0].push([category["displayName"]]);

        // each Category will have three lists for the display names
        var displayName1Array = [];
        var displayName2Array = [];
        var displayName3Array = [];

        // steps through each ReportColumn
        var reportColumns = category["categoryColumns"]["ReportColumn"];
        reportColumns.forEach(function(reportColumn) {
          if (reportColumn["visible"] === "true") {

            // the second, third, and fourth rows hold the 3 display names
            displayName1Array.push(reportColumn["displayName1"]);
            displayName2Array.push(reportColumn["displayName2"]);
            displayName3Array.push(reportColumn["displayName3"]);

            // if there is an uncertainty column, adds it
            var uncertaintyColumn = reportColumn["uncertaintyColumn"];
            if (uncertaintyColumn && uncertaintyColumn !== "" && uncertaintyColumn["visible"] === "true") {
              displayName1Array.push(uncertaintyColumn["displayName1"]);

              // changes values of String uncertainties for third and fourth row
              if (uncertaintyColumn["displayName2"] === "PLUSMINUS2SIGMA")
                displayName2Array.push("\u00B12\u03C3");
              else
                displayName2Array.push(uncertaintyColumn["displayName2"]);

              if (uncertaintyColumn["displayName3"] === "PLUSMINUS2SIGMA%")
                displayName3Array.push("\u00B12\u03C3 %");
              else
                displayName3Array.push(uncertaintyColumn["displayName3"]);
            }
          }
        });

        // if there are no visible Report Columns, removes the Category completely
        if (displayName1Array.length === 0)
          reportSettingsArray[0].pop();

        else { // otherwise, adds the display names to the Category
          reportSettingsArray[1].push(displayName1Array);
          reportSettingsArray[2].push(displayName2Array);
          reportSettingsArray[3].push(displayName3Array);
        }
      }

    }

    // returns both the visible categories AND the Report Settings array
    return [reportSettingsArray, visibleCategories];
  }

  private createFractionArray(aliquot: Aliquot, reportSettings: ReportSettings, reportSettingsArray: Array<any>, visibleCategories: Array<any>) {

    var sizes = [];
    var hasDecimals = [];

    var fractionArray = [];
    var unitConversions = Numbers.getUnitConversions();

    // the first row of the fractions is empty except for the Aliquot Name
    var firstRow = [];
    for (let i = 0; i < reportSettingsArray[3].length; i++) {
      var categoryArray = [];
      // goes through each column in each category in the last row
      for (let j = 0; j < reportSettingsArray[3][i].length; j++) {
        if (reportSettingsArray[3][i][j] === "Fraction")
          categoryArray.push(aliquot.getName());
        else
          categoryArray.push("");
      }
      firstRow.push(categoryArray);
    }
    fractionArray.push(firstRow);

    // steps through each fraction in the aliquot
    aliquot.getFractions().forEach(function(fraction) {
      var currentRowArray = [];
      var colIndex = 0;

      // steps through each visible Category
      visibleCategories.forEach(function(categoryName, catIndex) {
        var category = reportSettings.getCategories()[categoryName];
        var currentCategoryArray = [];

        // steps through each Report Column per Category
        category["categoryColumns"]["ReportColumn"].forEach(function(column) {

          // FILLS IN UNCERTAINTY COLUMN

          var columnVisible = (column["visible"] === "true");

          var uncertaintyColumn = column["uncertaintyColumn"];
          var uncertaintyValue = new BigNumber();
          var uncertaintyIsVisible = (uncertaintyColumn["visible"] === "true");

          if (uncertaintyColumn && uncertaintyColumn != "") {
            var uncertaintyValueModel = fraction["ValueModelsByName"][uncertaintyColumn["retrieveVariableName"]];

            if (uncertaintyValueModel) {

              var oneSigma = parseFloat(uncertaintyValueModel["oneSigma"]);
              var initialValue = parseFloat(uncertaintyValueModel["value"]);
              var currentUnit = column["units"];

              var uncertaintyType = column["uncertaintyType"];

              var uncertaintyCntSigDigits = uncertaintyColumn["countOfSignificantDigits"];
              var isArbitraryDigitCnt = (
                uncertaintyColumn["displayedWithArbitraryDigitCount"] === "true"
              );

              // performs mathematical computations
              if (unitConversions.hasOwnProperty(currentUnit)) {
                // obtains unrounded number
                var dividingNum = unitConversions[currentUnit];
                var valueToRound = new BigNumber(
                  (oneSigma / Math.pow(10, dividingNum)) * 2
                );

                // rounds the number based on Report Settings
                if (uncertaintyType === "PCT") {
                  // if percent uncertainty, rounds using simple algorithm
                  valueToRound = new BigNumber(
                    (oneSigma / initialValue) * 200
                  );
                }

                if (isArbitraryDigitCnt) {
                  // if arbitrary, rounds decimal places
                  uncertaintyValue = valueToRound.round(
                    uncertaintyCntSigDigits, BigNumber.ROUND_HALF_UP
                  );

                } else {
                  // if not arbitrary, rounds to sig figs
                  uncertaintyValue = valueToRound.toDigits(
                    uncertaintyCntSigDigits, BigNumber.ROUND_HALF_UP
                  );
                }
                // only adds uncertainty if visible
                if (columnVisible && uncertaintyIsVisible) {
                  var val = uncertaintyValue.toString();
                  currentCategoryArray.push(val);

                  // adds or changes necessary length stats for the column
                  if (val.includes(".")) {

                    if (colIndex >= hasDecimals.length)
                      hasDecimals.push(true);
                    else
                      hasDecimals[colIndex + 1] = true;

                    var len = val.split(".")[1].length;
                    if (colIndex >= sizes.length)
                      sizes.push(len);
                    else {
                      if (len > sizes[colIndex + 1])
                        sizes[colIndex + 1] = len;
                    }

                  } else {

                    if (colIndex >= hasDecimals.length)
                      hasDecimals.push(false);

                    // no need for padding a column with no decimals
                    if (colIndex >= sizes.length)
                      sizes.push(0);

                  }
                }

              }


            } else {
              if (columnVisible && uncertaintyIsVisible)
                // when Value Model is null, sets to "-"
                currentCategoryArray.push("-");
            }

          }

          // FILLS IN FRACTION COLUMN

          var variableName = column["retrieveVariableName"];

          // must account for the fraction column, it will not have a variable name
          if (!variableName || variableName === "") {
            var methodName = column["retrieveMethodName"];

            if (methodName === "getFractionID") {
              var fractionID = fraction["fractionID"];

              // adds the ID if it is visible
              if (columnVisible) {
                if (uncertaintyIsVisible) {
                  // if uncertainty is visible, must splice it so that it goes before the uncertainty column
                  currentCategoryArray.splice(
                    currentCategoryArray.length - 1, 0, fractionID
                  );

                } else {
                  // otherwise just adds it to the end
                  currentCategoryArray.push(fractionID);
                }
              }

            } else if (methodName === "getNumberOfGrains") {
              // adds the ID if it is visible
              if (columnVisible) {
                if (uncertaintyIsVisible) {
                  // if uncertainty is visible, must splice it so that it goes before the uncertainty column
                  currentCategoryArray.splice(
                    currentCategoryArray.length - 1, 0, fractionID
                  );

                } else {
                  // otherwise just adds it to the end
                  currentCategoryArray.push(fractionID);
                }
              }
            }

          } else {
            // obtains the correct Value Model based on the variable name
            var fractionValue = "";
            var valueModel = fraction["ValueModelsByName"][variableName];

            if (valueModel) {

              var initialValue = parseFloat(valueModel["value"]);
              var currentUnit = column["units"];

              var isArbitraryDigitCnt = (
                column["displayedWithArbitraryDigitCount"] === "true"
              );
              var cntSigDigits = column["countOfSignificantDigits"];

              var uncertaintyType = uncertaintyColumn["uncertaintyType"];
              var uncertaintyIsArbitraryDigitCnt = (
                uncertaintyColumn["displayedWithArbitraryDigitCount"] === "true"
              );

              // performs mathematical computations
              if (unitConversions.hasOwnProperty(currentUnit)) {
                var dividingNum = unitConversions[currentUnit];
                var valueToRound = new BigNumber(
                  initialValue / Math.pow(10, dividingNum)
                );

                /**
                 * Obtains the roundedValue for the current column,
                 * based on the following found in the report
                 * settings:
                 *
                 * 1. if it is in arbitrary format
                 * 2. if it is in sig fig format
                 *      a) if the uncertainty column is also in
                 *         sig fig format
                 *      b) if the uncertainty column is in
                 *         arbitrary format
                 */

                if (isArbitraryDigitCnt) {
                  // if arbitrary format, rounds decimal places
                  fractionValue = valueToRound.round(
                    cntSigDigits, BigNumber.ROUND_HALF_UP
                  );

                } else {
                  // if sig fig format, checks uncertainty (if it exists)
                  if (uncertaintyColumn && uncertaintyColumn != "") {
                    // if fraction is in sig fig format but the uncertainty is not, rounds fraction to sig figs
                    if (uncertaintyIsArbitraryDigitCnt) {
                      fractionValue = valueToRound.toDigits(
                        cntSigDigits, BigNumber.ROUND_HALF_UP
                      );

                    } else {
                      // if both are sig figs, rounds based on uncertainty value
                      if (uncertaintyType === "ABS") {
                        // when uncertainty is absolute, number of decimal digits must match
                        var numDecimalDigits = uncertaintyValue.decimalPlaces();

                        fractionValue = valueToRound.round(
                          numDecimalDigits, BigNumber.ROUND_HALF_UP
                        );

                      } else {
                        // when uncertainty is percent, the number of fraction decimal digits is the same as the number of decimal digits when the number resulting from the following equation is rounded to the uncertainty digit count:
                        // fraction * (uncertainty / 100)

                        var uncertaintyCntSigDigits = uncertaintyColumn["countOfSignificantDigits"];

                        var modelNumber = new BigNumber(
                          valueToRound.times(
                            uncertaintyValue.times(0.01)
                          )
                        );
                        modelNumber = modelNumber.round(
                          uncertaintyCntSigDigits, BigNumber.ROUND_HALF_UP
                        );

                        // rounds based on the model's number of decimal places
                        fractionValue = valueToRound.round(
                          modelNumber.decimalPlaces(), BigNumber.ROUND_HALF_UP
                        );
                      }
                    }

                  }
                }

                val = fractionValue.toString();

                if (columnVisible) {

                  if (uncertaintyIsVisible) {
                    // if uncertainty is visible, must splice it so that it goes before the uncertainty column
                    currentCategoryArray.splice(
                      currentCategoryArray.length - 1, 0, val
                    );

                    // adds or changes necessary length stats for the column
                    if (val.includes(".")) {

                      if (colIndex >= hasDecimals.length - 1)
                        hasDecimals.splice(colIndex, 0, true);
                      else
                        hasDecimals[colIndex] = true;

                      var len = val.split(".")[1].length;
                      if (colIndex >= sizes.length - 1)
                        sizes.splice(colIndex, 0, len);
                      else {
                        if (len > sizes[colIndex])
                          sizes[colIndex] = len;
                      }

                    } else {

                      if (colIndex >= hasDecimals.length - 1)
                        hasDecimals.splice(colIndex, 0, false);

                      // no need for padding a column with no decimals
                      if (colIndex >= sizes.length - 1)
                        sizes.splice(colIndex, 0, 0);

                    }

                  } else {
                    // otherwise just adds it to the end
                    currentCategoryArray.push(val);

                    // adds or changes necessary length stats for the column
                    if (val.includes(".")) {

                      if (colIndex >= hasDecimals.length)
                        hasDecimals.push(true);
                      else
                        hasDecimals[colIndex] = true;

                      var len = val.split(".")[1].length;
                      if (colIndex >= sizes.length)
                        sizes.push(len);
                      else {
                        if (len > sizes[colIndex])
                          sizes[colIndex] = len;
                      }


                    } else {

                      if (colIndex >= hasDecimals.length)
                        hasDecimals.push(false);

                      // no need for padding a column with no decimals
                      if (colIndex >= sizes.length)
                        sizes.push(0);

                    }
                  }

                  if (uncertaintyIsVisible)
                    colIndex += 2;
                  else
                    colIndex++;
                }

              }

            } else {
              if (columnVisible)
                currentCategoryArray.push("-");
            }
          }
        });
        // pushes the entire row of values to the current Category
        currentRowArray.push(currentCategoryArray);
      });
      // pushes the entire Category to the fraction array
      fractionArray.push(currentRowArray);
      colIndex = 0;
    });

    // must now add padding to the numbers
    var currentColumn = 0;
    for (let i = 1; i < fractionArray.length; i++) {
      var row = fractionArray[i];

      // loops through categories, not including first and last (names of fraction)
      for (let j = 1; j < row.length - 1; j++) {
        var category = row[j];

        for (let k = 0; k < category.length; k++) {
          var val = category[k];
          if (val !== "-") {

            // does this column contain a decimal?
            if (hasDecimals[currentColumn]) {
              var maxSize = sizes[currentColumn];
              var padding = 0;

              if (val.includes("."))
                // padding is equal to the difference in decimal lengths
                padding = maxSize - val.split(".")[1].length;
              else
                // adds one to account for the decimal place
                padding = maxSize + 1;

              fractionArray[i][j][k] = val + " ".repeat(padding);

            }

            currentColumn++;
          }

        }
      }

      currentColumn = 0;
    }

    return fractionArray;
  }

  public checkFileValidity(file: FileEntry, directory: string = "data"): Observable<string> {
    var path = file.fullPath;
    if (path[0] === '/')
      path = path.substring(1);

    return new Observable(observer => {
      this.fileUtil.readFileText(path, directory)
        .subscribe(
        fileData => {
          var jsonObj = this.x2js.xml2js(fileData);
          if (jsonObj) {
            if (jsonObj['Aliquot'])
              observer.next('Aliquot');
            else if (jsonObj['ReportSettings'])
              observer.next('Report Settings');
            else
              observer.error('Invalid file...');
          } else
            observer.error('Invalid file...');
        }, error => observer.error(error));
    });
  }

  public createAliquot(file: FileEntry): Observable<Aliquot> {

    return new Observable(observer => {
      this.checkFileValidity(file).subscribe(result => {
        if (result === 'Aliquot') {
          var path = file.fullPath;
          if (path[0] === '/')
            path = path.substring(1);

          this.fileUtil.readFileText(path)
            .subscribe(
            fileData => {
              var aliquotJson = this.x2js.xml2js(fileData);
              if (aliquotJson) {
                // first obtains the root node in Aliquot XML
                var rootNodes = aliquotJson["Aliquot"];

                // then obtains each of the values for the aliquot
                var aliquotName = rootNodes["aliquotName"];
                var fractions = rootNodes["analysisFractions"]["AnalysisFraction"];
                var images = rootNodes["analysisImages"]["AnalysisImage"];

                // checks to make sure all arrays are actually arrays (will be object if only one node)
                if (fractions && !Array.isArray(fractions)) {
                  var fractionArray = [];
                  fractionArray.push(fractions);
                  fractions = fractionArray;
                }
                if (images && !Array.isArray(images)) {
                  var imagesArray = [];
                  imagesArray.push(images);
                  images = imagesArray;
                }

                // adds a Value Models object to each fraction which contains every Value Model indexed by their names
                fractions.forEach(function(fraction) {
                  fraction["ValueModelsByName"] = {};
                  var valueModelObj = fraction["ValueModelsByName"];

                  for (var key in fraction) {
                    if (fraction.hasOwnProperty(key)) {
                      // obtains Value Models if they exist
                      var valueModelList = fraction[key]["ValueModel"];
                      if (valueModelList) {
                        // first ensures that it is a list
                        if (valueModelList && !Array.isArray(valueModelList)) {
                          var valueModelArray = [];
                          valueModelArray.push(valueModelList);
                          valueModelList = valueModelArray;
                        }

                        // puts each Value Model into the fraction's new ValueModelsByName object
                        valueModelList.forEach(function(model) {
                          valueModelObj[model.name] = model;
                        });
                      }
                    }
                  }

                });

                this.fileUtil.getFile(path).subscribe((file: FileEntry) => {
                  let aliquot: Aliquot = new Aliquot(aliquotName, fractions, images, file, this.fileUtil);
                  observer.next(aliquot);
                });
              }
            }, error => observer.error(error)
            );
        } else
          observer.error("invalid Aliquot XML file");

      }, error => observer.error("invalid Aliquot XML file"));
    });

  }

  public createReportSettings(file: FileEntry): Observable<ReportSettings> {

    return new Observable(observer => {
      this.checkFileValidity(file).subscribe(result => {
        if (result === 'Report Settings') {
          var path = file.fullPath;
          if (path[0] === '/')
            path = path.substring(1);

          this.fileUtil.readFileText(path).subscribe(result => {
            var aliquotJson = this.x2js.xml2js(result);
            if (aliquotJson) {
              // first obtains the root node in ReportSettings XML
              var rootNodes = aliquotJson["ReportSettings"];

              var categories = {};
              this.REPORT_CATEGORY_LIST.forEach(function(category) {
                var categoryNode = rootNodes[category];

                // checks to make sure the ReportColumn object is an array (if there is a single node it will be an object)
                if (categoryNode["categoryColumns"]["ReportColumn"] && !Array.isArray(categoryNode["categoryColumns"]["ReportColumn"])) {
                  var reportColumnArray = [];
                  reportColumnArray.push(categoryNode["categoryColumns"]["ReportColumn"]);
                  categoryNode["categoryColumns"]["ReportColumn"] = reportColumnArray;
                }

                categories[category] = categoryNode;
              });

              this.fileUtil.getFile(path).subscribe((file: FileEntry) => {
                let reportSettings: ReportSettings = new ReportSettings(categories, file);
                observer.next(reportSettings);
              });
            }
          }, error => observer.error(error));
        } else
          observer.error("invalid Report Settings XML file");

      }, error => observer.error("invalid Report Settings XML file"));
    });

  }

  public createTableData(aliquot: Aliquot, reportSettings: ReportSettings) {
    // stores the returned list of the Report Settings array and visible categories into a temporary variable
    var temp = this.createReportSettingsArray(reportSettings);
    var reportSettingsArray = temp[0];
    var visibleCategories = temp[1];

    var fractionArray = this.createFractionArray(aliquot, reportSettings, reportSettingsArray, visibleCategories);

    var tableArray = reportSettingsArray.concat(fractionArray);

    return tableArray;
  }
}

export class Numbers {

  static _unitConversions = {
    "": 0,

    // mass is stored in grams
    "g": 0,
    "mg": -3,
    "\u03bcg": -6,
    "ng": -9,
    "pg": -12,
    "fg": -15,

    // concentrations
    "\u0025": -2,
    "\u2030": -3,
    "ppm": -6,
    "ppb": -9,
    "g/g": 0,

    // dates are stored in years
    "a": 0,
    "ka": 3,
    "Ma": 6,
    "Ga": 9,

    // misc in % per amu
    "%/amu": -2
  };

  constructor() { }

  static getUnitConversions() {
    return this._unitConversions;
  }
}
