// -------------------------------------------------------------------------
// methods from Busride.js have been extracted here to allow better testing
// -------------------------------------------------------------------------

import { BusrideOptions, CONTACT_RADIUS_MULTIPLIER } from './BusrideOptions.js'
import { SEAT_SIZE } from '../model/Seat.js'
import { Guest } from '../model/Guest.js'
import { HealthCondition } from '../model/Person.js'
import { Utils } from '../util/Utils.js'
import { Csv, Metrics } from '../model/Metrics.js'
import { BusStation } from '../model/BusStation.js'

/**
 * generate new guests who want to enter the bus
 * @param {BusStation} busStation
 */
export function generateNewGuests (busStation) {
  // clear waiting guests from last iteration
  busStation.guestsWaitingAtTheStation = []

  // generate new guests
  for (let i = 0; i < BusrideOptions.guestsEnterPerStation; i++) {
    // circle position of guest
    const circlePosX = busStation.guestEnterPositions[i].x + SEAT_SIZE * 0.5
    const circlePosY = busStation.guestEnterPositions[i].y + SEAT_SIZE * 0.5

    const newGuest = new Guest(circlePosX, circlePosY)

    // decide if new guest is infected. set circle color
    if (isNewGuestInfected()) {
      newGuest.healthCondition = HealthCondition.INFECTED
    } else {
      newGuest.healthCondition = HealthCondition.HEALTHY
    }

    // add guest to waiting at station guests
    busStation.guestsWaitingAtTheStation.push(newGuest)
  }
}

/**
 * based on slider value "Chance of infected Guest" determines
 * if the next guest is infected
 * @returns {boolean} true: is infected. false: is healthy
 */
export function isNewGuestInfected () {
  const randomNumber = Utils.randomNumberBetweenOneAnd(100)
  if (randomNumber <= BusrideOptions.chanceOfInfectedGuest) {
    return true
  }
  return false
}

/**
 * convert BusrideState number to string
 * @param {number} busrideState
 * @return {string} busride state in text form
 */
export function getBusrideStateString (busrideState) {
  switch (busrideState) {
  case 0:
    return 'Guests Wait At The Station'
  case 1:
    return 'Guests Enter The Bus'
  case 2:
    return 'Drive to Next Station'
  case 3:
    return 'Guests Leave The Bus'
  case 4:
    return 'Application Start'
  default:
    return 'unknown Busride State'
  }
}

/**
 * check if guests are standing at the bus entrance
 * @param {BusStation} busStation
 * @returns {boolean} true: no guest stands at the entrance
 *                    false: there are guests standing at the entrance
 */
export function allGuestsEntered (busStation) {
  if (busStation.guestsWaitingAtTheStation.length > 0) {
    return false
  }
  return true
}

/**
 * move one person from the bus entrance into the bus
 * @param {BusStation} busStation
 * @param {Bus} bus
 */
export function nextGuestEntersTheBus (busStation, bus) {
  const seat = bus.nextFreeSeat()
  if (seat != null) {
    const guest = busStation.guestsWaitingAtTheStation.pop()
    seat.assignSeat(guest)

    // metrics
    metricsSetNumberOfGuests(bus)
    metricsSetNumberOfHealthyGuests(bus)
    metricsSetNumberOfInfectedGuests(bus)
    if (guest.healthCondition === HealthCondition.HEALTHY) {
      metricsAddIncomingHealthyGuests(1)
    } else {
      metricsAddIncomingInfectedGuests(1)
    }
  }
}

/**
 * increase current station count by one
 * @param {Bus} bus
 */
export function incrementCurrentStation (bus) {
  if (bus.currentStation < BusrideOptions.stations) {
    bus.currentStation++
  }
}

/**
 * check if there are guests in the bus who want to leave
 * @param {int} numberOfGuestsWhoWantToLeave. only a number
 * @return {boolean} true: all guests who wanted to leave have left.
 *                   false: there are still guests who want to leave.
 */
export function allGuestsWhoWantToLeaveLeft (numberOfGuestsWhoWantToLeave) {
  if (numberOfGuestsWhoWantToLeave > 0) {
    return false
  }
  return true
}

/**
 * pick a random guest in the bus which will leave
 * @param {BusStation} busStation the bus station where the guest will be moved to
 * @param {Bus} bus a guest will be picked from this bus
 */
