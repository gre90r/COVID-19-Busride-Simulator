/************************************************************************************/
/* TODO: to fix ui-tests, you have to set the standard deviation to 0 for each test */
/************************************************************************************/

import chai from 'chai'
import 'babel-polyfill'
import { BusrideOptions } from '../../src/controller/BusrideOptions.js'
import { Key } from 'selenium-webdriver'
const { Builder, By } = require('selenium-webdriver')
const Chrome = require('selenium-webdriver/chrome')

const URL = 'http://localhost:1234'
const CLICKS_TO_NEXT_STATION = 7 // deprecated

/**
 * @type {WebDriver}
 */
let browser

async function asyncBlock () {
  before(async () => {
    browser = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(new Chrome.Options().headless())
      .build()

    await displayInfoIfApplicationIsNotOpen(browser)
  })
  after(async () => {
    await browser.quit()
  })

  describe('Ui', () => {
    /*************************/
    /* label current station */
    /*************************/
    describe('label current station', () => {
      it('should exist', async () => {
        await browser.get(URL)
        const currentStation = parseInt(
          await browser.findElement(By.id('currentStation')).getText())

        chai.expect(currentStation).to.equal(1)
      })
      it('should increase by one when driving to next station', async () => {
        await browser.get(URL)

        // set simulation progression mode to step through
        await setSimulationModeToStepThrough(browser)

        // click 7 times the next button to drive to next station
        const nextButton = await browser.findElement(By.id('nextButton'))
        for (let i = 0; i < CLICKS_TO_NEXT_STATION; i++) {
          await nextButton.click()
        }
        // read current station number
        const currentStation = parseInt(
          await browser.findElement(By.id('currentStation')).getText())

        chai.expect(currentStation).to.equal(2)
      })
      it('current station shall not be greater than total stations', async () => {
        await browser.get(URL)

        // set simulation progression mode to step through
        await setSimulationModeToStepThrough(browser)

        const totalStations = parseInt(await browser.findElement(By.id('totalStations')).getText())

        // drive to last station
        const nextButton = await browser.findElement(By.id('nextButton'))
        for (let k = 0; k < totalStations; k++) {
          for (let i = 0; i < CLICKS_TO_NEXT_STATION; i++) {
            await nextButton.click()
          }
        }
        // at last station try to drive further
        for (let i = 0; i < CLICKS_TO_NEXT_STATION; i++) {
          await nextButton.click()
        }
        // read current station number
        const currentStation = parseInt(
          await browser.findElement(By.id('currentStation')).getText())

        chai.expect(currentStation).to.equal(totalStations)
      })
    })

    /***********/
    /* metrics */
    /***********/
    describe('metrics', () => {
      /********************/
      /* incoming healthy */
      /********************/
      it('should count incoming healthy guests', async () => {
        // call url
        await browser.get(URL)

        // simulation parameters.
        // only healthy guests enter the bus
        await setInfectedGuestChanceTo0(browser)

        // set simulation progression mode to step through
        await setSimulationModeToStepThrough(browser)

        // initial IncomingHealthy counter should be 0
        let numIncomingHealthy = parseInt(
          await browser.findElement(By.id('incomingHealthy')).getText())
        chai.expect(numIncomingHealthy).to.equal(0)

        // press next to start simulation
        const nextButton = await browser.findElement(By.id('nextButton'))
        await nextButton.click()

        // there should stand three guests which should not yet be counted
        numIncomingHealthy = parseInt(
          await browser.findElement(By.id('incomingHealthy')).getText())
        chai.expect(numIncomingHealthy).to.equal(0)

        // press next to enter Busride State "Guests Enter The bus"
        await nextButton.click()
        // there should stand three guests at the bus station
        numIncomingHealthy = parseInt(await browser.findElement(By.id('incomingHealthy')).getText())
        chai.expect(numIncomingHealthy).to.equal(0)

        // pressing next leads to guests entering after each other until there are no guests
        // left at the bus station. the number of incoming healthy guests should not change
        for (let i = 0; i < BusrideOptions.guestsEnterPerStation; i++) {
          await nextButton.click()
          numIncomingHealthy = parseInt(
            await browser.findElement(By.id('incomingHealthy')).getText())
          chai.expect(numIncomingHealthy).to.equal(i + 1)
        }
        numIncomingHealthy = parseInt(
          await browser.findElement(By.id('incomingHealthy')).getText())
        chai.expect(numIncomingHealthy).to.equal(BusrideOptions.guestsEnterPerStation)

        // press next button: changes Busride State to "Drive to Next Station"
        await nextButton.click()
        // press next button: changes Busride State to "Guests Leave The Bus"
        await nextButton.click()
        // press next button: one guest leaves as defined with
        // BusrideOptions.guestsLeavePerStation = 1
        await nextButton.click()

        // press next button: changes Busride State to "Guests Wait At Station".
        // Now we again have three new guests which IncomingHealthy should not count yet.
        await nextButton.click()
        numIncomingHealthy = parseInt(
          await browser.findElement(By.id('incomingHealthy')).getText())
        chai.expect(numIncomingHealthy).to.equal(BusrideOptions.guestsEnterPerStation)
      })

      /*********************/
      /* incoming infected */
      /*********************/
      it('should count incoming infected guests', async () => {
        // call url
        await browser.get(URL)

        // simulation parameters
        await setInfectedGuestChanceTo100(browser)

        // set simulation progression mode to step through
        await setSimulationModeToStepThrough(browser)

        // initial IncomingInfected counter should be 0
        let numIncomingInfected = parseInt(
          await browser.findElement(By.id('incomingInfected')).getText())
        chai.expect(numIncomingInfected).to.equal(0)

        // press next to start simulation
        const nextButton = await browser.findElement(By.id('nextButton'))
        await nextButton.click()

        // there should stand three guests which should not yet be counted
        numIncomingInfected = parseInt(
          await browser.findElement(By.id('incomingInfected')).getText())
        chai.expect(numIncomingInfected).to.equal(0)

        // press next to enter Busride State "Guests Enter The bus"
        await nextButton.click()
        // not yet counted either
        numIncomingInfected = parseInt(
          await browser.findElement(By.id('incomingInfected')).getText())
        chai.expect(numIncomingInfected).to.equal(0)

        // pressing next leads to guests entering after each other until there are no guests
        // left at the bus station. the number of incoming healthy guests should not change
        for (let i = 0; i < BusrideOptions.guestsEnterPerStation; i++) {
          await nextButton.click()
          numIncomingInfected = parseInt(
            await browser.findElement(By.id('incomingInfected')).getText())
          chai.expect(numIncomingInfected).to.equal(i + 1)
        }
        numIncomingInfected = parseInt(
          await browser.findElement(By.id('incomingInfected')).getText())
        chai.expect(numIncomingInfected).to.equal(BusrideOptions.guestsEnterPerStation)

        // press next button: changes Busride State to "Drive to Next Station"
        await nextButton.click()
        // press next button: changes Busride State to "Guests Leave The Bus"
        await nextButton.click()
        // press next button: one guest leaves as defined with
        // BusrideOptions.guestsLeavePerStation = 1
        await nextButton.click()

        // press next button: changes Busride State to "Guests Wait At Station".
        // Now we have again three new guests which should not be counted yet.
        await nextButton.click()
        numIncomingInfected = parseInt(
          await browser.findElement(By.id('incomingInfected')).getText())
        chai.expect(numIncomingInfected).to.equal(BusrideOptions.guestsEnterPerStation)
      })

      /**************/
      /* drive time */
      /**************/
      it('should count drive time', async () => {
        // call url
        await browser.get(URL)

        // UI elements
        const btnNext = await browser.findElement(By.id('nextButton'))
        const spanDriveTime = await browser.findElement(By.id('driveTime'))

        // set simulation progression mode to step through
        await setSimulationModeToStepThrough(browser)

        // initial drive time should be 0
        let driveTime = parseInt(await spanDriveTime.getText())
        chai.expect(driveTime).to.equal(0)

        // press next to start simulation
        await btnNext.click()
        driveTime = parseInt(await spanDriveTime.getText())
        chai.expect(driveTime).to.equal(0)

        // press next to go to Busride State "Guests Enter The bus"
        await btnNext.click()

        // press three times next, so the three waiting guests enter the bus.
        // drive time should still be 0
        for (let i = 0; i < BusrideOptions.guestsEnterPerStation; i++) {
          await btnNext.click()
        }
        driveTime = parseInt(await spanDriveTime.getText())
        chai.expect(driveTime).to.equal(0)

        // press next to go to Busride State "Drive to Next Station"
        await btnNext.click()

        // press next to go to Busride State "Guests Leave The Bus".
        // at the next station the drive time increases
        await btnNext.click()
        driveTime = parseInt(await spanDriveTime.getText())
        chai.expect(driveTime).to.equal(BusrideOptions.distanceToNextStation)
      })

      /********************/
      /* outgoing healthy */
      /********************/
      it('should count outgoing healthy guests', async () => {
        // call url
        await browser.get(URL)

        // UI elements
        const btnNext = await browser.findElement(By.id('nextButton'))
        const spanOutgoingHealthy = await browser.findElement(By.id('outgoingHealthy'))
        chai.expect(await spanOutgoingHealthy.isDisplayed()).to.be.true
        const spanOutgoingInfected = await browser.findElement(By.id('outgoingInfected'))
        chai.expect(await spanOutgoingInfected.isDisplayed()).to.be.true

        // set simulation progression mode to step through
        await setSimulationModeToStepThrough(browser)
        // only healthy guests enter
        await setInfectedGuestChanceTo0(browser)

        // initial outgoing healthy count should be 0
        let numOutgoingHealthy = parseInt(await spanOutgoingHealthy.getText())
        chai.expect(numOutgoingHealthy).to.equal(0)

        // press next to start simulation
        await btnNext.click()
        // press next to go to Busride State "Guests Enter The bus"
        await btnNext.click()
        // press three times next button, so the three waiting guests enter the bus.
        for (let i = 0; i < BusrideOptions.guestsEnterPerStation; i++) {
          await btnNext.click()
        }
        // press next to go to Busride State "Drive to Next Station"
        await btnNext.click()
        // press next to go to Busride State "Guests Leave The Bus".
        await btnNext.click()

        // no guests left at this point, so outgoing healthy count should still be 0
        numOutgoingHealthy = parseInt(await spanOutgoingHealthy.getText())
        chai.expect(numOutgoingHealthy).to.equal(0)

        // press next so one healthy guest leaves the bus
        await btnNext.click()

        // expect 1 outgoing healthy and 0 outgoing infected
        numOutgoingHealthy = parseInt(await spanOutgoingHealthy.getText())
        chai.expect(numOutgoingHealthy).to.equal(1)
        let numOutgoingInfected = parseInt(await spanOutgoingInfected.getText())
        chai.expect(numOutgoingInfected).to.equal(0)

        // press next to change Busride State to "Guests Wait At Station"
        await btnNext.click()
        numOutgoingHealthy = parseInt(await spanOutgoingHealthy.getText())
        chai.expect(numOutgoingHealthy).to.equal(1)
        numOutgoingInfected = parseInt(await spanOutgoingInfected.getText())
        chai.expect(numOutgoingInfected).to.equal(0)
      })

      /*********************/
      /* outgoing infected */
      /*********************/
      it('should count outgoing infected guests', async () => {
        // call url
        await browser.get(URL)

        // UI elements
        const btnNext = await browser.findElement(By.id('nextButton'))
        const spanOutgoingHealthy = await browser.findElement(By.id('outgoingHealthy'))
        chai.expect(await spanOutgoingHealthy.isDisplayed()).to.be.true
        const spanOutgoingInfected = await browser.findElement(By.id('outgoingInfected'))
        chai.expect(await spanOutgoingInfected.isDisplayed()).to.be.true

        // set simulation progression mode to step through
        await setSimulationModeToStepThrough(browser)
        // only infected guests enter
        await setInfectedGuestChanceTo100(browser)

        // initial outgoing healthy count should be 0
        let numOutgoingInfected = parseInt(await spanOutgoingInfected.getText())
        chai.expect(numOutgoingInfected).to.equal(0)

        // press next to start simulation
        await btnNext.click()
        // press next to go to Busride State "Guests Enter The bus"
        await btnNext.click()
        // press three times next button, so the three waiting guests enter the bus.
        for (let i = 0; i < BusrideOptions.guestsEnterPerStation; i++) {
          await btnNext.click()
        }
        // press next to go to Busride State "Drive to Next Station"
        await btnNext.click()
        // press next to go to Busride State "Guests Leave The Bus".
        await btnNext.click()

        // no guests left at this point, so outgoing healthy count should still be 0
        numOutgoingInfected = parseInt(await spanOutgoingInfected.getText())
        chai.expect(numOutgoingInfected).to.equal(0)

        // press next so one healthy guest leaves the bus
        await btnNext.click()

        // expect 1 outgoing healthy and 0 outgoing infected
        numOutgoingInfected = parseInt(await spanOutgoingInfected.getText())
        chai.expect(numOutgoingInfected).to.equal(1)
        let numOutgoingHealthy = parseInt(await spanOutgoingHealthy.getText())
        chai.expect(numOutgoingHealthy).to.equal(0)

        // press next to change Busride State to "Guests Wait At Station"
        await btnNext.click()
        numOutgoingInfected = parseInt(await spanOutgoingInfected.getText())
        chai.expect(numOutgoingInfected).to.equal(1)
        numOutgoingHealthy = parseInt(await spanOutgoingHealthy.getText())
        chai.expect(numOutgoingHealthy).to.equal(0)
      })

      /******************/
      /* guests counter */
      /******************/
      it('should count all guests in the bus', async () => {
        // call url
        await browser.get(URL)

        // UI elements
        const btnNext = await browser.findElement(By.id('nextButton'))
        const spanNumGuests = await browser.findElement(By.id('numGuests'))
        chai.expect(await spanNumGuests.isDisplayed()).to.be.true

        // set simulation progression mode to step through
        await setSimulationModeToStepThrough(browser)

        // initial outgoing healthy count should be 0
        let numGuests = parseInt(await spanNumGuests.getText())
        chai.expect(numGuests).to.equal(0)

        // press next to start simulation
        await btnNext.click()
        // press next to go to Busride State "Guests Enter The bus"
        await btnNext.click()
        // press three times next button, so the three waiting guests enter the bus.
        for (let i = 0; i < BusrideOptions.guestsEnterPerStation; i++) {
          await btnNext.click()
          numGuests = parseInt(await spanNumGuests.getText())
          chai.expect(numGuests).to.equal(i + 1)
        }
        // press next to go to Busride State "Drive to Next Station"
        await btnNext.click()
        // press next to go to Busride State "Guests Leave The Bus".
        await btnNext.click()

        // press next so one healthy guest leaves the bus
        await btnNext.click()
        numGuests = parseInt(await spanNumGuests.getText())
        chai.expect(numGuests).to.equal(BusrideOptions.guestsEnterPerStation - 1)
      })
    })

    /*************/
    /* bug fixes */
    /*************/
    describe('bug fixes', () => {
      it('new infections not possible with "distance to next station" ' +
          'and "contact time" changed', async () => {
        await browser.get(URL) // call url
        await setInfectedGuestChanceTo0(browser)
        await setGuestsEnterPerStation(browser, 10)
        await setGuestsLeavePerStation(browser, 0)

        // set parameters which reproduce the bug
        await setDistanceToNextStation(browser, 1)
        await setContactTime(browser, 1)

        chai.expect(await getNewInfections(browser)).to.equal(0)

        // start busride
        // one click less, so I can set chance of infected guest before
        // new waiting guests at the bus station have been generated.
        await completeOneBusrideIteration(browser, -1)
        await setInfectedGuestChanceTo100(browser)
        // what has been clicked less has to be clicked more the next time
        await completeOneBusrideIteration(browser, 1)

        chai.expect(await getNewInfections(browser)).to.equal(10)
      })
    })
  })
}
asyncBlock().catch(console.error)

