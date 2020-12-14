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
            console.log((latitude + 80) / 8);
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
        var d = Math.floor(dd);
        var m = Math.floor((dd - d) * 60);
        var s = this.reducePrecision((dd - d - m / 60) * 3600, maxDecimals);
        return showMarks ? d + "\u00B0 " + m + "' " + s + "\"" : d + " " + m + " " + s;
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
     */
    SpatialUtils.haversineDistance = function (startCoord, endCoord) {
        var radius = 6371000; // metres
        var latRads = (endCoord[1] - startCoord[1]) * Math.PI / 180;
        var lonRads = (endCoord[0] - startCoord[0]) * Math.PI / 180;
        var lat1Rads = startCoord[1] * Math.PI / 180;
        var lat2Rads = endCoord[1] * Math.PI / 180;
        var a = Math.sin(latRads / 2) * Math.sin(latRads / 2) + Math.cos(lat1Rads) * Math.cos(lat2Rads) * Math.sin(lonRads / 2) * Math.sin(lonRads / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return radius * c;
    };
    /**
     * Reduces the precision of a number
     * @param coord The number to reduce
     * @param reduceTo How many decimals to reduce it to
     */
    SpatialUtils.reducePrecision = function (coord, reduceTo) {
        return parseFloat(coord.toFixed(reduceTo));
    };
    SpatialUtils.reduceCoordinatePrecision = function (coords, reduceTo) {
        return [this.reducePrecision(coords[0], reduceTo), this.reducePrecision(coords[1], reduceTo)];
    };
    return SpatialUtils;
}());
export default SpatialUtils;
//# sourceMappingURL=spatial-utils.js.map