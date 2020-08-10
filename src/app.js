import {
  CANVAS_SIZE,
  DESKTOP_CANVAS_SIZE
} from './controller/options.js'

import './controller/results.js' // colors healthy and infected count

import { Busride } from './controller/Busride.js'

import {
  buttonNext,
  chanceOfInfectedGuestSlider,
  chanceOfInfectedGuestValue,
  contactRadiusSlider,
  contactRadiusValue,
  contactTimeSlider,
  contactTimeValue,
  distanceToNextStationDeviationSlider,
  distanceToNextStationDeviationValue,
  distanceToNextStationSlider,
  distanceToNextStationValue,
  guestsEnterPerStationDeviationSlider,
  guestsEnterPerStationDeviationValue,
  guestsEnterPerStationSlider,
  guestsEnterPerStationValue,
  guestsLeavePerStationDeviationSlider,
  guestsLeavePerStationDeviationValue,
  guestsLeavePerStationSlider,
  guestsLeavePerStationValue,
  rbAutomated,
  simulationSpeedSlider, simulationSpeedValue,
  stationsSlider,
  stationsValue,
  totalStationsLabel
} from './controller/dom.js'

import { BusrideOptions } from './controller/BusrideOptions.js'
import { Utils } from './util/Utils.js'
import { SimulationOptions } from './controller/SimulationOptions.js'

const matchMedia = window.matchMedia('(min-width: 800px)')
let isDesktop = matchMedia.matches
let busride = null

export const canvas = new window.p5(sketch => { // eslint-disable-line

  const createCanvas = () => {
    const { height, width } = isDesktop
      ? DESKTOP_CANVAS_SIZE
      : CANVAS_SIZE

    sketch.createCanvas(width, height)
  }

  sketch.setup = () => {
    createCanvas()

    matchMedia.addListener(e => {
      isDesktop = e.matches
      createCanvas()
    })

    /********************/
    /* slider listeners */
    /********************/
    guestsEnterPerStationSlider.oninput = () => {
      BusrideOptions.guestsEnterPerStation = parseInt(guestsEnterPerStationSlider.value)
      BusrideOptions.guestsEnterPerStationSliderValue = parseInt(guestsEnterPerStationSlider.value)
      guestsEnterPerStationValue.textContent = String(BusrideOptions.guestsEnterPerStation)
    }
    guestsEnterPerStationDeviationSlider.oninput = () => {
      BusrideOptions.guestsEnterPerStationDeviation = parseInt(
        guestsEnterPerStationDeviationSlider.value)
      guestsEnterPerStationDeviationValue.textContent = String(
        BusrideOptions.guestsEnterPerStationDeviation)
    }
    guestsLeavePerStationSlider.oninput = () => {
      BusrideOptions.guestsLeavePerStation = parseInt(guestsLeavePerStationSlider.value)
      BusrideOptions.guestsLeavePerStationSliderValue = parseInt(guestsLeavePerStationSlider.value)
      guestsLeavePerStationValue.textContent = String(BusrideOptions.guestsLeavePerStation)
    }
    guestsLeavePerStationDeviationSlider.oninput = () => {
      BusrideOptions.guestsLeavePerStationDeviation = parseInt(
        guestsLeavePerStationDeviationSlider.value)
      guestsLeavePerStationDeviationValue.textContent = String(
        BusrideOptions.guestsLeavePerStationDeviation)
    }
    chanceOfInfectedGuestSlider.oninput = () => {
      BusrideOptions.chanceOfInfectedGuest = parseInt(chanceOfInfectedGuestSlider.value)
      chanceOfInfectedGuestValue.textContent = String(BusrideOptions.chanceOfInfectedGuest + '%')
    }
    stationsSlider.oninput = () => {
      BusrideOptions.stations = parseInt(stationsSlider.value)
      stationsValue.textContent = String(BusrideOptions.stations)
      totalStationsLabel.textContent = String(BusrideOptions.stations)
    }
    distanceToNextStationSlider.oninput = () => {
      // this will change by deviation
      BusrideOptions.distanceToNextStation = parseInt(distanceToNextStationSlider.value)
      // this is untouched by deviation
      BusrideOptions.distanceToNextStationSliderValue = parseInt(distanceToNextStationSlider.value)
      distanceToNextStationValue.textContent =
        String(BusrideOptions.distanceToNextStation + ' minutes')
    }
    distanceToNextStationDeviationSlider.oninput = () => {
      BusrideOptions.distanceToNextStationDeviation = parseInt(
        distanceToNextStationDeviationSlider.value)
      distanceToNextStationDeviationValue.textContent = String(
        BusrideOptions.distanceToNextStationDeviation)
    }
    contactRadiusSlider.oninput = () => {
      BusrideOptions.contactRadius = parseInt(contactRadiusSlider.value)
      contactRadiusValue.textContent = String(BusrideOptions.contactRadius + ' meters')
    }
    contactTimeSlider.oninput = () => {
      BusrideOptions.contactTime = parseInt(contactTimeSlider.value)
      contactTimeValue.textContent = String(BusrideOptions.contactTime + ' minutes')
    }
    simulationSpeedSlider.oninput = () => {
      SimulationOptions.simulationSpeedMultiplier = parseInt(simulationSpeedSlider.value)
      simulationSpeedValue.textContent = String(SimulationOptions.simulationSpeedMultiplier + 'x')
    }
    buttonNext.onclick = () => {
      SimulationOptions.automaticMode = rbAutomated.checked
      if (SimulationOptions.automaticMode) {
        SimulationOptions.isAutomaticModeRunning = true
        return
      }
      busride.nextStep()
    }
  }

  sketch.draw = () => {
    sketch.background('white')

    if (busride == null) {
      busride = new Busride({ sketch })
    }
    if (SimulationOptions.isAutomaticModeRunning) {
      busride.nextStep()
      Utils.sleep(
        SimulationOptions.simulationBaseSpeed / SimulationOptions.simulationSpeedMultiplier)
    }
    busride.render()
  }
}, document.getElementById('canvas'))
