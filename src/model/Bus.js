import { Seat } from './Seat.js'
import { HealthCondition } from './Person.js'

/**
 * a bus which drives guests to the next station
 */
export class Bus {
  constructor () {
    /**
     * @type {int}
     */
    this.currentStation = 1
    /**
     * 40 seats for Guests. Bus Driver's seat is
     * not listed here, because he has a hardcoded
     * position.
     * @type {Seat[]}
     */
    this.seats = [
      new Seat(1, 655, 255),
      new Seat(2, 175, 95),
      new Seat(3, 495, 255),
      new Seat(4, 375, 95),
      new Seat(5, 175, 255),
      new Seat(6, 655, 95),
      new Seat(7, 335, 255),
      new Seat(8, 495, 95),
      new Seat(9, 255, 255),
      new Seat(10, 575, 255),
      new Seat(11, 255, 95),
      new Seat(12, 575, 95),
      new Seat(13, 375, 255),
      new Seat(14, 215, 255),
      new Seat(15, 215, 95),
      new Seat(16, 335, 95),
      new Seat(17, 535, 95),
      new Seat(18, 615, 95),
      new Seat(19, 535, 255),
      new Seat(20, 615, 255),
      new Seat(21, 375, 215),
      new Seat(22, 335, 215),
      new Seat(23, 375, 135),
      new Seat(24, 335, 135),
      new Seat(25, 495, 215),
      new Seat(26, 495, 135),
      new Seat(27, 535, 135),
      new Seat(28, 535, 215),
      new Seat(29, 255, 215),
      new Seat(30, 255, 135),
      new Seat(31, 575, 135),
      new Seat(32, 575, 215),
      new Seat(33, 215, 215),
      new Seat(34, 215, 135),
      new Seat(35, 615, 135),
      new Seat(36, 615, 215),
      new Seat(37, 175, 135),
      new Seat(38, 175, 215),
      new Seat(39, 655, 135),
      new Seat(40, 655, 215)
    ]
  }

  /**
   * check every seat for a person sitting on it
   * @return {int} number of guests
   */
  howManyGuestsInTheBus () {
    let guestCounter = 0
    this.seats.forEach(seat => {
      if (seat.guest != null) {
        guestCounter++
      }
    })
    return guestCounter
  }

  /**
   * searches for the available seat with the
   * lowest seat number.
   * @return {Seat} seat. if all seats are taken, it
   *         returns null.
   */
  nextFreeSeat () {
    // array is sorted by seat number
    let nextFreeSeat = null
    this.seats.forEach(seat => {
      if (seat.isFree) {
        // only assign the first free seat
        if (nextFreeSeat == null) {
          nextFreeSeat = seat
        }
      }
    })
    return nextFreeSeat
  }

  /**
   * check if all seats are taken
   * @return {boolean} true: all seats are taken.
   *                   false: there are free seats available
   */
  isFull () {
    if (this.howManyGuestsInTheBus() >= this.seats.length) {
      return true
    }
    return false
  }

  /**
   * count healthy guests in the bus
   * @return {int} how many guests in the bus are healthy
   */
  getNumberOfHealthyGuests () {
    let numHealthyGuests = 0
    this.seats.forEach(seat => {
      if (!seat.isFree) {
        if (seat.guest.healthCondition === HealthCondition.HEALTHY) {
          numHealthyGuests++
        }
      }
    })
    return numHealthyGuests
  }

  /**
   * count infected guests in the bus
   * @return {int} how many guests in the bus are infected
   */
  getNumberOfInfectedGuests () {
    let numInfectedGuests = 0
    this.seats.forEach(seat => {
      if (!seat.isFree) {
        if (seat.guest.healthCondition === HealthCondition.INFECTED) {
          numInfectedGuests++
        }
      }
    })
    return numInfectedGuests
  }

  /**
   * return the seats of all infected guests
   * @param {Seat[]} infectedSeats the return value is stored in that argument
   */
  getInfectedSeats (infectedSeats) {
    this.seats.forEach(seat => {
      if (!seat.isFree) {
        if (seat.guest.healthCondition === HealthCondition.INFECTED) {
          infectedSeats.push(seat)
        }
      }
    })
  }
}
