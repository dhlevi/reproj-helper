import { LineString, MultiLineString, MultiPolygon, Polygon, Position } from "geojson"

/**
 * A Utilities class containing functions for performing various
 * helpful utilities, like distance calculations, UTM zone helpers, etc.
 */
export class SpatialUtils {
  public static readonly RADIUS = 6378137
  /**
   * Returns the UTM Zone for a given longitude. Includes rules beyond just BC/Canada
   * @param latitude The Latitude. Needed to determine zones with special rules (Svalbard)
   * @param longitude The Longitude
   */
  public static utmZone(latitude: number, longitude: number): number {
    let zoneNumber = Math.floor((longitude + 180) / 6) + 1;

    if (latitude >= 56.0 && latitude < 64.0 && longitude >= 3.0 && longitude < 12.0) {
      zoneNumber = 32
    }
    // Special zones for Svalbard
    if (latitude >= 72.0 && latitude < 84.0) {
      if (longitude >= 0.0  && longitude <  9.0 ) zoneNumber = 31;
      else if (longitude >= 9.0  && longitude < 21.0 ) zoneNumber = 33;
      else if (longitude >= 21.0 && longitude < 33.0 ) zoneNumber = 35;
      else if (longitude >= 33.0 && longitude < 42.0 ) zoneNumber = 37;
    }

    return zoneNumber;
  }

  /**
   * Determine the UTM Zone letter code
   * @param latitude the Latitude
   */
  public static utmLetterDesignation (latitude: number): string {
    let letter = ''

    if (-80 <= latitude && latitude <= 84) {
      letter = 'CDEFGHJKLMNPQRSTUVWXX'[Math.floor((latitude + 80) / 8)]
    } else {
      letter = 'Z' // Error flag. Outside UTM Limits
    }
    return letter
  }

  /**
   * Returns a string representing the UTM zone and letter code for a given latitude and longitude
   * @param latitude The latitude
   * @param longitude The longitude
   */
  public static utmZoneString (latitude: number, longitude: number): string {
    const zoneNumber = this.utmZone(latitude, longitude)
    const zoneLetter = this.utmLetterDesignation(latitude)
    return 'UTM'+ zoneNumber + '' + zoneLetter
  }

  /**
   * Generates a DMS string from a given decimal degree.
   * @param dd The decimal degrees
   * @param showMarks Show degree characters
   */
  public static ddToDmsString (dd: number, showMarks: boolean, maxDecimals = 2): string {
    const d = Math.floor(dd)
    const m = Math.floor((dd - d) * 60)
    const s = this.reducePrecision((dd - d - m / 60) * 3600, maxDecimals)
    return showMarks ? `${d}° ${m}' ${s}"` : `${d} ${m} ${s}`
  }

  /**
   * Generates DMS string for a given latitude and longitude
   * @param latitude The latitude
   * @param longitude The longitude
   * @param showMarks Show degree characters
   * @returns Object containing latitude and longitude as DMS strings
   */
  public static latLonToDmsString (latitude: number, longitude: number, showMarks: boolean) {
    return {
      latitudeDMS: `${this.ddToDmsString(latitude, showMarks)} ${(latitude < 0 ? 'S' : 'N')}`,
      longitudeDMS: `${this.ddToDmsString(longitude, showMarks)} ${(longitude < 0 ? 'W' : 'E')}`
    }
  }

