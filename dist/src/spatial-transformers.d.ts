import { Feature, FeatureCollection, Geometry, MultiPolygon, Point, Polygon } from "geojson";
/**
 * A Spatial Transformation helper that takes an input geometry or collection
 * of geometries, and transforms the data into something else. The functions
 * in this class will be non-destructive to the supplied features, always
 * returning a modified clone of the original.
 */
export declare class SpatialTransformers {
    static readonly RADIUS = 6378137;
    /**
     * Identify interior rings within a polygon feature, and extract them as polygon objects
     * @param feature The feature to find interior rings within
     * @returns An array of polygons derived from the input features interior rings
     */
    static findInteriorRings(feature: Feature | Polygon | MultiPolygon): Promise<Polygon[]>;
    /**
   * Given a GeoJSON polygon feature, locate and extract the interior rings
   * A new geometry without interior rings will be returned. This will not alter the provided geometry.
   * @param feature The feature to find interior rings in
   * @returns a cloned copy of the input feature, with interior rings removed
   */
    static removeInteriorRings(feature: Feature | Polygon | MultiPolygon): Promise<Feature | Polygon | MultiPolygon>;
    /**
     * Generate the bounding box for a supplied Feature or FeatureCollection
     * @param features
     * @returns a Polygon representing the bounding box. The bbox attribute contains the bbox definition
     */
    static boundingBox(features: FeatureCollection | Feature | Feature[]): Polygon;
    /**
     * Create a centroid from the supplied feature
     * @param feature A feature to derive a centroid from
     * @returns a Point defining the centroid of the supplied feature
     */
    static featureCentroid(feature: Feature): Point;
    /**
     * Reduce the precision of the feature. uses the SpatialUtils.reduceCoordinatePrecision function
     * @param feature The feature to reduce precision for
     * @returns a cloned copy of the feature with precision reduced
     */
    static reducePrecision(feature: Feature | Geometry, reduceTo: number): Feature | Geometry;
}
