import chai from 'chai'

import { BusStation } from '../src/model/BusStation.js'
import { HealthCondition } from '../src/model/Person.js'
import { Guest } from '../src/model/Guest.js'

describe('Bus Station', () => {
  describe('Bus Station components', () => {
    it('should have 10 positions for guests to enter', () => {
      const busStation = new BusStation()
      chai.expect(busStation.guestEnterPositions.length).to.equal(10)
    })
    it('should have 10 positions for guests to leave', () => {
      const busStation = new BusStation()
      chai.expect(busStation.guestLeavePositions.length).to.equal(10)
    })
  })

  /************************************************/
  /* get number of healthy guests at the entrance */
  /************************************************/
  describe('get number of healthy guests at the entrance', () => {
    it('should count healthy guests', () => {
      const busStation = new BusStation()
      chai.expect(busStation.getNumberOfHealthyGuestsAtEntrance()).to.equal(0)

      // create 3 healthy guests at bus entrance
      const numHealthyGuests = 3
      let healthyGuest
      for (let i = 0; i < numHealthyGuests; i++) {
        healthyGuest = new Guest()
        healthyGuest.setHealthCondition(HealthCondition.HEALTHY)
        busStation.guestsWaitingAtTheStation.push(healthyGuest)
      }

      chai.expect(busStation.getNumberOfHealthyGuestsAtEntrance()).to.equal(numHealthyGuests)
    })
    it('should ignore infected guests', () => {
      const busStation = new BusStation()
      chai.expect(busStation.getNumberOfHealthyGuestsAtEntrance()).to.equal(0)

      // create 3 infected guests at bus entrance
      const numInfectedGuests = 3
      let healthyGuest
      for (let i = 0; i < numInfectedGuests; i++) {
        healthyGuest = new Guest()
        healthyGuest.setHealthCondition(HealthCondition.INFECTED)
        busStation.guestsWaitingAtTheStation.push(healthyGuest)
      }

      chai.expect(busStation.getNumberOfHealthyGuestsAtEntrance()).to.equal(0)
    })
  })

  /************************************************/
  /* get number of infected guests at the entrance */
  /************************************************/
  describe('get number of infected guests at the entrance', () => {
    it('should count healthy guests', () => {
      const busStation = new BusStation()
      chai.expect(busStation.getNumberOfInfectedGuestsAtEntrance()).to.equal(0)

      // create 3 infected guests at bus entrance
      const numInfectedGuests = 3
      let infectedGuest
      for (let i = 0; i < numInfectedGuests; i++) {
        infectedGuest = new Guest()
        infectedGuest.setHealthCondition(HealthCondition.INFECTED)
        busStation.guestsWaitingAtTheStation.push(infectedGuest)
      }

      chai.expect(busStation.getNumberOfInfectedGuestsAtEntrance()).to.equal(numInfectedGuests)
    })
    it('should ignore healthy guests', () => {
      const busStation = new BusStation()
      chai.expect(busStation.getNumberOfInfectedGuestsAtEntrance()).to.equal(0)

      // create 3 healthy guests at bus entrance
      const numHealthyGuests = 3
      let healthyGuest
      for (let i = 0; i < numHealthyGuests; i++) {
        healthyGuest = new Guest()
        healthyGuest.setHealthCondition(HealthCondition.HEALTHY)
        busStation.guestsWaitingAtTheStation.push(healthyGuest)
      }

      chai.expect(busStation.getNumberOfInfectedGuestsAtEntrance()).to.equal(0)
    })
  })

  /****************************************************/
  /* get number of healthy guests at the leaving area */
  /****************************************************/
  describe('get number of healthy guests at the leaving area', () => {
    it('should count healthy guests', () => {
      const busStation = new BusStation()
      chai.expect(busStation.getNumberOfHealthyGuestsAtLeavingArea()).to.equal(0)

      // create 3 healthy guests at bus entrance
      const numHealthyGuests = 3
      let healthyGuest
      for (let i = 0; i < numHealthyGuests; i++) {
        healthyGuest = new Guest()
        healthyGuest.setHealthCondition(HealthCondition.HEALTHY)
        busStation.guestsInLeavingArea.push(healthyGuest)
      }

      chai.expect(busStation.getNumberOfHealthyGuestsAtLeavingArea()).to.equal(numHealthyGuests)
    })
    it('should ignore infected guests', () => {
      const busStation = new BusStation()
      chai.expect(busStation.getNumberOfHealthyGuestsAtLeavingArea()).to.equal(0)

      // create 3 infected guests at bus entrance
      const numInfectedGuests = 3
      let healthyGuest
      for (let i = 0; i < numInfectedGuests; i++) {
        healthyGuest = new Guest()
        healthyGuest.setHealthCondition(HealthCondition.INFECTED)
        busStation.guestsInLeavingArea.push(healthyGuest)
      }

      chai.expect(busStation.getNumberOfHealthyGuestsAtLeavingArea()).to.equal(0)
    })
  })

  /*****************************************************/
  /* get number of infected guests at the leaving area */
  /*****************************************************/
  describe('get number of infected guests at the leaving area', () => {
    it('should count healthy guests', () => {
      const busStation = new BusStation()
      chai.expect(busStation.getNumberOfInfectedGuestsAtLeavingArea()).to.equal(0)

      // create 3 infected guests at bus entrance
      const numInfectedGuests = 3
      let infectedGuest
      for (let i = 0; i < numInfectedGuests; i++) {
        infectedGuest = new Guest()
        infectedGuest.setHealthCondition(HealthCondition.INFECTED)
        busStation.guestsInLeavingArea.push(infectedGuest)
      }

      chai.expect(busStation.getNumberOfInfectedGuestsAtLeavingArea()).to.equal(numInfectedGuests)
    })
    it('should ignore healthy guests', () => {
      const busStation = new BusStation()
      chai.expect(busStation.getNumberOfInfectedGuestsAtLeavingArea()).to.equal(0)

      // create 3 healthy guests at bus entrance
      const numHealthyGuests = 3
      let healthyGuest
      for (let i = 0; i < numHealthyGuests; i++) {
        healthyGuest = new Guest()
        healthyGuest.setHealthCondition(HealthCondition.HEALTHY)
        busStation.guestsInLeavingArea.push(healthyGuest)
      }

      chai.expect(busStation.getNumberOfInfectedGuestsAtLeavingArea()).to.equal(0)
    })
  })
})
