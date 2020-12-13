import { Position } from "geojson";
export default class SpatialUtils {
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
    static ddToDmsString(dd: number, showMarks: boolean): string;
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
     */
    static haversineDistance(startCoord: Position, endCoord: Position): number;
    /**
     * Reduces the precision of a number
     * @param coord The number to reduce
     * @param reduceTo How many decimals to reduce it to
     */
    static reducePrecision(coord: number, reduceTo: number): number;
    static reduceCoordinatePrecision(coords: Position, reduceTo: number): Position;
}
