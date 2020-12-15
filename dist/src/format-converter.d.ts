import { Feature, FeatureCollection, Geometry } from "geojson";
/**
 * FormatConverter is a utilit class that assists with converting
 * some spatial formats to others.
 *
 * Currently supports converting from/to Well Known Text and GeoJson
 * I'm sure you're immediately wondering why I did WKT Parsing without Regex
 * Me too... me too...
 */
export default class FormatConverter {
    private sourceWkt;
    private sourceJson;
    /**
     * Static instance constructor
     */
    static instance(): FormatConverter;
    /**
     * Supply a WKT string to convert
     * This automatically converts to GeoJson
     * @param wkt Your WKT string
     */
    fromWkt(wkt: string): FormatConverter;
    /**
     * Converts to Well Known Text
     */
    toWkt(): string;
    /**
     * Convert a geojson feature
     * @param json GeoJSON feature
     */
    fromGeoJson(json: FeatureCollection | Feature | Geometry): FormatConverter;
    /**
     * Get the converted data as GeoJSON
     */
    toGeoJson(): FeatureCollection | Feature | Geometry | null;
    /**************************/
    /**************************/
    private convertWktToJson;
    private buildWktGeometry;
    private parseWktCoord;
    private parseWktLine;
    private parseWktRing;
    /*****************
     * Json to WKT
     *****************/
    private convertToWkt;
    private wktStringFromGeometry;
    private polygonToWktString;
    private ringToWktString;
    private lineToWktString;
    private toWktCoordString;
}
