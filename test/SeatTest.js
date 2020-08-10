import chai from 'chai'

import { Seat } from '../src/model/Seat.js'
import { Guest } from '../src/model/Guest.js'
import { HealthCondition } from '../src/model/Person.js'
import { BusrideOptions } from '../src/controller/BusrideOptions.js'

describe('Seat', () => {
  /***************/
  /* constructor */
  /***************/
  describe('create Seat', () => {
    it('should create seat', () => {
      const seat = new Seat(7, 2, 3 )
      chai.expect(seat.number).to.equal(7)
      chai.expect(seat.posX).to.equal(2)
      chai.expect(seat.posY).to.equal(3)
    })
  })

  /**************/
  /* assignSeat */
  /**************/
  describe('assign Seat', () => {
    it('should be assigned to a guest', () => {
      const seat = new Seat(1, 0, 0 )
      const guest = new Guest()
      guest.setHealthCondition(HealthCondition.HEALTHY)
      seat.assignSeat(guest)
      chai.expect(seat.isFree).to.be.false
      chai.expect(seat.guest).to.be.not.null
      chai.expect(seat.guest.contactTime).to.equal(0)
      chai.expect(seat.guest.healthCondition).to.equal(HealthCondition.HEALTHY)
    })
  })

  /**********/
  /* isFree */
  /**********/
  describe('Seat is free', () => {
    it('should be free', () => {
      const seat = new Seat(0, 0, 0)
      chai.expect(seat.isFree).to.be.true
    })
    it('should be not free', () => {
      const seat = new Seat(0, 0, 0)
      const guest = new Guest()
      guest.setHealthCondition(HealthCondition.HEALTHY)
      seat.assignSeat(guest)
      chai.expect(seat.isFree).to.be.false
    })
  })

  /************/
  /* makeFree */
  /************/
  describe('Seat make free', () => {
    it('should make the seat free when the guest leaves', () => {
      const seat = new Seat(0, 0, 0)
      const guest = new Guest()
      guest.setHealthCondition(HealthCondition.HEALTHY)
      seat.assignSeat(guest)
      seat.makeFree()
      chai.expect(seat.guest).to.be.null
      chai.expect(seat.isFree).to.be.true
    })
    it('should make the seat free even if no one sits on it', () => {
      const seat = new Seat(0, 0, 0)
      seat.makeFree()
      chai.expect(seat.guest).to.be.null
      chai.expect(seat.isFree).to.be.true
    })
  })
})
