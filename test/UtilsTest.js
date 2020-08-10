import chai from 'chai'

import { Utils } from '../src/util/Utils.js'

describe('Utils', () => {
  /*********************************/
  /* random number between one and */
  /*********************************/
  describe('random number between one and', () => {
    it('should come to upper bound', () => {
      const upperBound = 2
      let cameToUpperBound = false
      // give 100-times chance to go to upper bound
      for (let i = 0; i < 100; i++) {
        if (Utils.randomNumberBetweenOneAnd(upperBound) === upperBound) {
          cameToUpperBound = true
        }
      }
      chai.expect(cameToUpperBound).to.be.true
    })
    it('should come to lower bound', () => {
      const upperBound = 2
      const lowerBound = 1
      let cameToUpperBound = false
      // give 100-times chance to go to upper bound
      for (let i = 0; i < 100; i++) {
        if (Utils.randomNumberBetweenOneAnd(upperBound) === lowerBound) {
          cameToUpperBound = true
        }
      }
      chai.expect(cameToUpperBound).to.be.true
    })
    it('should not go out of bounds', () => {
      const upperBound = 2
      const lowerBound = 1
      let cameOutOfBounds = false
      let randomNumber
      // give 100-times chance to go to upper bound
      for (let i = 0; i < 100; i++) {
        randomNumber = Utils.randomNumberBetweenOneAnd(upperBound)
        if ((randomNumber < lowerBound) || (randomNumber > upperBound)) {
          cameOutOfBounds = true
        }
      }
      chai.expect(cameOutOfBounds).to.be.false
    })
  })

  /*******************************/
  /* distance between two points */
  /*******************************/
  describe('distance between two points', () => {
    it('two points on the x-axis', () => {
      const x1 = 375
      const x2 = 335
      const y1 = 0
      const y2 = 0
      chai.expect(Utils.distanceBetweenTwoPoints(x1, y1, x2, y2)).to.equal(40)
    })
    it('two points in reversed order', () => {
      const x1 = 335
      const x2 = 375
      const y1 = 0
      const y2 = 0
      chai.expect(Utils.distanceBetweenTwoPoints(x1, y1, x2, y2)).to.equal(40)
    })
    it('two points on the y-axis', () => {
      const x1 = 0
      const x2 = 0
      const y1 = 375
      const y2 = 335
      chai.expect(Utils.distanceBetweenTwoPoints(x1, y1, x2, y2)).to.equal(40)
    })
    it('none of them are on an axis', () => {
      // see https://www.mathsisfun.com/algebra/distance-2-points.html , Example 1
      const x1 = 3
      const x2 = 9
      const y1 = 2
      const y2 = 7
      chai.expect(Utils.distanceBetweenTwoPoints(x1, y1, x2, y2)).to.be.closeTo(7.81, 0.001)
    })
  })

  /*********/
  /* sleep */
  /*********/
  describe('sleep', () => {
    it('should sleep for given amount of milliseconds', () => {
      const sleepAmount = 10 // in milliseconds
      const startTime = Date.now()
      Utils.sleep(sleepAmount)
      const elapsedTime = Date.now() - startTime
      chai.expect(elapsedTime).to.be.closeTo(sleepAmount, 2) // +/- 1 milliseconds
    })
  })

  /***************/
  /* sleep async */
  /***************/
  describe('sleep async', () => {
    it('should sleep without blocking the application', async () => {
      const sleepAmount = 10 // in milliseconds
      const startTime = Date.now()
      const promise = await Utils.sleepAsync(sleepAmount)
      const elapsedTime = Date.now() - startTime
      chai.expect(elapsedTime).to.be.closeTo(sleepAmount, 5) // +/- 5 milliseconds
      return promise
    })
  })

  /*****************************/
  /* get current date and time */
  /*****************************/
  describe('get current date and time', () => {
    it('should create the time in the format YYYYMMDDhhmmss -> e.g. 20200610184153', () => {
      const TIME_FORMAT_LENGTH = '20200610184153'.length
      const currentDate = new Date()
      chai.expect(Utils.getCurrentDateAndTime(currentDate).length).to.equal(TIME_FORMAT_LENGTH)
    })
    it('should return the correct date and time', () => {
      const currentDate = new Date('June 10, 2020 18:41:53')
      const expectedDateTime = '20200610184153'
      chai.expect(Utils.getCurrentDateAndTime(currentDate)).to.equal(expectedDateTime)
    })
    it('should add 0 to keep the format YYYYMMDDhhmmss', () => {
      const currentDate = new Date('September 09, 2009 09:09:09')
      const expectedDateTime = '20090909090909'
      chai.expect(Utils.getCurrentDateAndTime(currentDate)).to.equal(expectedDateTime)
    })
    it('should not add 0 from month/day/... 10 to keep the format YYYYMMDDhhmmss', () => {
      const currentDate = new Date('October 10, 2010 10:10:10')
      const expectedDateTime = '20101010101010'
      chai.expect(Utils.getCurrentDateAndTime(currentDate)).to.equal(expectedDateTime)
    })
    it('should return empty string on invalid date', () => {
      const currentDate = new Date('asdf')
      chai.expect(Utils.getCurrentDateAndTime(currentDate)).to.equal('')
    })
    it('should return empty string on null input', () => {
      const currentDate = null
      chai.expect(Utils.getCurrentDateAndTime(currentDate)).to.equal('')
    })
  })

  /*******************/
  /* random gaussian */
  /*******************/
  describe('random gaussian', () => {
    it('should return a value between 0 and 1', () => {
      for (let i = 0; i < 100; i++) {
        chai.expect(Utils.randomGaussian()).to.be.within(0, 1)
      }
    })
  })

  /*************************/
  /* gaussian distribution */
  /*************************/
  describe('gaussian distribution', () => {
    it('should equal to mean if standard deviation is 0', () => {
      const mean = 3
      const standardDeviation = 0 // with 0 deviation it should be exactly at mean
      chai.expect(Utils.randomNumberFromGaussianDistribution(mean, standardDeviation))
        .to.equal(mean)
    })
    it('with standard deviation greater 0 it should be in range of', () => {
      const mean = 5
      const standardDeviation = 3
      chai.expect(Utils.randomNumberFromGaussianDistribution(mean, standardDeviation))
        .to.be.closeTo(mean, 1)
    })
  })
})