  /**
   * Calculate the distance between two points in Metres, using the haversine formula
   * @param startCoord Starting coordinates
   * @param endCoord Ending coordinates
   * @returns the distance from the start coordinate to the end coordinate
   */
  public static haversineDistance (startCoord: Position, endCoord: Position): number {
    const latRads = this.degreesToRadians(endCoord[1] - startCoord[1])
    const lonRads = this.degreesToRadians(endCoord[0] - startCoord[0])
    const lat1Rads = this.degreesToRadians(startCoord[1])
    const lat2Rads = this.degreesToRadians(endCoord[1])

    const a = Math.sin(latRads / 2) * Math.sin(latRads / 2) + Math.cos(lat1Rads) * Math.cos(lat2Rads) * Math.sin(lonRads / 2) * Math.sin(lonRads / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return this.RADIUS * c;
  }

  /**
   * Calculate the length of a linestring in metres, using the
   * Haversine distance method. MultiLinestring distances will not be separated
   * @param line The linestring to calculate a length for
   * @returns the length of the line in metres
   */
  public static lineLength (line: LineString | MultiLineString): number {
    let distance = 0
    
    const lines = line.type === 'LineString' ? [line.coordinates] : line.coordinates

    for (const linestring of lines) {
      let lastCoord = null
      for (const coord of linestring) {
        if (!lastCoord) {
          lastCoord = coord
        } else {
          distance += this.haversineDistance(lastCoord, coord)
          lastCoord = coord
        }
      }
    }

    return distance
  }

  /**
   * Calculate the perimetre for a polygon in metres, using
   * the haversine method. MultiPolygon perimetres will not be separated
   * @param polygon the polygon to calculate the perimetre for
   * @returns the perimetre of the polygon in metres
   */
  public static polygonPerimeter (polygon: Polygon | MultiPolygon): number {
    let distance = 0
    
    const polys = polygon.type === 'Polygon' ? [polygon.coordinates] : polygon.coordinates

    for (const poly of polys) {
      for (const ring of poly) {
        let firstCoord = null
        let lastCoord = null
        for (const coord of ring) {
          if (!lastCoord) {
            firstCoord = coord
            lastCoord = coord
          } else {
            distance += this.haversineDistance(lastCoord, coord)
            lastCoord = coord
          }
        }
        // if the json didn't include the final point linking to the first point
        // make sure to add that to the distance.
        if (lastCoord && firstCoord && (lastCoord[0] != firstCoord[0] || lastCoord[1] != firstCoord[1])) {
          distance += this.haversineDistance(lastCoord, firstCoord)
        }
      }
    }

    return distance
  }

  /**
   * Calculates the area of a polygon in metres squared.
   * Multipolygon features will not have their areas separated.
   * @param polygon The polygon to calculate the area for
   * @returns the area of the polygon in metres squared
   */
  public static polygonArea (polygon: Polygon | MultiPolygon): number {
    let area = 0

    const polys = polygon.type === 'Polygon' ? [polygon.coordinates] : polygon.coordinates

    for (const poly of polys) {
      for (let i = 0; i < poly.length; i++) {
        const ringArea = Math.abs(this.polygonRingArea(poly[i]))
        area += i === 0 ? ringArea : -ringArea
      }
    }

    return area
  }

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
  private static polygonRingArea (ring: Position[]): number {
    let area = 0
  
    if (ring.length > 2) {
      for (let i = 0; i < ring.length; i++) {
        let lowerIndex
        let middleIndex
        let upperIndex

        if (i === ring.length - 2) {
          lowerIndex = ring.length - 2;
          middleIndex = ring.length - 1;
          upperIndex = 0
        } else if (i === ring.length - 1) {
          lowerIndex = ring.length - 1
          middleIndex = 0
          upperIndex = 1
        } else {
          lowerIndex = i
          middleIndex = i + 1
          upperIndex = i + 2
        }

        const point1 = ring[lowerIndex]
        const point2 = ring[middleIndex]
        const point3 = ring[upperIndex]

        area += (this.degreesToRadians(point3[0]) - this.degreesToRadians(point1[0])) * Math.sin(this.degreesToRadians(point2[1]))
      }
      area = (area * this.RADIUS * this.RADIUS) / 2
    }

    return area
  }

  /**
   * Convert decimal degrees to radians
   * @param degrees the decimal degrees
   * @returns the degree in radians
   */
  public static degreesToRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Reduces the precision of a number
   * @param coord The number to reduce
   * @param reduceTo How many decimals to reduce it to
   * @returns a precision reduced number
   */
  public static reducePrecision (coord: number, reduceTo: number): number {
    return parseFloat(coord.toFixed(reduceTo))
  }

  /**
   * Reduce the precision of a coordinate. This will return a new coordinate
   * and not alter the supplied coordinate
   * @param coords The coordinate to reduce precision for
   * @param reduceTo How many decimal places to reduce to
   * @returns A precision-reduced Position
   */
  public static reduceCoordinatePrecision (coords: Position, reduceTo: number): Position {
    return [this.reducePrecision(coords[0], reduceTo), this.reducePrecision(coords[1], reduceTo)]
  }

  public static compareCoordinates (a: Position, b: Position): number {
		if (a[0] < b[0]) return -1
		else if (a[0] > b[0]) return 1
		else if (a[1] < b[1]) return -1
		else if (a[1] > b[1]) return 1
		else return 0
  }
}
