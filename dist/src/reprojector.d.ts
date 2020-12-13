import { Feature, FeatureCollection, Geometry } from "geojson";
/**
 * A simple Reprojection class that works with Proj4 for
 * simplifying reprojection of GeoJson objects.
 *
 * Defaults to BC Albers and WGS84, but any projection string
 * Proj4 supports can be included.
 *
 * Supports projecting GeoJSON Geometry, GeometryCollection, Feature and FeatureCollection objects
 *
 * Supports chaining functions together for convinience, ie:
 * projector.from().to().source().project();
 */
export default class ReProjector {
    sourceFeature: FeatureCollection | Feature | Geometry | null;
    fromProjection: string;
    toProjection: string;
    /**
     * Constructor for ReProjector class. This will initialize a set of proejction definitions as well.
     * Definitions include: [ EPGS:3005, EPGS:3857, EPGS:3348, EPGS:3979, EPGS:3579, EPGS:3402 ] as well as
     * UTM zones 7N through 15N (As codes UTM<zone number>)
     * Default From Projection is EGSP:3005
     * Default To projection is WGS84
     */
    constructor();
    /**
     * Static initializer for a ReProjector instance
     * Useful if you intend on chaining, ie:
     * ReProjector.instance().feature({...}).from('EPSG:3005').to('EPSG:3579').project();
     */
    static instance(): ReProjector;
    private init;
    /**
     * Adds a definition string to Proj4. Use the definition by specifying the
     * code set here in the to and from functions
     * @param code Your desired code
     * @param definition The proj4 definition string
     */
    addDefinition(code: string, definition: string): this;
    /**
     * Set the feature you wish to project. The projected feature will be a deep copy
     * The original feature passed in will be untouched.
     * @param feature Feature Type
     */
    feature(feature: FeatureCollection | Feature | Geometry): ReProjector;
    /**
     * Projection code to use on the "from" projection
     * @param from Code (usually an EPSG Code)
     */
    from(from: string): ReProjector;
    /**
     * Projection code to use on the "To" projection
     * @param from Code (usually an EPSG Code)
     */
    to(to: string): ReProjector;
    /**
     * Run the projection. This function is asyncronous and will
     * return a promise by default. The source feature must be set prior
     * Your source feature will be deep cloned and not modified by this process
     */
    project(): Promise<FeatureCollection | Feature | Geometry | null>;
    private projectGeometry;
    private projectPolygon;
    private projectLineString;
    private projectPoint;
}
