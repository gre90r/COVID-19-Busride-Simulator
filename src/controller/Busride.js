import { Bus } from '../model/Bus.js'
import { BusStation } from '../model/BusStation.js'
import {
  allGuestsEntered,
  allGuestsWhoWantToLeaveLeft,
  appendMetricsToCsvFile,
  generateNewGuests,
  getBusrideStateString,
  incrementCurrentStation,
  metricsSetTimestamp,
  nextGuestEntersTheBus,
  nextGuestLeavesTheBus,
  setGuestsEnterPerStationDeviation,
  setGuestsLeavePerStationDeviation,
  setTravelTimeDeviation,
  spreadInfection
} from './BusrideHelper.js'
import {
  buttonNext, chanceOfInfectedGuestSlider,
  chanceOfInfectedGuestValue, contactRadiusSlider,
  contactRadiusValue, contactTimeSlider,
  contactTimeValue, distanceToNextStationDeviationSlider,
  distanceToNextStationDeviationValue,
  distanceToNextStationSlider,
  distanceToNextStationValue, guestsEnterPerStationDeviationSlider,
  guestsEnterPerStationDeviationValue,
  guestsEnterPerStationSlider,
  guestsEnterPerStationValue, guestsLeavePerStationDeviationSlider,
  guestsLeavePerStationDeviationValue,
  guestsLeavePerStationSlider,
  guestsLeavePerStationValue, simulationSpeedSlider, simulationSpeedValue,
  spanBusrideState, stationsSlider,
  stationsValue
} from './dom.js'
import { Render } from '../view/Render.js'
import { BusrideOptions } from './BusrideOptions.js'
import { SimulationOptions } from './SimulationOptions.js'

/**
 * determine in which state the application is
 * @type {{GUESTS_LEAVE: number, GUESTS_ENTER: number,
 *         GUESTS_WAIT_AT_STATION: number,
 *         DRIVE_TO_NEXT_STATION: number,
 *         APPLICATION_START: number}}
 */
const BusrideState = {
  GUESTS_WAIT_AT_STATION: 0,
  GUESTS_ENTER: 1,
  DRIVE_TO_NEXT_STATION: 2,
  GUESTS_LEAVE: 3,
  APPLICATION_START: 4 // before the user started the simulation
}

/**
 * the application core.
 * starts, controls and displays all necessary modules.
 */
export class Busride {
  /**
   * create Busride Simulator instance
   * @param {p5.sketch} sketch
   */
  constructor ({ sketch }) {
    /**
     * for rendering
     * @type {p5.sketch}
     */
    this.sketch = sketch
    /**
     * @type {Bus}
     */
    this.bus = new Bus()
    /**
     * @type {BusStation}
     */
    this.busStation = new BusStation()
    /**
     * for all guests we make collision detection with other guests
     * within the contact radius to pass the infection.
     * every guest is represented by a circle.
     *
     * arrayLength is 41 because we have 40 guests and one bus driver
     *
     * @type {Person[]}
     */
    this.guests = new Array(41)
    /**
     * saves the bus ride state
     * @type {number}
     */
    this.busrideState = BusrideState.APPLICATION_START
    /**
     * create render service
     * @type {Render}
     */
    this.renderer = new Render(this.sketch, this.bus, this.busStation, this.guests)
    /**
     * how many guests who want to leave at the next station
     * @type {int}
     */
    this.guestsWhoWantToLeave = BusrideOptions.guestsLeavePerStation

    // set slider values according to the values in BusrideOptions.js
    this.initSliders()
  }