/**********************************************************************************************/
/* helper functions
/* TODO: extract to file UiTestHelper.js
/**********************************************************************************************/

/**
 * set slider 'guests enter per station' to value specified by
 * argument 'valueGuestsEnterPerStation'
 * @param {WebDriver} browser
 * @param {int} valueGuestsLeavePerStation
 * @returns {Promise<void>}
 */
async function setGuestsLeavePerStation (browser, valueGuestsLeavePerStation) {
  const guestsLeavePerStationSlider = await browser.findElement(
    By.id('guestsLeavePerStationSlider'))
  chai.expect(await guestsLeavePerStationSlider.isDisplayed()).to.be.true

  // set to minimum value first
  const MAX_VALUE_GUESTS_LEAVE_PER_STATION = 10
  await guestsLeavePerStationSlider.click() // select slider
  for (let i = 0; i < MAX_VALUE_GUESTS_LEAVE_PER_STATION; i++) {
    await guestsLeavePerStationSlider.sendKeys(Key.ARROW_LEFT)
  }

  // set to specified value
  // NOT -1 because minimum value is 0
  for (let i = 0; i < valueGuestsLeavePerStation; i++) {
    await guestsLeavePerStationSlider.sendKeys(Key.ARROW_RIGHT)
  }
}

/**
 * set slider 'guests enter per station' to value specified by
 * argument 'valueGuestsEnterPerStation'
 * @param {WebDriver} browser
 * @param {int} valueGuestsEnterPerStation
 * @returns {Promise<void>}
 */
