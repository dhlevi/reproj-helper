/**
 * A Utilities class containing functions for performing various
 * helpful utilities, like distance calculations, UTM zone helpers, etc.
 */
var SpatialUtils = /** @class */ (function () {
    function SpatialUtils() {
    }
    /**
     * Returns the UTM Zone for a given longitude. Includes rules beyond just BC/Canada
     * @param latitude The Latitude. Needed to determine zones with special rules (Svalbard)
     * @param longitude The Longitude
     */
    SpatialUtils.utmZone = function (latitude, longitude) {
        var zoneNumber = Math.floor((longitude + 180) / 6) + 1;
        if (latitude >= 56.0 && latitude < 64.0 && longitude >= 3.0 && longitude < 12.0) {
            zoneNumber = 32;
        }
        // Special zones for Svalbard
        if (latitude >= 72.0 && latitude < 84.0) {
            if (longitude >= 0.0 && longitude < 9.0)
                zoneNumber = 31;
            else if (longitude >= 9.0 && longitude < 21.0)
                zoneNumber = 33;
            else if (longitude >= 21.0 && longitude < 33.0)
                zoneNumber = 35;
            else if (longitude >= 33.0 && longitude < 42.0)
                zoneNumber = 37;
        }
        return zoneNumber;
    };
    /**
     * Determine the UTM Zone letter code
     * @param latitude the Latitude
     */
    SpatialUtils.utmLetterDesignation = function (latitude) {
        var letter = '';
        if (-80 <= latitude && latitude <= 84) {
            letter = 'CDEFGHJKLMNPQRSTUVWXX'[Math.floor((latitude + 80) / 8)];
        }
        else {
            letter = 'Z'; // Error flag. Outside UTM Limits
        }
        return letter;
    };
    /**
     * Returns a string representing the UTM zone and letter code for a given latitude and longitude
     * @param latitude The latitude
     * @param longitude The longitude
     */
    SpatialUtils.utmZoneString = function (latitude, longitude) {
        var zoneNumber = this.utmZone(latitude, longitude);
        var zoneLetter = this.utmLetterDesignation(latitude);
        return 'UTM' + zoneNumber + '' + zoneLetter;
    };
    /**
     * Generates a DMS string from a given decimal degree.
     * @param dd The decimal degrees
     * @param showMarks Show degree characters
     */
    SpatialUtils.ddToDmsString = function (dd, showMarks, maxDecimals) {
        if (maxDecimals === void 0) { maxDecimals = 2; }
        var d = Math.trunc(dd);
        var m = Math.floor((Math.abs(dd) - Math.abs(d)) * 60);
        var s = this.reducePrecision((Math.abs(dd) - Math.abs(d) - m / 60) * 3600, maxDecimals);
        if (s >= 60) {
            s -= 60;
            m += 1;
        }
        return showMarks ? d + "\u00B0 " + m + "' " + s + "\"" : d + " " + m + " " + s;
    };
    /**
     *
     * @param dms The DMS string to parse
     * @param maxDecimals The maximum decimal precision to return
     * @returns Converted decimal degrees, or NaN if the DMS string is invalid
     */
    SpatialUtils.dmsToDdString = function (dms, maxDecimals) {
        if (maxDecimals === void 0) { maxDecimals = 6; }
        var splitDms = dms.split(' ');
        if (splitDms.length < 3) {
            return Number.NaN;
        }
        var degrees = parseInt(splitDms[0].replace(/[^0-9.-]/g, ''));
        var minutes = parseInt(splitDms[1].replace(/[^0-9.-]/g, ''));
        var seconds = parseFloat(splitDms[2].replace(/[^0-9.-]/g, ''));
        if (isNaN(degrees) || isNaN(minutes) || isNaN(seconds)) {
            return Number.NaN;
        }
        var dd = Math.abs(degrees) + (minutes / 60) + (seconds / 3600);
        if (degrees < 0) {
            dd *= -1; // Set if we're west
        }
        // truncate to maxDecimals decimal places
        var ddSplit = dd.toString().split('.');
        if (ddSplit.length > 1 && ddSplit[1].length > 5) {
            return parseFloat(dd.toFixed(maxDecimals));
        }
        // otherwise return with the precision as is
        return dd;
    };
    /**
     * Generates DMS string for a given latitude and longitude
     * @param latitude The latitude
     * @param longitude The longitude
     * @param showMarks Show degree characters
     * @returns Object containing latitude and longitude as DMS strings
     */
    SpatialUtils.latLonToDmsString = function (latitude, longitude, showMarks) {
        return {
            latitudeDMS: this.ddToDmsString(latitude, showMarks) + " " + (latitude < 0 ? 'S' : 'N'),
            longitudeDMS: this.ddToDmsString(longitude, showMarks) + " " + (longitude < 0 ? 'W' : 'E')
        };
    };
    /**
     * Calculate the distance between two points in Metres, using the haversine formula
     * @param startCoord Starting coordinates
     * @param endCoord Ending coordinates
     * @returns the distance from the start coordinate to the end coordinate
     */
    SpatialUtils.haversineDistance = function (startCoord, endCoord) {
        var latRads = this.degreesToRadians(endCoord[1] - startCoord[1]);
        var lonRads = this.degreesToRadians(endCoord[0] - startCoord[0]);
        var lat1Rads = this.degreesToRadians(startCoord[1]);
        var lat2Rads = this.degreesToRadians(endCoord[1]);
        var a = Math.sin(latRads / 2) * Math.sin(latRads / 2) + Math.cos(lat1Rads) * Math.cos(lat2Rads) * Math.sin(lonRads / 2) * Math.sin(lonRads / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return this.RADIUS * c;
    };
    /**
     * Calculate the length of a linestring in metres, using the
     * Haversine distance method. MultiLinestring distances will not be separated
     * @param line The linestring to calculate a length for
     * @returns the length of the line in metres
     */
    SpatialUtils.lineLength = function (line) {
        var distance = 0;
        var lines = line.type === 'LineString' ? [line.coordinates] : line.coordinates;
        for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
            var linestring = lines_1[_i];
            var lastCoord = null;
            for (var _a = 0, linestring_1 = linestring; _a < linestring_1.length; _a++) {
                var coord = linestring_1[_a];
                if (!lastCoord) {
                    lastCoord = coord;
                }
                else {
                    distance += this.haversineDistance(lastCoord, coord);
                    lastCoord = coord;
                }
            }
        }
        return distance;
    };
    /**
     * Calculate the perimetre for a polygon in metres, using
     * the haversine method. MultiPolygon perimetres will not be separated
     * @param polygon the polygon to calculate the perimetre for
     * @returns the perimetre of the polygon in metres
     */
    SpatialUtils.polygonPerimeter = function (polygon) {
        var distance = 0;
        var polys = polygon.type === 'Polygon' ? [polygon.coordinates] : polygon.coordinates;
        for (var _i = 0, polys_1 = polys; _i < polys_1.length; _i++) {
            var poly = polys_1[_i];
            for (var _a = 0, poly_1 = poly; _a < poly_1.length; _a++) {
                var ring = poly_1[_a];
                var firstCoord = null;
                var lastCoord = null;
                for (var _b = 0, ring_1 = ring; _b < ring_1.length; _b++) {
                    var coord = ring_1[_b];
                    if (!lastCoord) {
                        firstCoord = coord;
                        lastCoord = coord;
                    }
                    else {
                        distance += this.haversineDistance(lastCoord, coord);
                        lastCoord = coord;
                    }
                }
                // if the json didn't include the final point linking to the first point
                // make sure to add that to the distance.
                if (lastCoord && firstCoord && (lastCoord[0] != firstCoord[0] || lastCoord[1] != firstCoord[1])) {
                    distance += this.haversineDistance(lastCoord, firstCoord);
                }
            }
        }
        return distance;
    };
    /**
     * Calculates the area of a polygon in metres squared.
     * Multipolygon features will not have their areas separated.
     * @param polygon The polygon to calculate the area for
     * @returns the area of the polygon in metres squared
     */
    SpatialUtils.polygonArea = function (polygon) {
        var area = 0;
        var polys = polygon.type === 'Polygon' ? [polygon.coordinates] : polygon.coordinates;
        for (var _i = 0, polys_2 = polys; _i < polys_2.length; _i++) {
            var poly = polys_2[_i];
            for (var i = 0; i < poly.length; i++) {
                var ringArea = Math.abs(this.polygonRingArea(poly[i]));
                area += i === 0 ? ringArea : -ringArea;
            }
        }
        return area;
    };
    /**
     * @private
     * Reference:
     * Robert. G. Chamberlain and William H. Duquette, "Some Algorithms for Polygons on a Sphere",
     * JPL Publication 07-03, Jet Propulsion
     * Laboratory, Pasadena, CA, June 2007 https://trs.jpl.nasa.gov/handle/2014/40409
     *
     * @param ring the polygon ring to calculate
     * @returns The area of the ring in metres squared
     */
    SpatialUtils.polygonRingArea = function (ring) {
        var area = 0;
        if (ring.length > 2) {
            for (var i = 0; i < ring.length; i++) {
                var lowerIndex = void 0;
                var middleIndex = void 0;
                var upperIndex = void 0;
                if (i === ring.length - 2) {
                    lowerIndex = ring.length - 2;
                    middleIndex = ring.length - 1;
                    upperIndex = 0;
                }
                else if (i === ring.length - 1) {
                    lowerIndex = ring.length - 1;
                    middleIndex = 0;
                    upperIndex = 1;
                }
                else {
                    lowerIndex = i;
                    middleIndex = i + 1;
                    upperIndex = i + 2;
                }
                var point1 = ring[lowerIndex];
                var point2 = ring[middleIndex];
                var point3 = ring[upperIndex];
                area += (this.degreesToRadians(point3[0]) - this.degreesToRadians(point1[0])) * Math.sin(this.degreesToRadians(point2[1]));
            }
            area = (area * this.RADIUS * this.RADIUS) / 2;
        }
        return area;
    };
    /**
     * Convert decimal degrees to radians
     * @param degrees the decimal degrees
     * @returns the degree in radians
     */
    SpatialUtils.degreesToRadians = function (degrees) {
        return (degrees * Math.PI) / 180;
    };
    /**
     * Convert radians to decimal degrees
     * @param radians the radians
     * @returns the decimal degrees
     */
    SpatialUtils.radiansToDegrees = function (radians) {
        return radians * (180 / Math.PI);
    };
    /**
     * Reduces the precision of a number
     * @param coord The number to reduce
     * @param reduceTo How many decimals to reduce it to
     * @returns a precision reduced number
     */
    SpatialUtils.reducePrecision = function (coord, reduceTo) {
        return parseFloat(coord.toFixed(reduceTo));
    };
    /**
     * Reduce the precision of a coordinate. This will return a new coordinate
     * and not alter the supplied coordinate
     * @param coords The coordinate to reduce precision for
     * @param reduceTo How many decimal places to reduce to
     * @returns A precision-reduced Position
     */
    SpatialUtils.reduceCoordinatePrecision = function (coords, reduceTo) {
        return [this.reducePrecision(coords[0], reduceTo), this.reducePrecision(coords[1], reduceTo)];
    };
    /**
     * Compare coordinates
     * @param a Position A
     * @param b Position B
     * @returns Comparison
     */
    SpatialUtils.compareCoordinates = function (a, b) {
        if (a[0] < b[0])
            return -1;
        else if (a[0] > b[0])
            return 1;
        else if (a[1] < b[1])
            return -1;
        else if (a[1] > b[1])
            return 1;
        else
            return 0;
    };
    /**
     * Find a point at the middle of two other points. This method is not geodesic, therefore only useful when accuracy is not needed or for very small distances
     * @param pointA The first point
     * @param pointB The second point
     * @returns Position representing the Midpoint between Point 'A' and Point 'B'
     */
    SpatialUtils.midPoint = function (pointA, pointB) {
        return [(pointA[0] + pointB[0]) / 2.0, (pointA[1] + pointB[1]) / 2.0];
    };
    /**
     * Find a point at the middle of two other points. This method uses haversine distance and conforms to the curvature of the earth
     * @param pointA The first point
     * @param pointB The second point
     * @returns Position representing the Midpoint between Point 'A' and Point 'B'
     */
    SpatialUtils.midpointGeodesic = function (pointA, pointB) {
        // find the geodesic distance using the haversine method
        var distance = this.haversineDistance(pointA, pointB);
        // find the bearing between the two points
        var bearing = this.bearing(pointA, pointB);
        // return the point by finding the destination at half the distance and at the given bearing
        return this.destinationPoint(pointA, distance / 2.0, bearing);
    };
    /**
     * Find the bearing between two points
     * https://www.igismap.com/formula-to-find-bearing-or-heading-angle-between-two-points-latitude-longitude/
     * @param pointA the first point
     * @param pointB the second point
     * @returns The bearing, in decimal degrees
     */
    SpatialUtils.bearing = function (pointA, pointB) {
        // get the lat/long radians
        var longitudeA = this.degreesToRadians(pointA[0]);
        var longitudeB = this.degreesToRadians(pointB[0]);
        var latitudeA = this.degreesToRadians(pointA[1]);
        var latitudeB = this.degreesToRadians(pointB[1]);
        var a = Math.sin(longitudeB - longitudeA) * Math.cos(latitudeB);
        var b = Math.cos(latitudeA) * Math.sin(latitudeB) - Math.sin(latitudeA) * Math.cos(latitudeB) * Math.cos(longitudeB - longitudeA);
        return this.radiansToDegrees(Math.atan2(a, b));
    };
    /**
     * Given a point, bearing, and distance in metres, locate the destination point
     * @param point The starting point
     * @param distance The distance in metres
     * @param bearing The bearing
     * @returns Position representing the destination
     */
    SpatialUtils.destinationPoint = function (point, distance, bearing) {
        // get the lat/long, bearing and distance radians
        var longitudeRads = this.degreesToRadians(point[0]);
        var latitudeRads = this.degreesToRadians(point[1]);
        var bearingRads = this.degreesToRadians(bearing);
        var distRads = distance / this.RADIUS;
        // claculate the destination lat/long
        var destinationLat = Math.asin(Math.sin(latitudeRads) * Math.cos(distRads) + Math.cos(latitudeRads) * Math.sin(distRads) * Math.cos(bearingRads));
        var destinationLong = longitudeRads + Math.atan2(Math.sin(bearingRads) * Math.sin(distRads) * Math.cos(latitudeRads), Math.cos(distRads) - Math.sin(latitudeRads) * Math.sin(destinationLat));
        // convert the rads to degrees
        var finalLong = this.radiansToDegrees(destinationLong);
        var finalLat = this.radiansToDegrees(destinationLat);
        return [finalLong, finalLat];
    };
    // https://en.wikipedia.org/wiki/Earth_radius
    SpatialUtils.RADIUS = 6371008.7714;
    return SpatialUtils;
}());
export { SpatialUtils };
//# sourceMappingURL=spatial-utils.js.map