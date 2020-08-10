import { Person } from './Person.js'

/**
 * a guest enters and leaves the bus. while inside
 * the bus, the guest can become infected when sitting
 * around infected guests.
 */
export class Guest extends Person {
  /**
   * increase this value outside when creating
   * a new Guest
   * @type {int}
   */
  static idCounter = 0

  /**
   * create a Guest only with ID is enough for
   * Guests sitting on a Seat, because the Seat
   * has an x and y position. So creating a new
   * Guest with "new Guest()" is enough since
   * the id will automatically generated.
   *
   * you can set x and y pos for guests who stand
   * outside the bus such as waiting guests at the
   * bus station and leaving guests.
   *
   * @param {number} posX (optional)
   * @param {number} posY (optional)
   */
  constructor (posX = 0, posY = 0) {
    super()
    /**
     * @type {number}
     */
    this.id = Guest.idCounter++
    /**
     * pixel x-coordinate
     * @type {number}
     */
    this.posX = posX
    /**
     * pixel y-coordinate
     * @type {number}
     */
    this.posY = posY
  }
}
