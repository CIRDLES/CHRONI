angular.module('chroni.services')

.factory('XML', function($q, $cordovaFile) {

    var xmlFactory = function() {};

    function Aliquot(name, fractions, images) {
        this.name = name;
        this.fractions = fractions;
        this.images = images;

        // getters for variables
        this.getName = function() {
            return this.name;
        };
        this.getFractions = function() {
            return this.fractions;
        };
        this.getImages = function() {
            return this.images;
        };
    }

    function ReportSettings(categories) {
        this.categories = categories;

        // only one getter for categories
        this.getCategories = function() {
            return this.categories;
        };
    }

    var REPORT_CATEGORY_LIST = [
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

    xmlFactory.prototype = {

        checkFileValidity: function(file) {
            // if valid, returns the type of XML file ('Aliquot' or 'Report Settings')
            var deferred = $q.defer();
            var x2js = new X2JS();

            path = file.fullPath;
            if (path[0] === "/") {
                path = path.substring(1, path.length);
            }

            $cordovaFile.readAsText(cordova.file.dataDirectory, path)
                .then(function(result) {
                        var jsonObj = x2js.xml_str2json(result);
                        if (jsonObj) {
                            if (jsonObj["Aliquot"]) {
                                deferred.resolve("Aliquot");

                            } else if (jsonObj["ReportSettings"]) {
                                deferred.resolve("Report Settings");
                            }
                        }
                    },
                    function(error) {
                        deferred.reject(error);
                    });

            return deferred.promise;
        },

        createAliquot: function(file) {
            var deferred = $q.defer();

            // first checks if the file is a valid Aliquot
            this.checkFileValidity(file)
                .then(function(result) {
                    if (result === 'Aliquot') {
                        // groups these nodes into arrays (for duplicate nodes)
                        var arrayNodes = [
                            "Aliquot.analysisFractions.AnalysisFraction",
                            "Aliquot.analysisImages.AnalysisImage",
                            "Aliquot.analysisFractions.AnalysisFraction.ValueModel"
                        ];
                        var x2js = new X2JS({
                            arrayAccessFormPaths: arrayNodes
                        });

                        path = file.fullPath;
                        if (path[0] === "/") {
                            path = path.substring(1, path.length);
                        }

                        $cordovaFile.readAsText(cordova.file.dataDirectory, path)
                            .then(function(result) {
                                    var aliquotJson = x2js.xml_str2json(result);
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
                                        if (fractions["ValueModel"] && !Array.isArray(fractions["ValueModel"])) {
                                            var valueModelArray = [];
                                            valueModelArray.push(fractions["ValueModel"]);
                                            fractions["ValueModel"] = valueModelArray;
                                        }

                                        var aliquot = new Aliquot(aliquotName, fractions, images);
                                        deferred.resolve(aliquot);

                                    }
                                },
                                function(error) {
                                    deferred.reject(error);
                                });
                    } else
                        deferred.reject("Invalid Aliquot XML");

                }, function(error) {
                    deferred.reject(error);
                });

            return deferred.promise;
        },

        createReportSettings: function(file) {
            var deferred = $q.defer();

            // first checks if the file is a valid Aliquot
            this.checkFileValidity(file)
                .then(function(result) {
                    if (result === 'Report Settings') {
                        // groups these nodes into arrays (for duplicate nodes)
                        var arrayNodes = [
                            "ReportSettings./([A-Za-z])*Category([1-9])?/.categoryColumns.ReportColumn"
                        ];
                        var x2js = new X2JS({
                            arrayAccessFormPaths: arrayNodes
                        });

                        path = file.fullPath;
                        if (path[0] === "/") {
                            path = path.substring(1, path.length);
                        }

                        $cordovaFile.readAsText(cordova.file.dataDirectory, path)
                            .then(function(result) {
                                    var aliquotJson = x2js.xml_str2json(result);
                                    if (aliquotJson) {
                                        // first obtains the root node in ReportSettings XML
                                        var rootNodes = aliquotJson["ReportSettings"];

                                        var categories = {};
                                        REPORT_CATEGORY_LIST.forEach(function(category) {
                                            var categoryNode = rootNodes[category];

                                            // checks to make sure the ReportColumn object is an array (if there is a single node it will be an object)
                                            if (categoryNode["categoryColumns"]["ReportColumn"] && !Array.isArray(categoryNode["categoryColumns"]["ReportColumn"])) {
                                                var reportColumnArray = [];
                                                reportColumnArray.push(categoryNode["categoryColumns"]["ReportColumn"]);
                                                categoryNode["categoryColumns"]["ReportColumn"] = reportColumnArray;
                                            }

                                            categories[category] = categoryNode;
                                        });

                                        var reportSettings = new ReportSettings(categories);
                                        deferred.resolve(reportSettings);

                                    }
                                },
                                function(error) {
                                    deferred.reject(error);
                                });
                    } else
                        deferred.reject("Invalid Report Settings XML");

                }, function(error) {
                    deferred.reject(error);
                });

            return deferred.promise;
        },

        createTableData: function(aliquot, reportSettings) {
            var tableArray = [];

            // the Report Settings section of the table will have 4 rows
            var reportSettingsArray = [
                [],
                [],
                [],
                []
            ];
            var fractionArray = [];

            var categories = reportSettings.categories;

            // first orders the Categories by position index
            var orderedCategories = new Array(REPORT_CATEGORY_LIST.length);
            REPORT_CATEGORY_LIST.forEach(function(categoryName) {
                var category = categories[categoryName];
                orderedCategories[category["positionIndex"]] = category;
            });

            orderedCategories.forEach(function(category) {
                // first row contains Category names
                if (category["visible"] === "true")
                    reportSettingsArray[0].push(category["displayName"]);

                // TODO: finish filling the Report Settings section
            });

            console.log(JSON.stringify(reportSettingsArray));

            return tableArray;
        }

    }

    return xmlFactory;

});
