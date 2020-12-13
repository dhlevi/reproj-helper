import { __awaiter, __generator } from "tslib";
import proj4 from "proj4";
import { deepCopy } from "./deep-copy";
var ReProjector = /** @class */ (function () {
    function ReProjector() {
        this.init();
        this.sourceFeature = null;
        // Defaults to projecting BC Albers into WGS 84, our most common use case
        this.fromProjection = 'EPSG:3005';
        this.toProjection = 'WGS84';
    }
    ReProjector.prototype.init = function () {
        console.debug('Initializing ReProjector');
        // Load any preset projections
        // BC Albers
        proj4.defs('EPSG:3005', 'PROJCS["NAD83 / BC Albers", GEOGCS["NAD83", DATUM["North_American_Datum_1983", SPHEROID["GRS 1980",6378137,298.257222101, AUTHORITY["EPSG","7019"]], TOWGS84[0,0,0,0,0,0,0], AUTHORITY["EPSG","6269"]], PRIMEM["Greenwich",0, AUTHORITY["EPSG","8901"]], UNIT["degree",0.0174532925199433, AUTHORITY["EPSG","9122"]], AUTHORITY["EPSG","4269"]], PROJECTION["Albers_Conic_Equal_Area"], PARAMETER["standard_parallel_1",50], PARAMETER["standard_parallel_2",58.5], PARAMETER["latitude_of_center",45], PARAMETER["longitude_of_center",-126], PARAMETER["false_easting",1000000], PARAMETER["false_northing",0], UNIT["metre",1, AUTHORITY["EPSG","9001"]], AXIS["Easting",EAST], AXIS["Northing",NORTH], AUTHORITY["EPSG","3005"]]');
        // Pseudo Mercator
        proj4.defs("EPSG:3857", "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs");
        // StatsCan Lambert
        proj4.defs("EPSG:3348", "+proj=lcc +lat_1=49 +lat_2=77 +lat_0=63.390675 +lon_0=-91.86666666666666 +x_0=6200000 +y_0=3000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
        // Canada Atlas Lambert
        proj4.defs("EPSG:3979", "+proj=lcc +lat_1=49 +lat_2=77 +lat_0=49 +lon_0=-95 +x_0=0 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
        // Yukon Albers
        proj4.defs("EPSG:3579", "+proj=aea +lat_1=61.66666666666666 +lat_2=68 +lat_0=59 +lon_0=-132.5 +x_0=500000 +y_0=500000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
        // Alberta 10-TM Forest
        proj4.defs("EPSG:3402", "+proj=tmerc +lat_0=0 +lon_0=-115 +k=0.9992 +x_0=500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
    };
    ReProjector.prototype.addDefinition = function (code, definition) {
        console.debug("Adding definition " + code);
        proj4.defs(code, definition);
    };
    ReProjector.prototype.feature = function (feature) {
        console.debug('Source Feature set');
        this.sourceFeature = feature;
        return this;
    };
    ReProjector.prototype.from = function (from) {
        console.debug("Projecting from " + from);
        this.fromProjection = from;
        return this;
    };
    ReProjector.prototype.to = function (to) {
        console.debug("Projecting to " + to);
        this.toProjection = to;
        return this;
    };
    ReProjector.prototype.project = function () {
        return __awaiter(this, void 0, void 0, function () {
            var clonedFeature, _i, _a, feature, _b, _c, geometry, _d, _e, geometry, _f, _g, geometry;
            return __generator(this, function (_h) {
                console.debug('Starting projection');
                if (!this.sourceFeature) {
                    console.error('No feature to project! Stopping');
                    throw new Error('Invalid Source Feature');
                }
                clonedFeature = deepCopy(this.sourceFeature);
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
            case 'LineString': {
                this.projectLineString(geometry.coordinates);
                break;
            }
            case 'MultiPoint': {
                this.projectLineString(geometry.coordinates);
                break;
            }
            case 'Polygon': {
                this.projectPolygon(geometry.coordinates);
                break;
            }
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
        var projectedCoords = proj4(this.fromProjection, this.toProjection, coords);
        coords[0] = projectedCoords[0];
        coords[1] = projectedCoords[1];
    };
    return ReProjector;
}());
export default ReProjector;
//# sourceMappingURL=reprojector.js.map