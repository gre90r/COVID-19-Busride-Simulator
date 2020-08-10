import { Person } from './Person.js'

/**
 * drives the bus and can also be infected
 */
export class BusDriver extends Person {
  /**
   * constant pixel x-coordinate on canvas
   * @returns {number} x pos on canvas
   */
  static posX () {
    return 120
  }

  /**
   * constant pixel y-coordinate on canvas
   * @returns {number} y pos on canvas
   */
  static posY () {
    return 255
  }
}