  /**
   * read BusrideOptions and set sliders accordingly
   */
  initSliders () {
    // slider values
    guestsEnterPerStationSlider.value = BusrideOptions.guestsEnterPerStation
    guestsLeavePerStationSlider.value = BusrideOptions.guestsLeavePerStation
    chanceOfInfectedGuestSlider.value = BusrideOptions.chanceOfInfectedGuest
    stationsSlider.value = BusrideOptions.stations
    distanceToNextStationSlider.value = BusrideOptions.distanceToNextStation
    contactRadiusSlider.value = BusrideOptions.contactRadius
    contactTimeSlider.value = BusrideOptions.contactTime
    guestsEnterPerStationDeviationSlider.value = BusrideOptions.guestsEnterPerStationDeviation
    guestsLeavePerStationDeviationSlider.value = BusrideOptions.guestsLeavePerStationDeviation
    distanceToNextStationDeviationSlider.value = BusrideOptions.distanceToNextStationDeviation
    simulationSpeedSlider.value = SimulationOptions.simulationSpeedMultiplier

    // slider labels
    guestsEnterPerStationValue.textContent = String(BusrideOptions.guestsEnterPerStation)
    guestsLeavePerStationValue.textContent = String(BusrideOptions.guestsLeavePerStation)
    chanceOfInfectedGuestValue.textContent = String(BusrideOptions.chanceOfInfectedGuest + '%')
    stationsValue.textContent = String(BusrideOptions.stations)
    distanceToNextStationValue.textContent = String(
      BusrideOptions.distanceToNextStation + ' minutes')
    contactRadiusValue.textContent = String(BusrideOptions.contactRadius + ' meters')
    contactTimeValue.textContent = String(BusrideOptions.contactTime + ' minutes')
    guestsEnterPerStationDeviationValue.textContent = String(
      BusrideOptions.guestsEnterPerStationDeviation)
    guestsLeavePerStationDeviationValue.textContent = String(
      BusrideOptions.guestsLeavePerStationDeviation)
    distanceToNextStationDeviationValue.textContent = String(
      BusrideOptions.distanceToNextStationDeviation)
    simulationSpeedValue.textContent = String(SimulationOptions.simulationSpeedMultiplier + 'x')
  }

  /**
   * steps through the Busride States.
   * the steps will repeat over and over again.
   * until the bus finished his route
   * steps:
   *    1) guests wait (at bus station)
   *    2) guests enter
   *    3) drive to next station
   *        - check contact radius collision with infected guests
   *        - count contact time on collision
   *    4) guests leave
   *    5) go back to 1)
   */
  nextStep () {
    buttonNext.textContent = 'Next'

    switch (this.busrideState) {
    case BusrideState.GUESTS_WAIT_AT_STATION:
      this.guestsWaitAtStation()
      this.setNextBusrideState(BusrideState.GUESTS_ENTER)
      break

    case BusrideState.GUESTS_ENTER:
      if (this.guestsEnter()) {
        // do not change Busride State while there
        // are guests who can enter the bus
        break
      }
      this.setNextBusrideState(BusrideState.DRIVE_TO_NEXT_STATION)
      break

    case BusrideState.DRIVE_TO_NEXT_STATION:
      this.driveToNextStation()
      this.setNextBusrideState(BusrideState.GUESTS_LEAVE)
      this.setGuestsWhoWantToLeave()
      break

    case BusrideState.GUESTS_LEAVE:
      if (this.guestsLeave()) {
        break
      }
      this.checkIsRouteFinished()
      this.setNextBusrideState(BusrideState.GUESTS_WAIT_AT_STATION)
      break

    case BusrideState.APPLICATION_START:
      this.applicationStart()
      this.setNextBusrideState(BusrideState.GUESTS_WAIT_AT_STATION)
      break

    default:
      console.error('unknown BusrideState in nextStep method')
    }

    spanBusrideState.textContent = getBusrideStateString(this.busrideState)
    this.renderer.displayMetricsOnUi()
  }

  /**
   * change application state to one of the following states:
   * - BusrideState.GUESTS_WAIT_AT_STATION
   * - BusrideState.GUESTS_ENTER
   * - BusrideState.DRIVE_TO_NEXT_STATION
   * - BusrideState.GUESTS_LEAVE
   * @param {number} busrideState
   */
  setNextBusrideState (busrideState) {
    this.busrideState = busrideState
  }

  /**
   * what the application should do in Busride State
   * Guests Wait At Station:
   *
   * this state has no functionality. It is only
   * necessary for the render function to render
   * new guests at the bus entrance
   */
  guestsWaitAtStation () {
  }

