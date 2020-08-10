import chai from 'chai'

import { BusDriver } from '../src/model/BusDriver.js'
import { HealthCondition } from '../src/model/Person.js';
import { BusrideOptions } from '../src/controller/BusrideOptions.js';

describe('Bus Driver', () => {
  describe('create BusDriver', () => {
    it('should create a bus driver who can be infected', () => {
      const busDriver = new BusDriver()
      chai.expect(busDriver.contactTime).to.equal(0)
      chai.expect(busDriver.healthCondition).to.equal(HealthCondition.HEALTHY)
    })
    it('should create a bus driver who sits on the driver seat', () => {
      chai.expect(BusDriver.posX()).to.equal(120)
      chai.expect(BusDriver.posY()).to.equal(255)
    })
  })
})