export function nextGuestLeavesTheBus (busStation, bus) {
  if (bus.howManyGuestsInTheBus() === 0) return

  // pick a random guest (seat number where the guest sits)
  const randomSeatNumber = getRandomGuestSeatNumber(bus)
  const guest = bus.seats[randomSeatNumber - 1].guest
  // move to bus station leaving area
  busStation.guestsInLeavingArea.push(guest)

  // remove guest from bus
  bus.seats[randomSeatNumber - 1].makeFree()

  // metrics
  metricsSetNumberOfGuests(bus)
  metricsSetNumberOfHealthyGuests(bus)
  metricsSetNumberOfInfectedGuests(bus)
  if (guest.healthCondition === HealthCondition.HEALTHY) {
    metricsAddOutgoingHealthyGuests(1)
  } else {
    metricsAddOutgoingInfectedGuests(1)
  }
}

/**
 * choose a random guest in the bus and get is seat number
 * @param {Bus} bus the bus where to pick a random guest from
 * @return {int} seat number of a random guest. if bus is empty returns -1.
 */
export function getRandomGuestSeatNumber (bus) {
  if (bus.howManyGuestsInTheBus() === 0) { return -1 }

  // get all seat numbers where guests sit
  const seatNumbers = []
  bus.seats.forEach(seat => {
    if (!seat.isFree) {
      seatNumbers.push(seat.number)
    }
  })
  // choose a random seat number by getting a random index for
  // seatNumbers array
  const i = Utils.randomNumberBetweenOneAnd(seatNumbers.length) - 1
  return seatNumbers[i]
}

/**
 * healthy guests become infected from infected
 * guests over time. increases the contact time
 * if a healthy guest sits in the radius of an
 * infected guest. if contact time is greater than
 * the contact time slider value the healthy guest
 * will become infected.
 *
 * TODO: improve readability by extracting parts of the code
 *
 * @param {Bus} bus the driving bus where guests infect each other.
 */
export function spreadInfection (bus) {
  // go over every seat, check if a guest sits on it, if
  // he is infected, spread the infection
  let seatToCheck // seatToCheck is always an infected guest, to improve performance

  /**
   * @type Seat[]
   */
  const infectedSeats = []
  bus.getInfectedSeats(infectedSeats)

  for (let i = 0; i < infectedSeats.length; i++) {
    seatToCheck = infectedSeats[i]
    if (!seatToCheck.isFree) {
      // only check infected guests, because only they can infect others
      if (seatToCheck.guest.healthCondition === HealthCondition.INFECTED) {
        // increase contact time for other guests whose radius overlap
        // with this infected guest.
        let seatOther
        for (let k = 0; k < bus.seats.length; k++) {
          seatOther = bus.seats[k]
          if (!seatOther.isFree) {
            // do not check guest with itself
            if (seatToCheck.number !== seatOther.number) {
              // only infect healthy guests
              if (seatOther.guest.healthCondition === HealthCondition.HEALTHY) {
                // if the other guest is in the radius of the infected guest
                if (isRadiusOverlapping(seatToCheck, seatOther)) {
                  // increase contact time for healthy guest
                  seatOther.guest.contactTime += parseInt(BusrideOptions.distanceToNextStation)
                  // if healthy guest exceeded contact time, make him infected
                  if (seatOther.guest.contactTime >= BusrideOptions.contactTime) {
                    seatOther.guest.setHealthCondition(HealthCondition.INFECTED)
                    metricsAddNewInfections(1)
                  }
                } // isRadiusOverlapping
              } // if other guest is healthy
            } // seatNumber != seatNumber
          } // seat other is free
        } // forEach
      } // is guestToCheck infected
    } // if seat is free
  } // for
} // spreadInfection

/**
 * check if the radius of guest A and B overlap
 * @param {Seat} seatA
 * @param {Seat} seatB
 * @return {boolean} true: guestA overlaps with guestB.
 *                   false: guestA does not overlap with guestB
 */
export function isRadiusOverlapping (seatA, seatB) {
  if (Utils.distanceBetweenTwoPoints(seatA.posX, seatA.posY, seatB.posX, seatB.posY) <
      (BusrideOptions.contactRadius * CONTACT_RADIUS_MULTIPLIER)) {
    return true
  }
  return false
}

/**
 * append current metrics to csv
 * TODO: test appendMetricsToCsvFile
 */