  /**
   * what the application should do in Busride State
   * Guests Enter:
   *
   * move each guest separately into the bus
   *
   * @return {boolean} true: there are still guests who have to enter the bus.
   *                   false: no guests will enter the bus, due to all guests
   *                          entered or the bus is full
   */
  guestsEnter () {
    // move each guest separately into the bus
    if (!allGuestsEntered(this.busStation) && !this.bus.isFull()) {
      nextGuestEntersTheBus(this.busStation, this.bus)
      return true
    }
    return false
  }

  /**
   * 1) increase current station count.
   * 2) increase contact time. while driving to the next station healthy guests can
   * be infected if they sit in the radius of an infected guest.
   * if a healthy guest sits longer in the radius of an infected guest
   * than the slider "Contact Time" allows, the healthy guest will
   * become infected. the contact time increases according to the slider
   * "Distance to Next Station".
   */
  driveToNextStation () {
    // application logic
    setTravelTimeDeviation()
    spreadInfection(this.bus)
    incrementCurrentStation(this.bus)

    // metrics for csv file
    metricsSetTimestamp(this.bus)
    appendMetricsToCsvFile(this.bus)
  }

  /**
   * move random guests in the bus to the exit
   * area outside the bus.
   * The amount of leaving guests is defined by the slider value.
   * @return {boolean} true: there are still guests who want to leave the bus.
   *                   false: all guests have left who wanted to leave
   */
  guestsLeave () {
    // move guests from the bus to the leaving area at the bus station
    if (!allGuestsWhoWantToLeaveLeft(this.guestsWhoWantToLeave)) {
      nextGuestLeavesTheBus(this.busStation, this.bus)
      this.guestsWhoWantToLeave -= 1
      return true
    }

    // set standard deviation for upcoming new guests
    setGuestsEnterPerStationDeviation()

    generateNewGuests(this.busStation)
    return false
  }

  /**
   * generate new guests at bus entrance
   */
  applicationStart () {
    generateNewGuests(this.busStation)
  }

  /**
   * check if bus arrived at last station.
   * if yes, stop application.
   */
  checkIsRouteFinished () {
    if (this.bus.currentStation >= BusrideOptions.stations) {
      buttonNext.setAttribute('disabled', 'disabled')
      buttonNext.textContent = 'Route finished'
      SimulationOptions.isAutomaticModeRunning = false

      this.renderer.createDownloadLinkForCsvFile()
    }
  }

  /**
   * controls what is rendered in which Busride State
   */
  render () {
    this.renderer.alwaysRenderTheseObjects()

    switch (this.busrideState) {
    case BusrideState.GUESTS_WAIT_AT_STATION:
      this.renderer.renderGuests()
      this.renderer.renderWaitingGuests()
      break
    case BusrideState.GUESTS_ENTER:
      this.renderer.renderGuests()
      this.renderer.renderWaitingGuests()
      break
    case BusrideState.DRIVE_TO_NEXT_STATION:
      this.renderer.renderGuests()
      break
    case BusrideState.GUESTS_LEAVE:
      this.renderer.renderGuests()
      this.renderer.renderLeavingGuests()
      break
    case BusrideState.APPLICATION_START:
      // do not render additional objects. only bus and bus driver are displayed
      break
    default:
      console.error('unknown BusrideState in render method.')
    }
  }

  /**
   * set the amount of guests who want to leave. this is defined
   * by the slider value "Guests Leave Per Station". It is also
   * affacted by the number of guests sitting in the bus.
   * @param {Bus} bus the bus where guests want to leave
   * @param {Busride} busride the number of guests who want
   *              to leave at the next station
   */
  setGuestsWhoWantToLeave () {
    // set standard deviation
    setGuestsLeavePerStationDeviation()

    // set number of guests
    const numberOfGuests = this.bus.howManyGuestsInTheBus()
    if (numberOfGuests < BusrideOptions.guestsLeavePerStation) {
      this.guestsWhoWantToLeave = numberOfGuests
    } else {
      this.guestsWhoWantToLeave = BusrideOptions.guestsLeavePerStation
    }

    // clear bus station leaving area from last run
    this.busStation.guestsInLeavingArea = []
  }
}