async function setGuestsEnterPerStation (browser, valueGuestsEnterPerStation) {
  const guestsEnterPerStationSlider = await browser.findElement(
    By.id('guestsEnterPerStationSlider'))
  chai.expect(await guestsEnterPerStationSlider.isDisplayed()).to.be.true

  // set to minimum value first
  const MAX_VALUE_GUESTS_ENTER_PER_STATION = 10
  await guestsEnterPerStationSlider.click() // select slider
  for (let i = 0; i < MAX_VALUE_GUESTS_ENTER_PER_STATION; i++) {
    await guestsEnterPerStationSlider.sendKeys(Key.ARROW_LEFT)
  }

  // set to specified value
  // -1 because minimum value is 1, not 0
  for (let i = 0; i < (valueGuestsEnterPerStation - 1); i++) {
    await guestsEnterPerStationSlider.sendKeys(Key.ARROW_RIGHT)
  }
}

/**
 * get number of new infections from UI
 * @param {WebDriver} browser
 * @returns {Promise<number>}
 */
async function getNewInfections (browser) {
  const newInfectionsSpan = await browser.findElement(By.id('newInfections'))
  chai.expect(await newInfectionsSpan.isDisplayed()).to.be.true
  return parseInt(await newInfectionsSpan.getText())
}

