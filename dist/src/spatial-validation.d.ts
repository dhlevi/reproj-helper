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
    static isPointInBoundingBox(point: Point | Position, bbox: BBox): boolean;
    static isPointInRing(point: Point | Position, ring: Position[]): boolean;
    static isPointInPolygon(point: Point | Position, polygon: Polygon | MultiPolygon): boolean;
    static isLineInPolygon(line: LineString | Position[], polygon: Polygon | MultiPolygon): boolean;
    static isPolygonInPolygon(polygon1: Polygon | MultiPolygon, polygon2: Polygon | MultiPolygon): boolean;
    static coordIsEqual(coord1: Point | Position, coord2: Point | Position): boolean;
    static lineIsEqual(line1: LineString | Position[], line2: LineString | Position[]): boolean;
    static lineIsTopographicallyEqual(line1: LineString | Position[], line2: LineString | Position[]): boolean;
    static polygonIsEqual(polygon1: Polygon | Position[][], polygon2: Polygon | Position[][]): boolean;
    static polygonIsTopographicallyEqual(polygon1: Polygon | Position[][], polygon2: Polygon | Position[][]): boolean;
    static doesIntersect(geometry1: Point | LineString | Polygon, geometry2: Point | LineString | Polygon): boolean;
    static isDisjoint(geometry1: Point | LineString | Polygon, geometry2: Point | LineString | Polygon): boolean;
    static isWithin(geometry1: Point | LineString | Polygon, geometry2: Point | LineString | Polygon): boolean;
    static doesContain(geometry1: Point | LineString | Polygon, geometry2: Point | LineString | Polygon): boolean;
    static doesTouch(geometry1: Point | LineString | Polygon, geometry2: Point | LineString | Polygon): boolean;
    static doesOverlap(geometry1: Point | LineString | Polygon, geometry2: Point | LineString | Polygon): boolean;
    static findIntersectingPoints(line1: LineString | Position[], line2: LineString | Position[]): Position | null;
}
