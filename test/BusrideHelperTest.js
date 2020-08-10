import chai from 'chai'

import {
  allGuestsEntered,
  allGuestsWhoWantToLeaveLeft,
  generateNewGuests,
  getBusrideStateString,
  getRandomGuestSeatNumber,
  incrementCurrentStation,
  isRadiusOverlapping,
  metricsAddIncomingHealthyGuests,
  metricsAddIncomingInfectedGuests,
  metricsSetNumberOfGuests,
  metricsSetNumberOfHealthyGuests,
  metricsSetNumberOfInfectedGuests,
  metricsAddOutgoingHealthyGuests,
  metricsAddOutgoingInfectedGuests,
  metricsSetTimestamp,
  nextGuestEntersTheBus,
  nextGuestLeavesTheBus,
  spreadInfection, metricsAddNewInfections
} from '../src/controller/BusrideHelper.js'
import { BusStation } from '../src/model/BusStation.js'
import { BusrideOptions } from '../src/controller/BusrideOptions.js'
import { Guest } from '../src/model/Guest.js'
import { Bus } from '../src/model/Bus.js'
import { HealthCondition } from '../src/model/Person.js'
import { Csv, Metrics } from '../src/model/Metrics.js'

/********************/
/* helper functions */
/********************/
/**
 * assign every seat in the bus to a newly created guest
 * @param {Bus} bus
 */
function makeBusFull (bus) {
  bus.seats.forEach(seat => {
    seat.assignSeat(new Guest())
  })
}
/**
 * assign every seat in the bus to a healthy guest
 * @param {Bus} bus
 */
function makeBusFullOfHealthyGuests (bus) {
  bus.seats.forEach(seat => {
    const guest = new Guest()
    guest.setHealthCondition(HealthCondition.HEALTHY)
    seat.assignSeat(guest)
  })
}
/**
 * assign every seat in the bus to an infected guest
 * @param {Bus} bus
 */
function makeBusFullOfInfectedGuests (bus) {
  bus.seats.forEach(seat => {
    const guest = new Guest()
    guest.setHealthCondition(HealthCondition.INFECTED)
    seat.assignSeat(guest)
  })
}
/**
 * zero all metrics
 */
function resetMetrics () {
  Metrics.timestamp = 0
  Metrics.numberOfGuests = 0
  Metrics.numberOutgoingInfectedGuests = 0
  Metrics.numberOutgoingHealthyGuests = 0
  Metrics.numberIncomingInfectedGuests = 0
  Metrics.numberIncomingHealthyGuests = 0
  Metrics.infected = 0
  Metrics.healthy = 0
  Metrics.newInfections = 0
}

/**
 * mocha hook: run before each test
 */
beforeEach(() => {
  resetMetrics()
})