/**
 * set slider to value specified in argument 'valueDistanceToNextStation'
 * @param {WebDriver} browser
 * @param {int} valueDistanceToNextStation
 * @returns {Promise<void>}
 */
async function setDistanceToNextStation (browser, valueDistanceToNextStation) {
  const distanceToNextStationSlider = await browser.findElement(
    By.id('distanceToNextStationSlider'))

  // set slider to minimum value first
  await distanceToNextStationSlider.click() // select slider
  const MAXIMUM_DISTANCE = 10
  for (let i = 0; i < MAXIMUM_DISTANCE; i++) {
    await distanceToNextStationSlider.sendKeys(Key.ARROW_LEFT)
  }

  // set slider to specified value
  // -1 because min values is 1 not 0
  for (let i = 0; i < (valueDistanceToNextStation - 1); i++) {
    await distanceToNextStationSlider.sendKeys(Key.ARROW_RIGHT)
  }
}

/**
 * set slider to value specified in argument 'valueContactTime'
 * @param {WebDriver} browser
 * @param {int} valueContactTime
 * @returns {Promise<void>}
 */
async function setContactTime (browser, valueContactTime) {
  const contactTimeSlider = await browser.findElement(
    By.id('contactTimeSlider'))

  // set slider to minimum value first
  await contactTimeSlider.click() // select slider
  const MAXIMUM_CONTACT_TIME = 60
  for (let i = 0; i < MAXIMUM_CONTACT_TIME; i++) {
    await contactTimeSlider.sendKeys(Key.ARROW_LEFT)
  }

  // set slider to specified value
  // -1 because min value is 1 not 0
  for (let i = 0; i < (valueContactTime - 1); i++) {
    await contactTimeSlider.sendKeys(Key.ARROW_RIGHT)
  }
}

