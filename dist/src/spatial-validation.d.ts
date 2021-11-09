import { Point, LineString, MultiPolygon, Polygon, Position, BBox } from "geojson";
export declare class SpatialValidator {
    /**
     * Check if a polygon ring (exterior or interior) is closed
     * @param geometry The polygon ring
     * @returns True of closed, False if not
     */
    static ringIsClosed(ring: Position[]): boolean;
    /**
     * Check if a point is on a linestring
     * @param point
     * @param line
     * @returns
     */
    static isPointOnLine(point: Point | Position, line: LineString | Position[]): boolean;
    /**
     * Test if a point is within a bounding box. Useful test before checking for within on a polygon feature
     * @param point The point to test
     * @param bbox The bounding box
     * @returns True if the point is within the bounding box
     */
    static isPointInBoundingBox(point: Point | Position, bbox: BBox): boolean;
    /**
     * Test if a point is within a ring
     * @param point The point to test
     * @param ring The ring to test
     * @returns True if the point is within the ring
     */
    static isPointInRing(point: Point | Position, ring: Position[]): boolean;
    /**
     * Test to determine if a point is within a polygon
     * @param point The point to test
     * @param polygon The containing polygon
     * @returns True if the point is within the polygon
     */
    static isPointInPolygon(point: Point | Position, polygon: Polygon | MultiPolygon): boolean;
    /**
     * Test to determien if a line is within a polygon
     * @param line Line to compare
     * @param polygon Polygon that contains the line
     * @returns True if the line is within the polygon
     */
    static isLineInPolygon(line: LineString | Position[], polygon: Polygon | MultiPolygon): boolean;
    /**
     * Test to determine if a polygon is inside another polygon (use within)
     * @param polygon1 The polygon within
     * @param polygon2 The containing polygon
     * @returns True if polygon is within the second polygon
     */
    static isPolygonInPolygon(polygon1: Polygon | MultiPolygon, polygon2: Polygon | MultiPolygon): boolean;
    /**
     * Test to determine if two coordinates are the same
     * @param coord1 The first coord to compare
     * @param coord2 The second coord to compare
     * @returns
     */
    static coordIsEqual(coord1: Point | Position, coord2: Point | Position): boolean;
    /**
     * Test to determine if lines are identical (matching vertices)
     * @param line1 The first line to compare
     * @param line2 The second line to compare
     * @returns True if lines are equal
     */
    static lineIsEqual(line1: LineString | Position[], line2: LineString | Position[]): boolean;
    /**
     * Test to determine if two lines are topographically equal (regardless of different vertices)
     * @param line1 The first line to compare
     * @param line2 The second line to compare
     * @returns True if the lines are topographically equal
     */
    static lineIsTopographicallyEqual(line1: LineString | Position[], line2: LineString | Position[]): boolean;
    /**
     * Test to determine if two polygons are identical (contain identical vertices)
     * @param polygon1 the first polygon to compare
     * @param polygon2 the second polygon to compare
     * @returns true if polygons are equal
     */
    static polygonIsEqual(polygon1: Polygon | Position[][], polygon2: Polygon | Position[][]): boolean;
    /**
     * Test to determine if a polygon is topographically equal to another polygon, regardless of vertices
     * @param polygon1 The first polygon to compare
     * @param polygon2 The second polygon to compare
     * @returns True if polygons are identical detected
     */
    static polygonIsTopographicallyEqual(polygon1: Polygon | Position[][], polygon2: Polygon | Position[][]): boolean;
    /**
     * Test to determine if a feature intersects with another feature
     * @param geometry1 The geometry intersecter
     * @param geometry2 The geometry to intersectee
     * @returns True if intersect detected
     */
    static doesIntersect(geometry1: Point | LineString | Polygon, geometry2: Point | LineString | Polygon): boolean;
    /**
     * Test to determine if a feature is disjoint from another feature
     * @param geometry1 The first geometry
     * @param geometry2 The second geometry
     * @returns True if disjoint detected
     */
    static isDisjoint(geometry1: Point | LineString | Polygon, geometry2: Point | LineString | Polygon): boolean;
    /**
     * Test to determine if a feature is completely within feature
     * @param geometry1 The geometry within
     * @param geometry2 The geometry that contains
     * @returns True if within detected
     */
    static isWithin(geometry1: Point | LineString | Polygon, geometry2: Point | LineString | Polygon): boolean;
    static doesContain(geometry1: Point | LineString | Polygon, geometry2: Point | LineString | Polygon): boolean;
    /**
     * Test to determine if a feature touches another feature
     * @param geometry1 The geometry toucher
     * @param geometry2 The geometry to touchee
     * @returns True if touch detected
     */
    static doesTouch(geometry1: Point | LineString | Polygon, geometry2: Point | LineString | Polygon): boolean;
    /**
     * Test to determine if a feature overlaps another feature
     * @param geometry1 The geometry overlapper
     * @param geometry2 The geometry to overlapee
     * @returns True if overlap detected
     */
    static doesOverlap(geometry1: Point | LineString | Polygon, geometry2: Point | LineString | Polygon): boolean;
    /**
     * Test to find intersecting points on a line. Taken from the Turf library (see turfjs: https://turfjs.org/)
     * @param line1
     * @param line2
     * @returns Intersecting point
     */
    static findIntersectingPoints(line1: LineString | Position[], line2: LineString | Position[]): Position | null;
}
