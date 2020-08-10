/**
 * one position where a guest can stand
 * for entering or leaving the bus.
 */
import { HealthCondition } from './Person.js'

class Position {
  /**
   * position on the canvas
   * @param {int} posX
   * @param {int} posY
   */
  constructor (posX, posY) {
    /**
     * pixel x-coordinate on canvas
     * @type {int}
     */
    this.x = posX
    /**
     * pixel y-coordinate on canvas
     * @type {int}
     */
    this.y = posY
  }
}

/**
 * the bus station is the place where guests wait
 * to enter the bus. it also has a section to
 * display guests who have left.
 */
export class BusStation {
  static getNumGuestEnterPositions () {
    return 10 // is according to this.guestEnterPositions array
  }

  static getNumGuestLeavePositions () {
    return 10 // is according to this.guestLeavePositions array
  }

  /**
   * create bus station. creates fixed position
   * for guest enter and leave positions. So only
   * one bus station makes sense in the application.
   */
  constructor () {
    /**
     * positions where guests wait to enter the bus
     * @type {Position[]}
     */
    this.guestEnterPositions = new Array(10)
    this.guestEnterPositions[0] = new Position(120, 50)
    this.guestEnterPositions[1] = new Position(180, 50)
    this.guestEnterPositions[2] = new Position(240, 50)
    this.guestEnterPositions[3] = new Position(300, 50)
    this.guestEnterPositions[4] = new Position(360, 50)
    this.guestEnterPositions[5] = new Position(120, 10)
    this.guestEnterPositions[6] = new Position(180, 10)
    this.guestEnterPositions[7] = new Position(240, 10)
    this.guestEnterPositions[8] = new Position(300, 10)
    this.guestEnterPositions[9] = new Position(360, 10)

    /**
     * positions where guests will be displayed when they
     * leave the bus.
     * @type {Position[]}
     */
    this.guestLeavePositions = new Array(10)
    this.guestLeavePositions[0] = new Position(495, 50)
    this.guestLeavePositions[1] = new Position(555, 50)
    this.guestLeavePositions[2] = new Position(615, 50)
    this.guestLeavePositions[3] = new Position(675, 50)
    this.guestLeavePositions[4] = new Position(735, 50)
    this.guestLeavePositions[5] = new Position(495, 10)
    this.guestLeavePositions[6] = new Position(555, 10)
    this.guestLeavePositions[7] = new Position(615, 10)
    this.guestLeavePositions[8] = new Position(675, 10)
    this.guestLeavePositions[9] = new Position(735, 10)

    /**
     * all guests in this array will be displayed at
     * the bus entrance.
     * @type {Guest[]}
     */
    this.guestsWaitingAtTheStation = []

    /**
     * all guests in this array will be displayed in the exit
     * area
     * @type {Guest[]}
     */
    this.guestsInLeavingArea = []
  }

  /**
   * @return {int} number of healthy guests waiting at the bus entrance
   */
  getNumberOfHealthyGuestsAtEntrance () {
    let healthyCounter = 0
    this.guestsWaitingAtTheStation.forEach(guest => {
      if (guest.healthCondition === HealthCondition.HEALTHY) {
        healthyCounter++
      }
    })
    return healthyCounter
  }

  /**
   * @return {int} number of infected guests waiting at the bus entrance
   */
  getNumberOfInfectedGuestsAtEntrance () {
    let InfectedCounter = 0
    this.guestsWaitingAtTheStation.forEach(guest => {
      if (guest.healthCondition === HealthCondition.INFECTED) {
        InfectedCounter++
      }
    })
    return InfectedCounter
  }

  /**
   * @return {int} number of healthy guests at the bus leaving area
   */
  getNumberOfHealthyGuestsAtLeavingArea () {
    let healthyCounter = 0
    this.guestsInLeavingArea.forEach(guest => {
      if (guest.healthCondition === HealthCondition.HEALTHY) {
        healthyCounter++
      }
    })
    return healthyCounter
  }

  /**
   * @return {int} number of infected guests at the bus leaving area
   */
  getNumberOfInfectedGuestsAtLeavingArea () {
    let InfectedCounter = 0
    this.guestsInLeavingArea.forEach(guest => {
      if (guest.healthCondition === HealthCondition.INFECTED) {
        InfectedCounter++
      }
    })
    return InfectedCounter
  }
}