/**
 * try to access element in browser
 * @param {WebDriver} browser
 */
async function displayInfoIfApplicationIsNotOpen (browser) {
  try {
    await browser.get(URL)
    // this throws if applications is not open
    await browser.findElement(By.id('nextButton'))
  } catch (err) {
    console.info('    #################################################################')
    console.info('    # run "npm run dev" in a separate console to start application. #')
    console.info('    # Then restart this test.                                       #')
    console.info('    #################################################################')
    console.info()
  }
}

/**
 * set slider "Chance of Infected Guest" to 0%
 * @param {WebDriver} browser
 * @returns {Promise<void>}
 */
async function setInfectedGuestChanceTo0 (browser) {
  // get slider
  const slider = await browser.findElement(
    By.id('chanceOfInfectedGuestSlider'))
  chai.expect(await slider.isEnabled()).to.be.true
  const sliderValue = await browser.findElement(By.id('chanceOfInfectedGuestValue'))
  chai.expect(await sliderValue.isEnabled()).to.be.true

  // move to beginning, 0%
  await slider.click()
  // slider goes from 0 to 100%, with clicking left arrow 101 times,
  // slider should be at 0%
  for (let i = 0; i < 101; i++) {
    await slider.sendKeys(Key.ARROW_LEFT)
  }
  const chanceOfInfectedGuest = await sliderValue.getText()
  chai.expect(chanceOfInfectedGuest).to.equal('0%')
}

