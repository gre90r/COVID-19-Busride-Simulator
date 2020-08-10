import chai from 'chai'

import { Bus } from '../src/model/Bus.js'
import { Guest } from '../src/model/Guest.js'
import { HealthCondition } from '../src/model/Person.js'

describe('Bus', () => {
  /***************/
  /* constructor */
  /***************/
  describe('create Bus', () => {
    it('should be created', () => {
      const bus = new Bus()
      chai.expect(bus.seats.length).to.equal(40)
      chai.expect(bus.currentStation).to.equal(1)
    })
  })

  /******************************/
  /* how many guests in the bus */
  /******************************/
  describe('howManyGuestsInTheBus', () => {
    it('should count guests in the bus', () => {
      const bus = new Bus()
      chai.expect(bus.howManyGuestsInTheBus()).to.equal(0)

      // create one person in the bus
      bus.seats[0].assignSeat(new Guest())

      chai.expect(bus.howManyGuestsInTheBus()).to.equal(1)
    })
  })

  /******************/
  /* next free seat */
  /******************/
  describe('nextFreeSeat', () => {
    it('should give the next free seat with the lowest seat number', () => {
      const bus = new Bus()
      chai.expect(bus.nextFreeSeat().number).to.equal(1)

      // assign seat 5 (which is seats[4]) to guest. seat 1 should still be
      // the next free seat
      bus.seats[4].assignSeat(new Guest())
      chai.expect(bus.nextFreeSeat().number).to.equal(1)

      // assign seat number 1. seat 2 is the next free seat
      bus.seats[0].assignSeat(new Guest())
      chai.expect(bus.nextFreeSeat().number).to.equal(2)
    })

    it('should return no seat if all seats are taken', () => {
      const bus = new Bus()

      // assign every seat to a guest
      bus.seats.forEach(seat => {
        seat.assignSeat(new Guest())
      })

      chai.expect(bus.nextFreeSeat()).to.be.null
    })
  })

  /***********/
  /* is full */
  /***********/
  describe('isFull', () => {
    it('the bus should be able to become full', () => {
      const bus = new Bus()

      // make bus full
      bus.seats.forEach(seat => {
        seat.assignSeat(new Guest())
      })

      chai.expect(bus.isFull()).to.be.true
    })

    it('empty bus should not be full', () => {
      const bus = new Bus()
      chai.expect(bus.isFull()).to.be.false
    })

    it('should not be full if only one seat is not taken', () => {
      const bus = new Bus()

      // make bus full
      bus.seats.forEach(seat => {
        seat.assignSeat(new Guest())
      })

      // take one guest out
      bus.seats[0].makeFree()

      chai.expect(bus.isFull()).to.be.false
    })
  })

  /********************************/
  /* get number of healthy guests */
  /********************************/
  describe ('get number of healthy guests', () => {
    it('should detect a healthy guest', () => {
      const bus = new Bus()
      chai.expect(bus.getNumberOfHealthyGuests()).to.equal(0)

      const healthyGuest = new Guest()
      healthyGuest.setHealthCondition(HealthCondition.HEALTHY)
      bus.seats[0].assignSeat(healthyGuest)

      chai.expect(bus.getNumberOfHealthyGuests()).to.equal(1)
    })
    it('should detect a full bus full of healthy guests', () => {
      const bus = new Bus()
      chai.expect(bus.getNumberOfHealthyGuests()).to.equal(0)

      // make bus full of healthy guests
      let healthyGuest
      bus.seats.forEach(seat => {
        healthyGuest = new Guest()
        healthyGuest.setHealthCondition(HealthCondition.HEALTHY)
        seat.assignSeat(healthyGuest)
      })

      chai.expect(bus.getNumberOfHealthyGuests()).to.equal(bus.seats.length)
    })
  })

  /*********************************/
  /* get number of infected guests */
  /*********************************/
  describe ('get number of infected guests', () => {
    it('should detect an infected guest', () => {
      const bus = new Bus()
      chai.expect(bus.getNumberOfInfectedGuests()).to.equal(0)

      const infectedGuest = new Guest()
      infectedGuest.setHealthCondition(HealthCondition.INFECTED)
      bus.seats[0].assignSeat(infectedGuest)

      chai.expect(bus.getNumberOfInfectedGuests()).to.equal(1)
    })
    it('should detect a full bus full of infected guests', () => {
      const bus = new Bus()
      chai.expect(bus.getNumberOfInfectedGuests()).to.equal(0)

      // make bus full of healthy guests
      let infectedGuest
      bus.seats.forEach(seat => {
        infectedGuest = new Guest()
        infectedGuest.setHealthCondition(HealthCondition.INFECTED)
        seat.assignSeat(infectedGuest)
      })

      chai.expect(bus.getNumberOfInfectedGuests()).to.equal(bus.seats.length)
    })
  })

  /**********************/
  /* get infected seats */
  /**********************/
  describe('get infected seats', () => {
    it('should return the seats of all infected guests', () => {
      const bus = new Bus()
      // create two infected guests
      const infectedGuest1 = new Guest()
      infectedGuest1.setHealthCondition(HealthCondition.INFECTED)
      const infectedGuest2 = new Guest()
      infectedGuest2.setHealthCondition(HealthCondition.INFECTED)
      // place them on seats in the bus
      bus.seats[0].assignSeat(infectedGuest1) // seat 1
      bus.seats[1].assignSeat(infectedGuest2) // seat 2

      /**
       * @type {Seat[]}
       */
      const infectedSeats = []
      bus.getInfectedSeats(infectedSeats)
      chai.expect(infectedSeats.length).to.equal(2)
    })
  })
})
