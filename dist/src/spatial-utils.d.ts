import { LineString, MultiLineString, MultiPolygon, Polygon, Position } from "geojson";
/**
 * A Utilities class containing functions for performing various
 * helpful utilities, like distance calculations, UTM zone helpers, etc.
 */
export declare class SpatialUtils {
    static readonly RADIUS = 6371008.7714;
    /**
     * Returns the UTM Zone for a given longitude. Includes rules beyond just BC/Canada
     * @param latitude The Latitude. Needed to determine zones with special rules (Svalbard)
     * @param longitude The Longitude
     */
    static utmZone(latitude: number, longitude: number): number;
    /**
     * Determine the UTM Zone letter code
     * @param latitude the Latitude
     */
    static utmLetterDesignation(latitude: number): string;
    /**
     * Returns a string representing the UTM zone and letter code for a given latitude and longitude
     * @param latitude The latitude
     * @param longitude The longitude
     */
    static utmZoneString(latitude: number, longitude: number): string;
    /**
     * Generates a DMS string from a given decimal degree.
     * @param dd The decimal degrees
     * @param showMarks Show degree characters
     */
    static ddToDmsString(dd: number, showMarks: boolean, maxDecimals?: number): string;
    /**
     *
     * @param dms The DMS string to parse
     * @param maxDecimals The maximum decimal precision to return
     * @returns Converted decimal degrees, or NaN if the DMS string is invalid
     */
    static dmsToDdString(dms: string, maxDecimals?: number): number;
    /**
     * Generates DMS string for a given latitude and longitude
     * @param latitude The latitude
     * @param longitude The longitude
     * @param showMarks Show degree characters
     * @returns Object containing latitude and longitude as DMS strings
     */
    static latLonToDmsString(latitude: number, longitude: number, showMarks: boolean): any;
    /**
     * Calculate the distance between two points in Metres, using the haversine formula
     * @param startCoord Starting coordinates
     * @param endCoord Ending coordinates
     * @returns the distance from the start coordinate to the end coordinate
     */
    static haversineDistance(startCoord: Position, endCoord: Position): number;
    /**
     * Calculate the length of a linestring in metres, using the
     * Haversine distance method. MultiLinestring distances will not be separated
     * @param line The linestring to calculate a length for
     * @returns the length of the line in metres
     */
    static lineLength(line: LineString | MultiLineString): number;
    /**
     * Calculate the perimetre for a polygon in metres, using
     * the haversine method. MultiPolygon perimetres will not be separated
     * @param polygon the polygon to calculate the perimetre for
     * @returns the perimetre of the polygon in metres
     */
    static polygonPerimeter(polygon: Polygon | MultiPolygon): number;
    /**
     * Calculates the area of a polygon in metres squared.
     * Multipolygon features will not have their areas separated.
     * @param polygon The polygon to calculate the area for
     * @returns the area of the polygon in metres squared
     */
    static polygonArea(polygon: Polygon | MultiPolygon): number;
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
    private static polygonRingArea;
    /**
     * Convert decimal degrees to radians
     * @param degrees the decimal degrees
     * @returns the degree in radians
     */
    static degreesToRadians(degrees: number): number;
    /**
     * Convert radians to decimal degrees
     * @param radians the radians
     * @returns the decimal degrees
     */
    static radiansToDegrees(radians: number): number;
    /**
     * Reduces the precision of a number
     * @param coord The number to reduce
     * @param reduceTo How many decimals to reduce it to
     * @returns a precision reduced number
     */
    static reducePrecision(coord: number, reduceTo: number): number;
    /**
     * Reduce the precision of a coordinate. This will return a new coordinate
     * and not alter the supplied coordinate
     * @param coords The coordinate to reduce precision for
     * @param reduceTo How many decimal places to reduce to
     * @returns A precision-reduced Position
     */
    static reduceCoordinatePrecision(coords: Position, reduceTo: number): Position;
    /**
     * Compare coordinates
     * @param a Position A
     * @param b Position B
     * @returns Comparison
     */
    static compareCoordinates(a: Position, b: Position): number;
    /**
     * Find a point at the middle of two other points. This method is not geodesic, therefore only useful when accuracy is not needed or for very small distances
     * @param pointA The first point
     * @param pointB The second point
     * @returns Position representing the Midpoint between Point 'A' and Point 'B'
     */
    static midPoint(pointA: Position, pointB: Position): Position;
    /**
     * Find a point at the middle of two other points. This method uses haversine distance and conforms to the curvature of the earth
     * @param pointA The first point
     * @param pointB The second point
     * @returns Position representing the Midpoint between Point 'A' and Point 'B'
     */
    static midpointGeodesic(pointA: Position, pointB: Position): Position;
    /**
     * Find the bearing between two points
     * https://www.igismap.com/formula-to-find-bearing-or-heading-angle-between-two-points-latitude-longitude/
     * @param pointA the first point
     * @param pointB the second point
     * @returns The bearing, in decimal degrees
     */
    static bearing(pointA: Position, pointB: Position): number;
    /**
     * Given a point, bearing, and distance in metres, locate the destination point
     * @param point The starting point
     * @param distance The distance in metres
     * @param bearing The bearing
     * @returns Position representing the destination
     */
    static destinationPoint(point: Position, distance: number, bearing: number): Position;
}