describe('Busride Helper', () => {
  /***********************/
  /* generate new guests */
  /***********************/
  describe('generateNewGuests', () => {
    it('should generate new guests', () => {
      const busStation = new BusStation()
      generateNewGuests(busStation)
      chai.expect(busStation.guestsWaitingAtTheStation.length)
        .to.equal(BusrideOptions.guestsEnterPerStation)
    })

    it('should clear previous guests', () => {
      const busStation = new BusStation()
      generateNewGuests(busStation)
      generateNewGuests(busStation)
      // should only display the newly generated guests and the
      // ones from previous call
      chai.expect(busStation.guestsWaitingAtTheStation.length)
        .to.equal(BusrideOptions.guestsEnterPerStation)
    })
  })

  /**********************/
  /* all guests entered */
  /**********************/
  describe('allGuestsEntered', () => {
    it('should detect waiting guests at the bus station', () => {
      const busStation = new BusStation()

      // there are 3 guests waiting at the station
      busStation.guestsWaitingAtTheStation.push(new Guest())
      busStation.guestsWaitingAtTheStation.push(new Guest())
      busStation.guestsWaitingAtTheStation.push(new Guest())

      chai.expect(allGuestsEntered(busStation)).to.be.false
    })

    it('should detect if all guests have entered', () => {
      const busStation = new BusStation()

      // there are no guests waiting at the bus station
      busStation.guestsWaitingAtTheStation = []

      chai.expect(allGuestsEntered(busStation)).to.be.true
    })
  })

  /*****************************/
  /* next guest enters the bus */
  /*****************************/
  describe('nextGuestEntersTheBus', () => {
    it('should move the guest into the bus', () => {
      const busStation = new BusStation()
      const bus = new Bus()

      // 3 guests waiting at the bus station
      busStation.guestsWaitingAtTheStation.push(new Guest())
      busStation.guestsWaitingAtTheStation.push(new Guest())
      busStation.guestsWaitingAtTheStation.push(new Guest())

      nextGuestEntersTheBus(busStation, bus)

      chai.expect(busStation.guestsWaitingAtTheStation.length).to.equal(2)
      chai.expect(bus.howManyGuestsInTheBus()).to.equal(1)
    })

    it('should not move the guest into the bus if all seats are taken', () => {
      const busStation = new BusStation()
      const bus = new Bus()

      // all seats are taken in the bus
      bus.seats.forEach(seat => {
        seat.assignSeat(new Guest())
      })

      // 3 guests waiting at the bus station
      busStation.guestsWaitingAtTheStation.push(new Guest())
      busStation.guestsWaitingAtTheStation.push(new Guest())
      busStation.guestsWaitingAtTheStation.push(new Guest())

      chai.expect(() => {
        nextGuestEntersTheBus(busStation, bus)
      }).to.not.throw()

      // guests do not enter, therefore keep waiting at the bus station
      chai.expect(busStation.guestsWaitingAtTheStation.length).to.equal(3)
      // 40 guests (Bus Driver is not listed on the seats because he has
      // a hardcoded seat.
      chai.expect(bus.howManyGuestsInTheBus()).to.equal(40)
    })
  })

  /****************************/
  /* get busride state string */
  /****************************/
  describe('getBusrideStateString', () => {
    it('should be able to return every busride state string', () => {
      chai.expect(getBusrideStateString(0)).to.equal('Guests Wait At The Station')
      chai.expect(getBusrideStateString(1)).to.equal('Guests Enter The Bus')
      chai.expect(getBusrideStateString(2)).to.equal('Drive to Next Station')
      chai.expect(getBusrideStateString(3)).to.equal('Guests Leave The Bus')
      chai.expect(getBusrideStateString(4)).to.equal('Application Start')
    })
    it('should return error message string on unknown busride state', () => {
      // busride state 99 does not exist
      chai.expect(getBusrideStateString(99)).to.equal('unknown Busride State')
    })
  })

  /*****************************/
  /* increment current station */
  /*****************************/
  describe('incrementCurrentStation', () => {
    it('should increase the current station count by one', () => {
      const bus = new Bus()
      chai.expect(bus.currentStation).to.equal(1)
      incrementCurrentStation(bus)
      chai.expect(bus.currentStation).to.equal(2)
    })
    it('current station count should not be greater than total stations', () => {
      const bus = new Bus()
      // drive bus to last station
      for (let i = 0; i < BusrideOptions.stations; i++) {
        incrementCurrentStation(bus)
      }
      // try to drive further than last station
      incrementCurrentStation(bus)
      // should not driver further than last station
      // BusrideOptions.stations is total stations
      chai.expect(bus.currentStation).to.equal(BusrideOptions.stations)
    })
  })

  /*************************************/
  /* all guests who want to leave left */
  /*************************************/
  describe('all guests who want to leave left', () => {
    it('should detect guests who want to leave', () => {
      chai.expect(allGuestsWhoWantToLeaveLeft(3)).to.be.false
    })
    it('should detect if all guests who wanted to leave have left', () => {
      chai.expect(allGuestsWhoWantToLeaveLeft(0)).to.be.true
    })
  })

  /*****************************/
  /* next guest leaves the bus */
  /*****************************/
  describe('next guest leaves the bus', () => {
    it('should move one guest from the bus to the bus station leaving area', () => {
      const busStation = new BusStation()
      const bus = new Bus()

      // put guests into bus (full bus)
      bus.seats.forEach(seat => {
        seat.assignSeat(new Guest())
      })
      chai.expect(bus.isFull()).to.be.true
      chai.expect(bus.howManyGuestsInTheBus()).to.equal(bus.seats.length)

      nextGuestLeavesTheBus(busStation, bus)
      chai.expect(bus.howManyGuestsInTheBus()).to.equal(bus.seats.length - 1)
      chai.expect(busStation.guestsInLeavingArea.length).to.equal(1)
    })
    it('should do nothing if the bus is empty', () => {
      const busStation = new BusStation()
      const bus = new Bus() // empty bus
      chai.expect(bus.howManyGuestsInTheBus()).to.equal(0)
      chai.expect(busStation.guestsInLeavingArea.length).to.equal(0)
      nextGuestLeavesTheBus(busStation, bus)
      // should not throw and should remain 0
      chai.expect(bus.howManyGuestsInTheBus()).to.equal(0)
      chai.expect(busStation.guestsInLeavingArea.length).to.equal(0)
    })
  })

  /********************************/
  /* get random guest seat number */
  /********************************/
  describe('get random guest seat number', () => {
    it('should return the seat number of the one guest sitting in the bus', () => {
      const bus = new Bus()
      // place one guest inside the bus
      const EXPECTED_SEAT_NUMBER = 20
      bus.seats[EXPECTED_SEAT_NUMBER].assignSeat(new Guest())
      // find guest with seat number 20.
      // +1 because seats[0] = seat number 1 AND seats[20] = seat number 21
      chai.expect(getRandomGuestSeatNumber(bus)).to.equal(EXPECTED_SEAT_NUMBER + 1)
    })
    it('should return seat number -1 if bus is empty', () => {
      const bus = new Bus() // empty bus
      chai.expect(getRandomGuestSeatNumber(bus)).to.equal(-1)
    })
    it('should pick one of the three seat numbers where guests sit on', () => {
      const bus = new Bus()
      // place three guests inside the bus
      bus.seats[1].assignSeat(new Guest()) // seat number 2
      bus.seats[11].assignSeat(new Guest()) // seat number 12
      bus.seats[21].assignSeat(new Guest()) // seat number 22
      // function should return seat number 2, 12 or 22
      chai.expect(getRandomGuestSeatNumber(bus)).to.be.oneOf([2, 12, 22])
    })
  })

  // /********************************/
  // /* set guests who want to leave */
  // /********************************/
  // describe('set guests who want to leave', () => {
  //   it('should set guestsWhoWantToLeave to the slider value', () => {
  //     const bus = new Bus()
  //     // make bus full
  //     bus.seats.forEach(seat => {
  //       seat.assignSeat(new Guest())
  //     })
  //     // expect to set guestsWhoWantToLeave to slider value
  //     chai.expect(setGuestsWhoWantToLeave(bus)).to.equal(BusrideOptions.guestsLeavePerStation)
  //   })
  //   it('should set guestsWhoWantToLeave to number of guests if bus is not full enough', () => {
  //     const bus = new Bus()
  //     BusrideOptions.guestsLeavePerStation = 3
  //     // create one guest
  //     bus.seats[0].assignSeat(new Guest())
  //     // expect to set guestsWhoWantToLeave to number of guests in the bus
  //     chai.expect(setGuestsWhoWantToLeave(bus)).to.equal(1)
  //   })
  // })

  /********************/
  /* spread infection */
  /********************/
  describe('spread infection', () => {
    it('should increase contact time', () => {
      const bus = new Bus()
      // place one healthy and one infected guest beside each other
      // so the contact radius overlaps and the contact time of the
      // healthy guest increases
      const guestHealthy = new Guest()
      guestHealthy.setHealthCondition(HealthCondition.HEALTHY)

      const guestInfected = new Guest()
      guestInfected.setHealthCondition(HealthCondition.INFECTED)

      // see doc/spread-infection/two-guests-overlap.png
      bus.seats[0].assignSeat(guestHealthy) // seat number 1
      bus.seats[19].assignSeat(guestInfected) // seat number 20

      // check if contact time increases for guestHealthy
      chai.expect(guestHealthy.contactTime).to.equal(0)
      spreadInfection(bus)
      // contact time increases by the amount of the time it takes for
      // the bus to drive to the next station.
      chai.expect(guestHealthy.contactTime).to.equal(BusrideOptions.distanceToNextStation)
    })
    it('should infect healthy guests if contact time is exceeded', () => {
      BusrideOptions.contactTime = 20 // minutes
      BusrideOptions.distanceToNextStation = 3 // minutes
      BusrideOptions.contactRadius = 2 // meters
      const bus = new Bus()
      // place one healthy and one infected guest beside each other
      // so the contact radius overlaps and the contact time of the
      // healthy guest increases
      const guestHealthy = new Guest()
      guestHealthy.setHealthCondition(HealthCondition.HEALTHY)
      // only one minute apart to become infected
      guestHealthy.contactTime = BusrideOptions.contactTime - 1

      const guestInfected = new Guest()
      guestInfected.setHealthCondition(HealthCondition.INFECTED)

      // they sit in front/behind of each other.
      // seat 20 is the seat in front of seat 1.
      // see doc/spread-infection/two-guests-overlap.png
      bus.seats[0].assignSeat(guestHealthy) // seat number 1
      bus.seats[19].assignSeat(guestInfected) // seat number 20

      // check if guestHealthy becomes infected
      spreadInfection(bus)
      // contact time increases by the amount of the time it takes for
      // the bus to drive to the next station.
      chai.expect(guestHealthy.healthCondition).to.equal(HealthCondition.INFECTED)
    })
    // radiuses are touching but do not overlap
    it('should not spread if the radiuses are exactly beside each other', () => {
      const bus = new Bus()
      // place one healthy and one infected guest beside each other
      // so the contact radius overlaps and the contact time of the
      // healthy guest increases
      const guestHealthy = new Guest()
      guestHealthy.setHealthCondition(HealthCondition.HEALTHY)
      const guestInfected = new Guest()
      guestInfected.setHealthCondition(HealthCondition.INFECTED)
      // seat number 10 is two rows in front of seat number 1
      // see doc/spread-infection/two-guests-overlap.png
      bus.seats[0].assignSeat(guestHealthy) // seat number 1
      bus.seats[9].assignSeat(guestInfected) // seat number 10
      // check if contact time increases for guestHealthy
      chai.expect(guestHealthy.contactTime).to.equal(0)
      spreadInfection(bus)
      // contact time increases by the amount of the time it takes for
      // the bus to drive to the next station.
      chai.expect(guestHealthy.contactTime).to.equal(0)
    })
    it('should count new infections. 1 infected infects 1 healthy', () => {
      // set parameters so healthy guest infects itself while driving from station 1 -> 2
      BusrideOptions.distanceToNextStation = 3
      BusrideOptions.contactTime = 1
      BusrideOptions.contactRadius = 2

      chai.expect(Metrics.newInfections).to.equal(0)
      const bus = new Bus()
      // place one healthy and one infected guest beside each other
      const healthyGuest = new Guest()
      healthyGuest.setHealthCondition(HealthCondition.HEALTHY)
      const infectedGuest = new Guest()
      infectedGuest.setHealthCondition(HealthCondition.INFECTED)
      // guests are beside each other, see seat numbering in bus
      bus.seats[0].assignSeat(healthyGuest)
      bus.seats[39].assignSeat(infectedGuest)

      spreadInfection(bus)
      chai.expect(Metrics.newInfections).to.equal(1)
    })
    it('should count new infections. 3 infected infect 1 healthy', () => {
      // set parameters so healthy guest infects itself while driving from station 1 -> 2
      BusrideOptions.distanceToNextStation = 3
      BusrideOptions.contactTime = 1 // takes one minute to become infected
      BusrideOptions.contactRadius = 2

      chai.expect(Metrics.newInfections).to.equal(0)
      const bus = new Bus()
      // place one healthy and one infected guest beside each other
      const healthyGuest = new Guest()
      healthyGuest.setHealthCondition(HealthCondition.HEALTHY)
      const infectedGuest1 = new Guest()
      infectedGuest1.setHealthCondition(HealthCondition.INFECTED)
      const infectedGuest2 = new Guest()
      infectedGuest2.setHealthCondition(HealthCondition.INFECTED)
      const infectedGuest3 = new Guest()
      infectedGuest3.setHealthCondition(HealthCondition.INFECTED)
      // guests are beside each other, see seat numbering in bus
      bus.seats[0].assignSeat(healthyGuest) // seat 1
      bus.seats[39].assignSeat(infectedGuest1) // seat 40
      bus.seats[35].assignSeat(infectedGuest2) // seat 36
      bus.seats[19].assignSeat(infectedGuest3) // seat 20

      spreadInfection(bus)
      chai.expect(Metrics.newInfections).to.equal(1)
    })
    it('newly infected guest should not spread in the same iteration ' +
       'when he became infected', () => {
      // set parameters so healthy guest infects itself while driving from station 1 -> 2
      BusrideOptions.distanceToNextStation = 3
      BusrideOptions.contactTime = 1 // takes one minute to become infect
      BusrideOptions.contactRadius = 2

      const bus = new Bus()
      // place one healthy and one infected guest beside each other
      const infectedGuest = new Guest()
      infectedGuest.setHealthCondition(HealthCondition.INFECTED)
      const healthyGuest1 = new Guest()
      healthyGuest1.setHealthCondition(HealthCondition.HEALTHY)
      const healthyGuest2 = new Guest()
      healthyGuest2.setHealthCondition(HealthCondition.HEALTHY)
      // these seats are in a row and the correct order
      bus.seats[0].assignSeat(infectedGuest) // seat 1
      bus.seats[19].assignSeat(healthyGuest1) // seat 20
      bus.seats[9].assignSeat(healthyGuest2) // seat 10

      spreadInfection(bus)

      // only guest at seat 20 should become infected, but should not continue spreading to seat 10
      chai.expect(healthyGuest1.healthCondition).to.equal(HealthCondition.INFECTED)
      chai.expect(healthyGuest2.healthCondition).to.equal(HealthCondition.HEALTHY)
      chai.expect(Metrics.newInfections).to.equal(1)
    })
    // it('should be possible to infect the bus driver', (done) => {
    //   done(new Error('implement test'))
    // })
  })

  /*************************/
  /* is radius overlapping */
  /*************************/
  describe('is radius overlapping', () => {
    it('should detect radius overlappings', () => {
      const bus = new Bus()
      // place two guests in the bus as far from each other as possible
      bus.seats[0].assignSeat(new Guest()) // seat number 1, position: bottom right corner
      bus.seats[19].assignSeat(new Guest()) // seat number 20, position: seat in front if seat 1
      const seatA = bus.seats[0]
      const seatB = bus.seats[19]
      // expect no overlapping
      chai.expect(isRadiusOverlapping(seatA, seatB)).to.be.true
    })
    it('should detect no overlapping', () => {
      const bus = new Bus()
      // place two guests in the bus as far from each other as possible
      bus.seats[0].assignSeat(new Guest()) // seat number 1, position: bottom right corner
      bus.seats[1].assignSeat(new Guest()) // seat number 2, position: top left corner
      const seatA = bus.seats[0]
      const seatB = bus.seats[1]
      // expect no overlapping
      chai.expect(isRadiusOverlapping(seatA, seatB)).to.be.false
    })
    it('big distance, big contact radius, with overlap', () => {
      BusrideOptions.contactRadius = 9
      const bus = new Bus()
      // two guests sitting far apart, but with contact radius 9
      // they overlap a little bit.
      bus.seats[1].assignSeat(new Guest()) // seat number 2
      bus.seats[2].assignSeat(new Guest()) // seat number 3
      const seatA = bus.seats[1]
      const seatB = bus.seats[2]
      // check if they overlap
      chai.expect(isRadiusOverlapping(seatA, seatB)).to.be.true
    })
    it('big distance, big contact radius, without overlap', () => {
      BusrideOptions.contactRadius = 8
      const bus = new Bus()
      // two guests sitting far apart, but with contact radius 9
      // they overlap a little bit.
      bus.seats[1].assignSeat(new Guest()) // seat number 2
      bus.seats[2].assignSeat(new Guest()) // seat number 3
      const seatA = bus.seats[1]
      const seatB = bus.seats[2]
      // check if they overlap
      chai.expect(isRadiusOverlapping(seatA, seatB)).to.be.false
    })
  })

  /***************/
  /* set metrics */
  /***************/
  describe('set metrics', () => {
    /***********************/
    /* metricsSetTimestamp */
    /***********************/
    it('should set timestamp', () => {
      const bus = new Bus()
      // initial value
      chai.expect(Metrics.timestamp).to.equal(0)

      BusrideOptions.distanceToNextStation = 3
      Metrics.timestamp = 2 // previous timestamp
      metricsSetTimestamp(bus)

      chai.expect(Metrics.timestamp).to.equal(5)
    })

    /****************************/
    /* metricsSetNumberOfGuests */
    /****************************/
    it('should set number of guests', () => {
      const bus = new Bus()
      // initial value
      chai.expect(Metrics.numberOfGuests).to.equal(0)
      // create one guest
      bus.seats[0].assignSeat(new Guest())
      // set metrics for current bus state
      metricsSetNumberOfGuests(bus)
      chai.expect(Metrics.numberOfGuests).to.equal(1)
      // create as many guests so the bus becomes full
      makeBusFull(bus)
      metricsSetNumberOfGuests(bus)
      chai.expect(Metrics.numberOfGuests).to.equal(bus.seats.length)
    })

    /***********************************/
    /* metricsSetNumberOfHealthyGuests */
    /***********************************/
    it('should set number of healthy guests', () => {
      const bus = new Bus()
      // initial value
      chai.expect(Metrics.healthy).to.equal(0)
      // set one healthy guest
      const healthyGuest = new Guest()
      healthyGuest.setHealthCondition(HealthCondition.HEALTHY)
      bus.seats[0].assignSeat(healthyGuest)
      metricsSetNumberOfHealthyGuests(bus)
      chai.expect(Metrics.healthy).to.equal(1)
      // set one infected guest. should still remain one
      const infectedGuest = new Guest()
      infectedGuest.setHealthCondition(HealthCondition.INFECTED)
      bus.seats[1].assignSeat(infectedGuest)
      metricsSetNumberOfHealthyGuests(bus)
      chai.expect(Metrics.healthy).to.equal(1)
      // full bus of healthy guests
      makeBusFullOfHealthyGuests(bus)
      metricsSetNumberOfHealthyGuests(bus)
      chai.expect(Metrics.healthy).to.equal(bus.seats.length)
    })

    /************************************/
    /* metricsSetNumberOfInfectedGuests */
    /************************************/
    describe('should set number of infected guests', () => {
      const bus = new Bus()
      // initial value
      chai.expect(Metrics.infected).to.equal(0)
      // set one infected guest
      const infectedGuest = new Guest()
      infectedGuest.setHealthCondition(HealthCondition.INFECTED)
      bus.seats[0].assignSeat(infectedGuest)
      metricsSetNumberOfInfectedGuests(bus)
      chai.expect(Metrics.infected).to.equal(1)
      // set one healthy guest. should still remain one
      const healthyGuest = new Guest()
      healthyGuest.setHealthCondition(HealthCondition.HEALTHY)
      bus.seats[1].assignSeat(healthyGuest)
      metricsSetNumberOfInfectedGuests(bus)
      chai.expect(Metrics.infected).to.equal(1)
      // full bus of healthy guests
      makeBusFullOfInfectedGuests(bus)
      metricsSetNumberOfInfectedGuests(bus)
      chai.expect(Metrics.infected).to.equal(bus.seats.length)
    })

    /***********************************/
    /* metricsAddIncomingInfectedGuests */
    /***********************************/
    it('should add to the number of incoming infected guests', () => {
      const expectedIncomingInfectedGuests = 2
      chai.expect(Metrics.numberIncomingInfectedGuests).to.equal(0)
      metricsAddIncomingInfectedGuests(expectedIncomingInfectedGuests)
      chai.expect(Metrics.numberIncomingInfectedGuests).to.equal(expectedIncomingInfectedGuests)
      metricsAddIncomingInfectedGuests(expectedIncomingInfectedGuests)
      chai.expect(Metrics.numberIncomingInfectedGuests).to.equal(expectedIncomingInfectedGuests * 2)
    })

    /***********************************/
    /* metricsAddIncomingHealthyGuests */
    /***********************************/
    it('should add to the number of incoming healthy guests', () => {
      const expectedIncomingHealthyGuests = 2
      chai.expect(Metrics.numberIncomingHealthyGuests).to.equal(0)
      metricsAddIncomingHealthyGuests(expectedIncomingHealthyGuests)
      chai.expect(Metrics.numberIncomingHealthyGuests).to.equal(expectedIncomingHealthyGuests)
      metricsAddIncomingHealthyGuests(expectedIncomingHealthyGuests)
      chai.expect(Metrics.numberIncomingHealthyGuests).to.equal(expectedIncomingHealthyGuests * 2)
    })

    /*****************************************/
    /* metricsAddOutgoingHealthyGuests */
    /*****************************************/
    it('should add to the number of outgoing healthy guests', () => {
      const expectedOutgoingHealthyGuests = 2
      chai.expect(Metrics.numberOutgoingHealthyGuests).to.equal(0)
      metricsAddOutgoingHealthyGuests(expectedOutgoingHealthyGuests)
      chai.expect(Metrics.numberOutgoingHealthyGuests).to.equal(expectedOutgoingHealthyGuests)
      metricsAddOutgoingHealthyGuests(expectedOutgoingHealthyGuests)
      chai.expect(Metrics.numberOutgoingHealthyGuests).to.equal(expectedOutgoingHealthyGuests * 2)
    })

    /******************************************/
    /* metricsAddOutgoingInfectedGuests */
    /******************************************/
    it('should add to the number of outgoing infected guests', () => {
      const expectedOutgoingInfectedGuests = 2
      chai.expect(Metrics.numberOutgoingInfectedGuests).to.equal(0)
      metricsAddOutgoingInfectedGuests(expectedOutgoingInfectedGuests)
      chai.expect(Metrics.numberOutgoingInfectedGuests).to.equal(expectedOutgoingInfectedGuests)
      metricsAddOutgoingInfectedGuests(expectedOutgoingInfectedGuests)
      chai.expect(Metrics.numberOutgoingInfectedGuests).to.equal(expectedOutgoingInfectedGuests * 2)
    })

    /***************************/
    /* metricsAddNewInfections */
    /***************************/
    it('should add to the number of new infections', () => {
      chai.expect(Metrics.newInfections).to.equal(0)
      metricsAddNewInfections(1)
      chai.expect(Metrics.newInfections).to.equal(1)
      metricsAddNewInfections(3)
      chai.expect(Metrics.newInfections).to.equal(4)
    })
  })

  /******************************/
  /* append metrics to csv file */
  /******************************/
  describe('append metrics to csv file', () => {
    it('first line of csv file should be column names', () => {
      const initialValue = 'timestamp,' +
        'numberOfGuests,' +
        'numberIncomingHealthyGuests,' +
        'numberIncomingInfectedGuests,' +
        'numberOutgoingHealthyGuests,' +
        'numberOutgoingInfectedGuests,' +
        'healthy,' +
        'infected,' +
        'newInfections\n'
      chai.expect(Csv.contents).to.equal(initialValue)
    })
  })
})
