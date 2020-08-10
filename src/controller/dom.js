const $ = id => document.getElementById(id)

export const graphElement = $('graph')
export const replayElement = $('replay')

export const currentStationLabel = $('currentStation')
export const totalStationsLabel = $('totalStations')

/***********/
/* sliders */
/***********/
// slider
export const guestsEnterPerStationSlider = $('guestsEnterPerStationSlider')
// corresponding slider value
export const guestsEnterPerStationValue = $('guestsEnterPerStationValue')

export const guestsEnterPerStationDeviationSlider = $('guestsEnterPerStationDeviationSlider')
export const guestsEnterPerStationDeviationValue = $('guestsEnterPerStationDeviationValue')

export const guestsLeavePerStationSlider = $('guestsLeavePerStationSlider')
export const guestsLeavePerStationValue = $('guestsLeavePerStationValue')

export const guestsLeavePerStationDeviationSlider = $('guestsLeavePerStationDeviationSlider')
export const guestsLeavePerStationDeviationValue = $('guestsLeavePerStationDeviationValue')

export const chanceOfInfectedGuestSlider = $('chanceOfInfectedGuestSlider')
export const chanceOfInfectedGuestValue = $('chanceOfInfectedGuestValue')

export const stationsSlider = $('stationsSlider')
export const stationsValue = $('stationsValue')

export const distanceToNextStationSlider = $('distanceToNextStationSlider')
export const distanceToNextStationValue = $('distanceToNextStationValue')

export const distanceToNextStationDeviationSlider = $('distanceToNextStationDeviationSlider')
export const distanceToNextStationDeviationValue = $('distanceToNextStationDeviationValue')

export const contactRadiusSlider = $('contactRadiusSlider')
export const contactRadiusValue = $('contactRadiusValue')

export const contactTimeSlider = $('contactTimeSlider')
export const contactTimeValue = $('contactTimeValue')

export const simulationSpeedSlider = $('simulationSpeedSlider')
export const simulationSpeedValue = $('simulationSpeedValue')

/***********/
/* buttons */
/***********/
export const buttonNext = $('nextButton')

/*****************/
/* radio buttons */
/*****************/
export const rbAutomated = $('rbAutomated')
export const rbStepThrough = $('rbStepThrough')

/**********/
/* labels */
/**********/
export const spanBusrideState = $('busrideState')

/***********/
/* metrics */
/***********/
export const spanNumGuests = $('numGuests')
export const spanHealthy = $('healthy')
export const spanInfected = $('infected')
export const spanNewInfections = $('newInfections')
export const spanIncomingHealthy = $('incomingHealthy')
export const spanIncomingInfected = $('incomingInfected')
export const spanOutgoingHealthy = $('outgoingHealthy')
export const spanOutgoingInfected = $('outgoingInfected')
export const spanDriveTime = $('driveTime')

/****************/
/* csv download */
/****************/
export const csvDownloadArea = $('csvDownloadArea')
export const csvDownloadLink = $('csvDownloadLink')
