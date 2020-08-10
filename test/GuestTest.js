import chai from 'chai'
import { Guest } from '../src/model/Guest.js'
import { HealthCondition } from '../src/model/Person.js'
import { BusrideOptions } from '../src/controller/BusrideOptions.js'

describe('Guest', () => {
  /***************/
  /* constructor */
  /***************/
  describe('create Guest', () => {
    it('should be created', () => {
      const guest = new Guest()
      guest.setHealthCondition(HealthCondition.HEALTHY)
      chai.expect(guest.healthCondition).to.equal(HealthCondition.HEALTHY)
      chai.expect(guest.id).to.be.not.null
      chai.expect(guest.contactTime).to.equal(0)
    })
  })
})