export function appendMetricsToCsvFile () {
  // append to csv
  Csv.contents +=
    Metrics.timestamp + ',' +
    Metrics.numberOfGuests + ',' +
    Metrics.numberIncomingHealthyGuests + ',' +
    Metrics.numberIncomingInfectedGuests + ',' +
    Metrics.numberOutgoingHealthyGuests + ',' +
    Metrics.numberOutgoingInfectedGuests + ',' +
    Metrics.healthy + ',' +
    Metrics.infected + ',' +
    Metrics.newInfections + '\n'
}

/**
 * set the duration how long the bus drove since the start
 * @param {Bus} bus
 */
export function metricsSetTimestamp (bus) {
  Metrics.timestamp = Metrics.timestamp + BusrideOptions.distanceToNextStation
}

/**
 * how many guests are sitting currently in the bus
 * @param {Bus} bus
 */
export function metricsSetNumberOfGuests (bus) {
  Metrics.numberOfGuests = bus.howManyGuestsInTheBus()
}

/**
 * how many guests are healthy
 * @param {Bus} bus
 */
export function metricsSetNumberOfHealthyGuests (bus) {
  Metrics.healthy = bus.getNumberOfHealthyGuests()
}

/**
 * how many guests are infected
 * @param {Bus} bus
 */
export function metricsSetNumberOfInfectedGuests (bus) {
  Metrics.infected = bus.getNumberOfInfectedGuests()
}

/**
 * new infections are counted when a healthy guest becomes infected
 * @param {int} numNewInfections
 */
export function metricsAddNewInfections (numNewInfections) {
  Metrics.newInfections += numNewInfections
}

/**
 * how many infected guests entered the bus at the current station
 * @param {int} incomingInfectedGuests
 */
export function metricsAddIncomingInfectedGuests (incomingInfectedGuests) {
  Metrics.numberIncomingInfectedGuests += incomingInfectedGuests
}

/**
 * how many healthy guests entered the bus at the current station
 * @param {int} incomingHealthyGuests
 */
export function metricsAddIncomingHealthyGuests (incomingHealthyGuests) {
  Metrics.numberIncomingHealthyGuests += incomingHealthyGuests
}

/**
 * how many healthy guests left the bus at the current station
 * @param {int} outgoingHealthyGuests
 */
export function metricsAddOutgoingHealthyGuests (outgoingHealthyGuests) {
  Metrics.numberOutgoingHealthyGuests += outgoingHealthyGuests
}

/**
 * how many infected guests left the bus at the current station
 * @param {int} outgoingInfectedGuests
 */
export function metricsAddOutgoingInfectedGuests (outgoingInfectedGuests) {
  Metrics.numberOutgoingInfectedGuests += outgoingInfectedGuests
}

/**
 * set the standard deviation for distance to next station
 */
export function setTravelTimeDeviation () {
  let randomGaussianTravelTime = Utils.randomNumberFromGaussianDistribution(
    BusrideOptions.distanceToNextStationSliderValue,
    BusrideOptions.distanceToNextStationDeviation
  )

  if (randomGaussianTravelTime < 0) {
    randomGaussianTravelTime = 0
  }

  BusrideOptions.distanceToNextStation = parseInt(randomGaussianTravelTime)
}

/**
 * set the standard deviation for guests enter per station
 */
export function setGuestsEnterPerStationDeviation () {
  let gaussianRandom = Utils.randomNumberFromGaussianDistribution(
    BusrideOptions.guestsEnterPerStationSliderValue,
    BusrideOptions.guestsEnterPerStationDeviation)

  if (gaussianRandom < 0) {
    gaussianRandom = 0
  }
  if (gaussianRandom > BusStation.getNumGuestEnterPositions()) {
    gaussianRandom = BusStation.getNumGuestEnterPositions()
  }

  BusrideOptions.guestsEnterPerStation = parseInt(gaussianRandom)
}

/**
 * set the standard deviation for guests leave per station
 */
export function setGuestsLeavePerStationDeviation () {
  let gaussianRandom = Utils.randomNumberFromGaussianDistribution(
    BusrideOptions.guestsLeavePerStationSliderValue,
    BusrideOptions.guestsLeavePerStationDeviation)

  if (gaussianRandom < 0) {
    gaussianRandom = 0
  }
  if (gaussianRandom > BusStation.getNumGuestLeavePositions()) {
    gaussianRandom = BusStation.getNumGuestLeavePositions()
  }

  BusrideOptions.guestsLeavePerStation = parseInt(gaussianRandom)
}
