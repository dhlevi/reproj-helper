import { deepCopy } from "./deep-copy";
/**
 * FormatConverter is a utilit class that assists with converting
 * some spatial formats to others.
 *
 * Currently supports converting from/to Well Known Text and GeoJson
 * I'm sure you're immediately wondering why I did WKT Parsing without Regex
 * Me too... me too...
 */
var FormatConverter = /** @class */ (function () {
    function FormatConverter() {
        this.sourceWkt = null;
        this.sourceJson = null;
    }
    /**
     * Static instance constructor
     */
    FormatConverter.instance = function () {
        return new FormatConverter();
    };
    /**
     * Supply a WKT string to convert
     * This automatically converts to GeoJson
     * @param wkt Your WKT string
     */
    FormatConverter.prototype.fromWkt = function (wkt) {
        this.sourceWkt = wkt.trim();
        this.sourceJson = {
            type: 'Feature',
            properties: {},
            geometry: this.convertWktToJson()
        };
        return this;
    };
    /**
     * Converts to Well Known Text
     */
    FormatConverter.prototype.toWkt = function () {
        return this.convertToWkt();
    };
    /**
     * Convert a geojson feature
     * @param json GeoJSON feature
     */
    FormatConverter.prototype.fromGeoJson = function (json) {
        this.sourceJson = deepCopy(json);
        return this;
    };
    /**
     * Get the converted data as GeoJSON
     */
    FormatConverter.prototype.toGeoJson = function () {
        return this.sourceJson;
    };
    /**************************/
    /* WKT to JSON conversion */
    /**************************/
    FormatConverter.prototype.convertWktToJson = function () {
        if (!this.sourceWkt || this.sourceWkt.length === 0) {
            throw new Error('No WKT data supplied');
        }
        var type = this.sourceWkt.split(' ')[0].trim().toUpperCase();
        var typeMod = this.sourceWkt.split(' ')[1].trim().toUpperCase();
        var unsupported = ['EMPTY', 'ZM', 'M'].includes(typeMod);
        if (unsupported) {
            throw Error('Geometry is empty or using an unupported type!');
        }
        var data = this.sourceWkt.substring(this.sourceWkt.indexOf('(') + 1, this.sourceWkt.length - 1); // get the string, minus open/close brackets.
        return this.buildWktGeometry(type, data);
    };
    FormatConverter.prototype.buildWktGeometry = function (type, data) {
        try {
            switch (type) {
                case 'POINT': {
                    return {
                        type: 'Point',
                        coordinates: this.parseWktCoord(data)
                    };
                }
                case 'MULTIPOINT': {
                    // remove every last bracket from the string
                    var coords = data.trim().replace(/\(/g, '').replace(/\)/g, '');
                    return {
                        type: 'MultiPoint',
                        coordinates: this.parseWktLine(coords)
                    };
                }
                case 'LINESTRING': {
                    return {
                        type: 'LineString',
                        coordinates: this.parseWktLine(data)
                    };
                }
                case 'MULTILINESTRING': {
                    return {
                        type: 'MultiLineString',
                        coordinates: this.parseWktRing(data) // Multi Linestring is identical to Polygon
                    };
                }
                case 'POLYGON': {
                    return {
                        type: 'Polygon',
                        coordinates: this.parseWktRing(data)
                    };
                }
                case 'MULTIPOLYGON': {
                    var multiPolyGeom = {
                        type: 'MultiPolygon',
                        coordinates: []
                    };
                    var polygons = data.split(')),');
                    for (var _i = 0, polygons_1 = polygons; _i < polygons_1.length; _i++) {
                        var poly = polygons_1[_i];
                        // ensure double brackets are gone, and the string ends with a bracket (might have been trimmed by the split)
                        var cleanPoly = poly.replace('((', '(') + (poly.endsWith(')') ? '' : ')');
                        multiPolyGeom.coordinates.push(this.parseWktRing(cleanPoly.trim()));
                    }
                    return multiPolyGeom;
                }
                case 'GEOMETRYCOLLECTION': {
                    var geomCollection = {
                        type: 'GeometryCollection',
                        geometries: []
                    };
                    // for a geometry collection, we need to split up the geoms in the list.
                    // we can't split by ',' or even '),' though, because it's possible that
                    // we'd have multifeature geoms or poly's with rings.
                    var idxData = data.toUpperCase().replace(/POINT/g, '-POINT').replace(/LINESTRING/g, '-LINESTRING').replace(/POLYGON/g, '-POLYGON').replace(/MULTI-/g, '-MULTI').trim();
                    var geoms = idxData.split('-');
                    for (var _a = 0, geoms_1 = geoms; _a < geoms_1.length; _a++) {
                        var geom = geoms_1[_a];
                        if (geom && geom.length > 0) {
                            var cleanGeom = geom.trim().toUpperCase();
                            // remove any trailing commas
                            if (cleanGeom.endsWith(',')) {
                                cleanGeom = cleanGeom.substring(0, cleanGeom.length - 1);
                            }
                            var geomType = cleanGeom.split(' ')[0].trim();
                            var typeMod = cleanGeom.split(' ')[1].trim();
                            var unsupported = ['EMPTY', 'ZM', 'M'].includes(typeMod);
                            if (unsupported) {
                                throw Error('Geometry is empty or using an unupported type!');
                            }
                            var geomData = cleanGeom.substring(cleanGeom.indexOf('(') + 1, cleanGeom.length - 1); // get the string, minus open/close brackets.
                            geomCollection.geometries.push(this.buildWktGeometry(geomType, geomData));
                        }
                    }
                    return geomCollection;
                }
                default: {
                    throw new Error("WKT type of " + type + " is not currently supported");
                }
            }
        }
        catch (err) {
            throw Error(err);
        }
    };
    // Parsing for WKT to json
    FormatConverter.prototype.parseWktCoord = function (coord) {
        return [parseFloat(coord.trim().split(' ')[0]), parseFloat(coord.trim().split(' ')[1])];
    };
    // Parsing a Line WKT to json
    FormatConverter.prototype.parseWktLine = function (line) {
        var lineCoords = [];
        var coords = line.trim().split(',');
        for (var _i = 0, coords_1 = coords; _i < coords_1.length; _i++) {
            var coord = coords_1[_i];
            lineCoords.push(this.parseWktCoord(coord));
        }
        return lineCoords;
    };
    // Parsing a ring/polygon interior or exterior
    FormatConverter.prototype.parseWktRing = function (poly) {
        var ringCoords = [];
        var rings = poly.split('),');
        var idx = 0;
        for (var _i = 0, rings_1 = rings; _i < rings_1.length; _i++) {
            var ring = rings_1[_i];
            // ring length, but -1 if we end in a bracket
            var cleanedRing = ring.trim().substring(ring.trim().indexOf('(') + 1, ring.trim().length - (ring.endsWith(')') ? 1 : 0));
            ringCoords[idx] = this.parseWktLine(cleanedRing);
            idx += 1;
        }
        return ringCoords;
    };
    /*****************
     * Json to WKT
     *****************/
    FormatConverter.prototype.convertToWkt = function () {
        if (this.sourceJson) {
            if (this.sourceJson.type === 'FeatureCollection') {
                var wktString = 'GEOMETRYCOLLECTION (';
                for (var _i = 0, _a = this.sourceJson.features; _i < _a.length; _i++) {
                    var childFeature = _a[_i];
                    wktString += this.wktStringFromGeometry(childFeature.geometry) + ", ";
                }
                return wktString.substring(0, wktString.length - 2) + ')';
            }
            else if (this.sourceJson.type === 'Feature') {
                return this.wktStringFromGeometry(this.sourceJson.geometry);
            }
            else {
                return this.wktStringFromGeometry(this.sourceJson);
            }
        }
        return '';
    };
    FormatConverter.prototype.wktStringFromGeometry = function (geometry) {
        switch (geometry.type) {
            case 'Point': {
                return "POINT (" + this.toWktCoordString(geometry.coordinates) + ")";
            }
            case 'MultiPoint': {
                return "MULTIPOINT (" + this.lineToWktString(geometry.coordinates) + ")";
            }
            case 'LineString': {
                return "LINESTRING (" + this.lineToWktString(geometry.coordinates) + ")";
            }
            case 'MultiLineString': {
                return "MULTILINESTRING (" + this.ringToWktString(geometry.coordinates) + ")";
            }
            case 'Polygon': {
                return "POLYGON (" + this.ringToWktString(geometry.coordinates) + ")";
            }
            case 'MultiPolygon': {
                return "MULTIPOLYGON (" + this.polygonToWktString(geometry.coordinates) + ")";
            }
            case 'GeometryCollection': {
                var wktString = 'GEOMETRYCOLLECTION (';
                for (var _i = 0, _a = geometry.geometries; _i < _a.length; _i++) {
                    var childGeometry = _a[_i];
                    wktString += this.wktStringFromGeometry(childGeometry) + ", ";
                }
                return wktString.substring(0, wktString.length - 2) + ')';
            }
        }
    };
    FormatConverter.prototype.polygonToWktString = function (coordinates) {
        var coordString = '';
        for (var _i = 0, coordinates_1 = coordinates; _i < coordinates_1.length; _i++) {
            var coord = coordinates_1[_i];
            coordString += "(" + this.ringToWktString(coord) + "), ";
        }
        return coordString.substring(0, coordString.length - 2);
    };
    FormatConverter.prototype.ringToWktString = function (coordinates) {
        var coordString = '';
        for (var _i = 0, coordinates_2 = coordinates; _i < coordinates_2.length; _i++) {
            var coord = coordinates_2[_i];
            coordString += "(" + this.lineToWktString(coord) + "), ";
        }
        return coordString.substring(0, coordString.length - 2);
    };
    FormatConverter.prototype.lineToWktString = function (coordinates) {
        var coordString = '';
        for (var _i = 0, coordinates_3 = coordinates; _i < coordinates_3.length; _i++) {
            var coord = coordinates_3[_i];
            coordString += this.toWktCoordString(coord) + ", ";
        }
        return coordString.substring(0, coordString.length - 2);
    };
    FormatConverter.prototype.toWktCoordString = function (coordinate) {
        return coordinate[0] + " " + coordinate[1];
    };
    return FormatConverter;
}());
export { FormatConverter };
//# sourceMappingURL=format-converter.js.map