/**
 * set slider "Chance of Infected Guest" to 100%
 * @param {WebDriver} browser
 * @returns {Promise<void>}
 */
async function setInfectedGuestChanceTo100 (browser) {
  // get slider
  const slider = await browser.findElement(
    By.id('chanceOfInfectedGuestSlider'))
  chai.expect(await slider.isEnabled()).to.be.true
  const sliderValue = await browser.findElement(By.id('chanceOfInfectedGuestValue'))
  chai.expect(await sliderValue.isEnabled()).to.be.true

  // move to beginning, 0%
  await slider.click()
  // slider goes from 0 to 100%, with clicking left arrow 101 times,
  // slider should be at 0%
  for (let i = 0; i < 101; i++) {
    await slider.sendKeys(Key.ARROW_RIGHT)
  }
  const chanceOfInfectedGuest = await sliderValue.getText()
  chai.expect(chanceOfInfectedGuest).to.equal('100%')
}

/**
 * set Automatic Simulation Progression to "step through"
 * @param {WebDriver} browser
 * @returns {Promise<void>}
 */
async function setSimulationModeToStepThrough (browser) {
  const rbStepThrough = await browser.findElement(By.id('rbStepThrough'))
  await rbStepThrough.click()
}

/**
 * get the slider value of "Guests Enter Per Station"
 * @param  {WebDriver} browser
 * @returns {Promise<number>}
 */
