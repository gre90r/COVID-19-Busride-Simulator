/**
 * multiplies the contactRadius meter value, so
 * the meter value looks realistic on screen.
 * @type {int}
 */
export const CONTACT_RADIUS_MULTIPLIER = 40

/**
 * these variables can be changed on the web page
 */
export const BusrideOptions = {
  /**
   * !! this will be changed by deviation
   * @type {int}
   */
  guestsEnterPerStation: 3,
  /**
   * !! this will not be changed by deviation
   * @type {int}
   */
  guestsEnterPerStationSliderValue: 3,
  /**
   * how much guestsEnterPerStation varies around its value.
   * @type {int}
   */
  guestsEnterPerStationDeviation: 5,
  /**
   * !! this will be changed by deviation
   * @type {int}
   */
  guestsLeavePerStation: 1,
  /**
   * !! this will not be changed by deviation
   * @type {int}
   */
  guestsLeavePerStationSliderValue: 1,
  /**
   * how much guestsLeavePerStation varies around its value.
   * @type {int}
   */
  guestsLeavePerStationDeviation: 5,
  /**
   * a percentage value from 1 to 100
   * @type {int}
   */
  chanceOfInfectedGuest: 10, // in percent
  /**
   * how many stations the bus drives to on his route
   * @type {int}
   */
  stations: 7,
  /**
   * time in minutes. how long it takes to drive to the next station
   * !! this value will be changed by deviation
   * @type {int}
   */
  distanceToNextStation: 3,
  /**
   * time in minutes. how long it takes to drive to the next station
   * !! this value will only be changed if the slider value changes
   * @type {int}
   */
  distanceToNextStationSliderValue: 3,
  /**
   * how much the distance to next station varies around its value.
   * @type {int}
   */
  distanceToNextStationDeviation: 5,
  /**
   * in meter. contactRadius of guests. if the contactRadius of
   * an infected and a healthy guest overlap, the healthy guest
   * can be infected.
   * @type {int}
   */
  contactRadius: 2,
  /**
   * in minutes. how long it takes to infect surrounding people
   * @type {int}
   */
  contactTime: 20
}
