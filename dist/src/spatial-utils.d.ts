import { LineString, MultiLineString, MultiPolygon, Polygon, Position } from "geojson";
/**
 * A Utilities class containing functions for performing various
 * helpful utilities, like distance calculations, UTM zone helpers, etc.
 */
export declare class SpatialUtils {
    static readonly RADIUS = 6378137;
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
     * Generates DMS string for a given latitude and longitude
     * @param latitude The latitude
     * @param longitude The longitude
     * @param showMarks Show degree characters
     * @returns Object containing latitude and longitude as DMS strings
     */
    static latLonToDmsString(latitude: number, longitude: number, showMarks: boolean): {
        latitudeDMS: string;
        longitudeDMS: string;
    };
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
}
