import { LineString, MultiLineString, MultiPolygon, Polygon, Position } from "geojson"

/**
 * A Utilities class containing functions for performing various
 * helpful utilities, like distance calculations, UTM zone helpers, etc.
 */
export class SpatialUtils {
  // https://en.wikipedia.org/wiki/Earth_radius
  public static readonly RADIUS = 6371008.7714
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
    const d = Math.trunc(dd)
    let m = Math.floor((Math.abs(dd) - Math.abs(d)) * 60)
    let s = this.reducePrecision((Math.abs(dd) - Math.abs(d) - m / 60) * 3600, maxDecimals)
    if (s >= 60) {
      s -= 60;
      m += 1;
    }
    return showMarks ? `${d}° ${m}' ${s}"` : `${d} ${m} ${s}`
  }

  /**
   * 
   * @param dms The DMS string to parse
   * @param maxDecimals The maximum decimal precision to return
   * @returns Converted decimal degrees, or NaN if the DMS string is invalid
   */
  public static dmsToDdString (dms: string, maxDecimals = 6): number {
    const splitDms = dms.split(' ')

    if (splitDms.length < 3) {
      return Number.NaN
    }

    const degrees = parseInt(splitDms[0].replace(/[^0-9.-]/g,''))
    const minutes = parseInt(splitDms[1].replace(/[^0-9.-]/g,''))
    const seconds = parseFloat(splitDms[2].replace(/[^0-9.-]/g, ''))

    if (isNaN(degrees) || isNaN(minutes) || isNaN(seconds)) {
      return Number.NaN
    }

    let dd = Math.abs(degrees) + (minutes / 60) + (seconds / 3600);

    if (degrees < 0) {
      dd *= -1; // Set if we're west
    }

    // truncate to maxDecimals decimal places
    const ddSplit = dd.toString().split('.')
    if (ddSplit.length > 1 && ddSplit[1].length > 5) {
        return parseFloat(dd.toFixed(maxDecimals))
    }
    // otherwise return with the precision as is
    return dd
  }

  /**
   * Generates DMS string for a given latitude and longitude
   * @param latitude The latitude
   * @param longitude The longitude
   * @param showMarks Show degree characters
   * @returns Object containing latitude and longitude as DMS strings
   */
  public static latLonToDmsString (latitude: number, longitude: number, showMarks: boolean): any {
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
  public static degreesToRadians (degrees: number): number {
    return (degrees * Math.PI) / 180
  }

  /**
   * Convert radians to decimal degrees
   * @param radians the radians
   * @returns the decimal degrees
   */
  public static radiansToDegrees (radians: number): number {
    return radians * (180 / Math.PI)
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

  /**
   * Compare coordinates
   * @param a Position A
   * @param b Position B
   * @returns Comparison
   */
  public static compareCoordinates (a: Position, b: Position): number {
		if (a[0] < b[0]) return -1
		else if (a[0] > b[0]) return 1
		else if (a[1] < b[1]) return -1
		else if (a[1] > b[1]) return 1
		else return 0
  }

  /**
   * Find a point at the middle of two other points. This method is not geodesic, therefore only useful when accuracy is not needed or for very small distances
   * @param pointA The first point
   * @param pointB The second point
   * @returns Position representing the Midpoint between Point 'A' and Point 'B'
   */
  public static midPoint (pointA: Position, pointB: Position ): Position {
    return [(pointA[0] + pointB[0]) / 2.0, (pointA[1] + pointB[1]) / 2.0]
  }

  /**
   * Find a point at the middle of two other points. This method uses haversine distance and conforms to the curvature of the earth
   * @param pointA The first point
   * @param pointB The second point
   * @returns Position representing the Midpoint between Point 'A' and Point 'B'
   */
  public static midpointGeodesic (pointA: Position, pointB: Position ): Position {
    // find the geodesic distance using the haversine method
    const distance = this.haversineDistance(pointA, pointB)
    // find the bearing between the two points
    const bearing = this.bearing(pointA, pointB)
    // return the point by finding the destination at half the distance and at the given bearing
    return this.destinationPoint(pointA, distance / 2.0, bearing)
  }

  /**
   * Find the bearing between two points
   * https://www.igismap.com/formula-to-find-bearing-or-heading-angle-between-two-points-latitude-longitude/
   * @param pointA the first point
   * @param pointB the second point
   * @returns The bearing, in decimal degrees
   */
  public static bearing (pointA: Position, pointB: Position ): number {
    // get the lat/long radians
    const longitudeA = this.degreesToRadians(pointA[0])
    const longitudeB = this.degreesToRadians(pointB[0])
    const latitudeA = this.degreesToRadians(pointA[1])
    const latitudeB = this.degreesToRadians(pointB[1])
  
    const a = Math.sin(longitudeB - longitudeA) * Math.cos(latitudeB)
    const b = Math.cos(latitudeA) * Math.sin(latitudeB) - Math.sin(latitudeA) * Math.cos(latitudeB) * Math.cos(longitudeB - longitudeA)
  
    return this.radiansToDegrees(Math.atan2(a, b))
  }

  /**
   * Given a point, bearing, and distance in metres, locate the destination point
   * @param point The starting point
   * @param distance The distance in metres
   * @param bearing The bearing
   * @returns Position representing the destination
   */
  public static destinationPoint (point: Position, distance: number, bearing: number): Position {
    // get the lat/long, bearing and distance radians
    const longitudeRads = this.degreesToRadians(point[0])
    const latitudeRads = this.degreesToRadians(point[1])
    const bearingRads = this.degreesToRadians(bearing)
    const distRads = distance / this.RADIUS
  
    // claculate the destination lat/long
    const destinationLat = Math.asin(Math.sin(latitudeRads) * Math.cos(distRads) + Math.cos(latitudeRads) * Math.sin(distRads) * Math.cos(bearingRads))
    const destinationLong = longitudeRads + Math.atan2(Math.sin(bearingRads) * Math.sin(distRads) * Math.cos(latitudeRads), Math.cos(distRads) - Math.sin(latitudeRads) * Math.sin(destinationLat))

    // convert the rads to degrees
    const finalLong = this.radiansToDegrees(destinationLong)
    const finalLat = this.radiansToDegrees(destinationLat)
  
    return [finalLong, finalLat]
  }
}