async function getGuestsEnterPerStation (browser) {
  const sliderValue = await browser.findElement(By.id('guestsEnterPerStationValue'))
  chai.expect(await sliderValue.isDisplayed()).to.be.true
  return parseInt(await sliderValue.getText())
}

/**
 * get the slider value of "Guests Leave Per Station"
 * @param  {WebDriver} browser
 * @returns {Promise<number>}
 */
async function getGuestsLeavePerStation (browser) {
  const sliderValue = await browser.findElement(By.id('guestsLeavePerStationValue'))
  chai.expect(await sliderValue.isDisplayed()).to.be.true
  return parseInt(await sliderValue.getText())
}

/**
 * get the slider value of "Guests Leave Per Station"
 * @param  {WebDriver} browser
 * @returns {Promise<boolean>}
 */
async function getHasApplicationStarted (browser) {
  const nextButton = await browser.findElement(By.id('nextButton'))
  chai.expect(await nextButton.isDisplayed()).to.be.true
  if (await nextButton.getText() === 'Start') {
    return false
  }
  return true
}

/**
 * get current station from UI
 * @param {WebDriver}browser
 * @returns {Promise<number>}
 */
async function getCurrentStation (browser) {
  const currentStationSpan = await browser.findElement(By.id('currentStation'))
  chai.expect(await currentStationSpan.isDisplayed()).to.be.true
  return parseInt(await currentStationSpan.getText())
}

/**
 * presses the next button that often, so the application
 * drives to the next bus station and is again at the same position.
 * After the function invocation only current station should be
 * increased by one.
 *
 *    how many times do I have to press next:
 *    ---------------------------------------
 *    (1x : start application)
 *    1x : change BusrideState Guests Wait At Station -> Guests Enter The Bus
 *    nx : n guests enter the bus
 *    1x : change BusrideState Guests Enter The Bus -> Drive To Next Station
 *    1x : change BusrideState Drive To Next Station -> Guests Leave The Bus
 *    nx : n guests leave the bus
 *    1x : change BusrideState Guests Leave The Bus -> Guests Wait At Station
 *
 *    one iteration = nGuestsEnter + nGuestsLeave + 4 (+ 1)
 *
 * @param {WebDriver} browser where the applicaton is running in
 * @param {int} clickOffset negative or positive number the iteration should do
 *                          more or less clicks
 * @returns {Promise<void>}
 */
async function completeOneBusrideIteration (browser, clickOffset = 0) {
  // get current station value for validation purposes
  const currentStationBeforeClicks = await getCurrentStation(browser)

  await setSimulationModeToStepThrough(browser)

  /**********************/
  // get necessary values
  /**********************/
  const numGuestsEnterPerStation = await getGuestsEnterPerStation(browser)
  const numGuestsLeavePerStation = await getGuestsLeavePerStation(browser)
  // add one extra click if application has not started yet
  let applicationStartClick // 0 = no click. 1 = one click
  if (await getHasApplicationStarted(browser)) {
    applicationStartClick = 0
  } else {
    applicationStartClick = 1
  }
  // see definition of formula above in doc string
  const clicks =
    numGuestsEnterPerStation +
    numGuestsLeavePerStation +
    applicationStartClick +
    4 +
    clickOffset

  /****************/
  // perform clicks
  /****************/
  const nextButton = await browser.findElement(By.id('nextButton'))
  for (let i = 0; i < clicks; i++) {
    await nextButton.click()
  }

  // validate
  const currentStationAfterClicks = await getCurrentStation(browser)
  chai.expect(currentStationAfterClicks).to.equal(currentStationBeforeClicks + 1)
}
