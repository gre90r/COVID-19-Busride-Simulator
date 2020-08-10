export const SEAT_SIZE = 35 // pixels. width & height

/**
 * seat inside the bus where a guest can sit on
 */
export class Seat {
  constructor (seatNumber, posX, posY) {
    /**
     * @type {int}
     */
    this.number = seatNumber
    /**
     * Guest or BusDriver will sit on a seat
     * @type {Person}
     */
    this.guest = null
    /**
     * pixel x-coordinate on canvas where the seat
     * is placed.
     * @type {int}
     */
    this.posX = posX
    /**
     * pixel y-coordinate on canvas where the seat
     * is placed.
     * @type {int}
     */
    this.posY = posY
    /**
     * @type {boolean}
     */
    this.isFree = true
  }

  /**
   * let guest sit on this seat.
   *
   * seats are not assigned to the bus driver because
   * he has a dedicated seat from the start which will
   * not change.
   * @param {Guest} guest an object of type Guest
   */
  assignSeat (guest) {
    this.guest = guest
    this.isFree = false
  }

  /**
   * make seat free. When guest leaves his seat
   * call this method, because free seats are
   * detected via the isFree attribute.
   */
  makeFree () {
    this.guest = null
    this.isFree = true
  }
}
