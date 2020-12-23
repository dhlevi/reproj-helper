"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReProjector = void 0;
var tslib_1 = require("tslib");
var proj4_1 = tslib_1.__importDefault(require("proj4"));
var deep_copy_1 = require("./deep-copy");
var https = tslib_1.__importStar(require("https"));
/**
 * A simple Reprojection class that works with Proj4 for
 * simplifying reprojection of GeoJson objects.
 *
 * Defaults to BC Albers and WGS84, but any projection string
 * Proj4 supports can be included.
 *
 * Supports projecting GeoJSON Geometry, GeometryCollection, Feature and FeatureCollection objects
 *
 * Supports chaining functions together for convinience, ie:
 * projector.from().to().source().project();
 */
var ReProjector = /** @class */ (function () {
    /**
     * Constructor for ReProjector class. This will initialize a set of proejction definitions as well.
     * Definitions include: [ EPSG:3005, EPSG:3857, EPSG:3348, EPSG:3979, EPSG:3579, EPSG:3402 ] as well as
     * UTM zones 7N through 15N (As codes UTM<zone number>)
     * Default From Projection is EGSP:3005
     * Default To projection is WGS84
     */
    function ReProjector() {
        this.init();
        this.sourceFeature = null;
        // Defaults to projecting BC Albers into WGS 84, our most common use case
        this.fromProjection = 'EPSG:3005';
        this.toProjection = 'WGS84';
    }
    /**
     * Static initializer for a ReProjector instance
     * Useful if you intend on chaining, ie:
     * ReProjector.instance().feature({...}).from('EPSG:3005').to('EPSG:3579').project();
     */
    ReProjector.instance = function () {
        return new ReProjector();
    };
    ReProjector.prototype.init = function () {
        console.debug('Initializing ReProjector');
        // Load any preset projections
        // BC Albers
        proj4_1.default.defs('EPSG:3005', 'PROJCS["NAD83 / BC Albers", GEOGCS["NAD83", DATUM["North_American_Datum_1983", SPHEROID["GRS 1980",6378137,298.257222101, AUTHORITY["EPSG","7019"]], TOWGS84[0,0,0,0,0,0,0], AUTHORITY["EPSG","6269"]], PRIMEM["Greenwich",0, AUTHORITY["EPSG","8901"]], UNIT["degree",0.0174532925199433, AUTHORITY["EPSG","9122"]], AUTHORITY["EPSG","4269"]], PROJECTION["Albers_Conic_Equal_Area"], PARAMETER["standard_parallel_1",50], PARAMETER["standard_parallel_2",58.5], PARAMETER["latitude_of_center",45], PARAMETER["longitude_of_center",-126], PARAMETER["false_easting",1000000], PARAMETER["false_northing",0], UNIT["metre",1, AUTHORITY["EPSG","9001"]], AXIS["Easting",EAST], AXIS["Northing",NORTH], AUTHORITY["EPSG","3005"]]');
        // Pseudo Mercator
        proj4_1.default.defs("EPSG:3857", "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs");
        // StatsCan Lambert
        proj4_1.default.defs("EPSG:3348", "+proj=lcc +lat_1=49 +lat_2=77 +lat_0=63.390675 +lon_0=-91.86666666666666 +x_0=6200000 +y_0=3000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
        // Canada Atlas Lambert
        proj4_1.default.defs("EPSG:3979", "+proj=lcc +lat_1=49 +lat_2=77 +lat_0=49 +lon_0=-95 +x_0=0 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
        // Yukon Albers
        proj4_1.default.defs("EPSG:3579", "+proj=aea +lat_1=61.66666666666666 +lat_2=68 +lat_0=59 +lon_0=-132.5 +x_0=500000 +y_0=500000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
        // Alberta 10-TM Forest
        proj4_1.default.defs("EPSG:3402", "+proj=tmerc +lat_0=0 +lon_0=-115 +k=0.9992 +x_0=500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
        // utms 7N through 15n
        proj4_1.default.defs("UTM7", "+proj=utm +zone=7 +datum=WGS84 +units=m +no_defs");
        proj4_1.default.defs("UTM8", "+proj=utm +zone=8 +datum=WGS84 +units=m +no_defs");
        proj4_1.default.defs("UTM9", "+proj=utm +zone=9 +datum=WGS84 +units=m +no_defs");
        proj4_1.default.defs("UTM10", "+proj=utm +zone=10 +datum=WGS84 +units=m +no_defs");
        proj4_1.default.defs("UTM11", "+proj=utm +zone=11 +datum=WGS84 +units=m +no_defs");
        proj4_1.default.defs("UTM12", "+proj=utm +zone=12 +datum=WGS84 +units=m +no_defs");
        proj4_1.default.defs("UTM13", "+proj=utm +zone=13 +datum=WGS84 +units=m +no_defs");
        proj4_1.default.defs("UTM14", "+proj=utm +zone=14 +datum=WGS84 +units=m +no_defs");
        proj4_1.default.defs("UTM15", "+proj=utm +zone=15 +datum=WGS84 +units=m +no_defs");
    };
    /**
     * Adds a definition string to Proj4. Use the definition by specifying the
     * code set here in the to and from functions
     * @param code Your desired code
     * @param definition The proj4 definition string
     */
    ReProjector.prototype.addDefinition = function (code, definition) {
        console.debug("Adding definition " + code + " - " + definition);
        proj4_1.default.defs(code, definition);
        return this;
    };
    /**
     * Set the feature you wish to project. The projected feature will be a deep copy
     * The original feature passed in will be untouched.
     * @param feature Feature Type
     */
    ReProjector.prototype.feature = function (feature) {
        console.debug('Source Feature set');
        this.sourceFeature = feature;
        return this;
    };
    /**
     * Projection code to use on the "from" projection
     * @param from Code (usually an EPSG Code)
     */
    ReProjector.prototype.from = function (from) {
        console.debug("Projecting from " + from);
        this.fromProjection = from;
        return this;
    };
    /**
     * Projection code to use on the "To" projection
     * @param from Code (usually an EPSG Code)
     */
    ReProjector.prototype.to = function (to) {
        console.debug("Projecting to " + to);
        this.toProjection = to;
        return this;
    };
    /**
     * Will attempt to load a proj4 definition from epsg.io
     * @param epsgCode An EPSG Code, 3005 or EPSG:3005
     */
    ReProjector.prototype.addDefinitionFromEpsgIo = function (epsgCode) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var code, newDef;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        code = epsgCode.trim().includes(':') ? epsgCode.split(':')[1].trim() : epsgCode.trim();
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                https.get("https://epsg.io/" + code + ".proj4", function (resp) {
                                    var data = '';
                                    resp.on('data', function (chunk) {
                                        data += chunk;
                                    });
                                    resp.on('end', function () {
                                        resolve(data);
                                    });
                                }).on("error", function (err) {
                                    reject(err);
                                });
                            })];
                    case 1:
                        newDef = _a.sent();
                        if (newDef && newDef.length > 0) {
                            this.addDefinition(epsgCode, newDef);
                        }
                        else {
                            throw new Error("Could not find definition for \"" + epsgCode + "\"");
                        }
                        return [2 /*return*/, newDef];
                }
            });
        });
    };
    /**
     * Run the projection. This function is asyncronous and will
     * return a promise by default. The source feature must be set prior
     * Your source feature will be deep cloned and not modified by this process
     */
    ReProjector.prototype.project = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var clonedFeature, _i, _a, feature, _b, _c, geometry, _d, _e, geometry, _f, _g, geometry;
            return tslib_1.__generator(this, function (_h) {
                console.debug('Starting projection');
                if (!this.sourceFeature) {
                    console.error('No feature to project! Stopping');
                    throw new Error('Invalid Source Feature');
                }
                clonedFeature = null;
                try {
                    clonedFeature = deep_copy_1.deepCopy(this.sourceFeature);
                    if (clonedFeature.type === 'FeatureCollection') {
                        for (_i = 0, _a = clonedFeature.features; _i < _a.length; _i++) {
                            feature = _a[_i];
                            if (feature.geometry.type === 'GeometryCollection') {
                                for (_b = 0, _c = feature.geometry.geometries; _b < _c.length; _b++) {
                                    geometry = _c[_b];
                                    this.projectGeometry(geometry);
                                }
                            }
                            else {
                                this.projectGeometry(feature.geometry);
                            }
                        }
                    }
                    else if (clonedFeature.type === 'GeometryCollection') {
                        for (_d = 0, _e = clonedFeature.geometries; _d < _e.length; _d++) {
                            geometry = _e[_d];
                            this.projectGeometry(geometry);
                        }
                    }
                    else if (clonedFeature.type === 'Feature' && clonedFeature.geometry.type === 'GeometryCollection') {
                        for (_f = 0, _g = clonedFeature.geometry.geometries; _f < _g.length; _f++) {
                            geometry = _g[_f];
                            this.projectGeometry(geometry);
                        }
                    }
                    else if (clonedFeature.type === 'Feature') {
                        this.projectGeometry(clonedFeature.geometry);
                    }
                    else {
                        this.projectGeometry(clonedFeature);
                    }
                }
                catch (err) {
                    console.error("Failed to reproject feature: " + err);
                }
                return [2 /*return*/, clonedFeature];
            });
        });
    };
    ReProjector.prototype.projectGeometry = function (geometry) {
        switch (geometry.type) {
            case 'Point': {
                this.projectPoint(geometry.coordinates);
                break;
            }
            case 'LineString':
            case 'MultiPoint': {
                this.projectLineString(geometry.coordinates);
                break;
            }
            case 'Polygon':
            case 'MultiLineString': {
                this.projectPolygon(geometry.coordinates);
                break;
            }
            case 'MultiPolygon': {
                for (var _i = 0, _a = geometry.coordinates; _i < _a.length; _i++) {
                    var poly = _a[_i];
                    this.projectPolygon(poly);
                }
                break;
            }
            default: {
                console.error('No valid type found for this geometry. Projection cancelled');
                console.error(geometry);
                break;
            }
        }
    };
    ReProjector.prototype.projectPolygon = function (polygon) {
        for (var i = 0; i < polygon.length; i++) {
            this.projectLineString(polygon[i]);
        }
    };
    ReProjector.prototype.projectLineString = function (lineString) {
        for (var i = 0; i < lineString.length; i++) {
            this.projectPoint(lineString[i]);
        }
    };
    ReProjector.prototype.projectPoint = function (coords) {
        var projectedCoords = proj4_1.default(this.fromProjection, this.toProjection, coords);
        for (var i = 0; i < projectedCoords.length; i++) {
            coords[i] = projectedCoords[i];
        }
    };
    return ReProjector;
}());
exports.ReProjector = ReProjector;
//# sourceMappingURL=reprojector.js.map