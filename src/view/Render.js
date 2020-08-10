import { COLORS, DESKTOP_CANVAS_SIZE } from '../controller/options.js'
import { SEAT_SIZE } from '../model/Seat.js'
import { BusDriver } from '../model/BusDriver.js'
import { BusrideOptions, CONTACT_RADIUS_MULTIPLIER } from '../controller/BusrideOptions.js'
import { HealthCondition } from '../model/Person.js'
import {
  csvDownloadArea,
  csvDownloadLink,
  currentStationLabel, spanDriveTime,
  spanHealthy,
  spanIncomingHealthy, spanIncomingInfected,
  spanInfected, spanNewInfections,
  spanNumGuests, spanOutgoingHealthy, spanOutgoingInfected
} from '../controller/dom.js'
import { Csv, Metrics } from '../model/Metrics.js'
import { Utils } from '../util/Utils.js'

/**
 * displays every graphical stuff
 */
export class Render {
  /**
   * give Render all necessary objects which will be displayed.
   * @param {p5.sketch} sketch
   * @param {Bus} bus
   * @param {BusStation} busStation
   * @param {Person[]} guests
   */
  constructor (sketch, bus, busStation, guests) {
    this.sketch = sketch
    this.bus = bus
    this.busStation = busStation
    this.guests = guests
  }

  /**
   * things that are drawn independent of the BusrideState. This is:
   * - Bus
   * - BusDriver
   * - current BusStation count
   */
  alwaysRenderTheseObjects () {
    this.renderBus()
    this.renderBusDriver()
    currentStationLabel.textContent = String(this.bus.currentStation)
  }

  /**
   * renders the bus and all its components
   */
  renderBus () {
    // bus shape
    this.sketch.rect(
      100, // x pos
      85, // y pos
      DESKTOP_CANVAS_SIZE.width - 200, // width
      DESKTOP_CANVAS_SIZE.height - 185 // height
    )

    this.renderSeats()
  }

  /**
   * renders the 40 seats of the bus
   */
  renderSeats () {
    this.bus.seats.forEach((seat) => {
      this.renderSeat(seat)
    })
  }

  /**
   * renders a single seat, containing:
   *  - seat shape (rect)
   *  - seat number (number inside the seat shape)
   *  @param {Seat} seat one seat to render
   */
  renderSeat (seat) {
    this.sketch.rect(seat.posX, seat.posY, SEAT_SIZE, SEAT_SIZE)
    this.sketch.textSize(14)
    this.sketch.text(seat.number, seat.posX + SEAT_SIZE * 0.4, seat.posY + SEAT_SIZE * 0.62)
  }

  /**
   * renders the bus driver seat and the bus driver
   */
  renderBusDriver () {
    // seat
    this.sketch.rect(BusDriver.posX(), BusDriver.posY(), SEAT_SIZE, SEAT_SIZE)
    this.sketch.textSize(14)
    this.sketch.text('D', BusDriver.posX() + SEAT_SIZE * 0.4, BusDriver.posY() + SEAT_SIZE * 0.62)

    // bus driver
    const circlePosX = BusDriver.posX() + SEAT_SIZE * 0.5
    const circlePosY = BusDriver.posY() + SEAT_SIZE * 0.5
    this.sketch.noStroke()
    this.sketch.fill(COLORS.healthy) // bus driver is always healthy
    this.sketch.ellipse(circlePosX, circlePosY,
      BusrideOptions.contactRadius * CONTACT_RADIUS_MULTIPLIER,
      BusrideOptions.contactRadius * CONTACT_RADIUS_MULTIPLIER)
    // revert the noStroke and fill from above
    this.sketch.stroke(1)
    this.sketch.noFill()

    this.guests[0] = new BusDriver() // let also bus driver be able to become infected
  }

  /**
   * look into seats and render the guest
   * if there is someone sitting on the seat
   */
  renderGuests () {
    this.bus.seats.forEach(seat => {
      if (!seat.isFree) {
        this.renderGuest(seat)

        /**
         * seat numbers are indices for the guests array.
         * during the rendering process this method is
         * called multiple times, so we do not push guests
         */
        this.guests[seat.number] = seat.guest
      }
    })
  }

  /**
   * render guest on the seat
   * @param {Seat} seat the seat where a guest sits
   */
  renderGuest (seat) {
    const circlePosX = seat.posX + SEAT_SIZE * 0.5
    const circlePosY = seat.posY + SEAT_SIZE * 0.5
    this.sketch.noStroke()
    if (seat.guest.healthCondition === HealthCondition.HEALTHY) {
      this.sketch.fill(COLORS.healthy)
    } else {
      this.sketch.fill(COLORS.infected)
    }
    this.sketch.ellipse(circlePosX, circlePosY,
      BusrideOptions.contactRadius * CONTACT_RADIUS_MULTIPLIER,
      BusrideOptions.contactRadius * CONTACT_RADIUS_MULTIPLIER)

    // revert the noStroke and fill from above
    this.sketch.stroke(1)
    this.sketch.noFill()
  }

  /**
   * render a guest waiting at the bus sation
   * @param {Guest} guest
   */
  renderWaitingGuest (guest) {
    // prepare drawing
    this.sketch.noStroke() // circle has no border color

    // draw guests health condition
    if (guest.healthCondition === HealthCondition.HEALTHY) {
      this.sketch.fill(COLORS.healthy)
    } else {
      this.sketch.fill(COLORS.infected)
    }

    // draw circle which represents the guest
    this.sketch.ellipse(guest.posX, guest.posY,
      BusrideOptions.contactRadius * CONTACT_RADIUS_MULTIPLIER,
      BusrideOptions.contactRadius * CONTACT_RADIUS_MULTIPLIER)

    // revert the noStroke and fill from above
    this.sketch.stroke(1)
    this.sketch.noFill()
  }

  /**
   * render waiting guests at the bus station
   */
  renderWaitingGuests () {
    this.busStation.guestsWaitingAtTheStation.forEach(guest => {
      this.renderWaitingGuest(guest)
    })
  }

  /**
   * render leaving guests outside the bus
   */
  renderLeavingGuests () {
    let i = 0 // index for BusStation.guestLeavePositions
    this.busStation.guestsInLeavingArea.forEach(guest => {
      guest.posX = this.busStation.guestLeavePositions[i].x
      guest.posY = this.busStation.guestLeavePositions[i].y
      this.renderLeavingGuest(guest)
      i++
    })
  }

  /**
   * render guest at the leaving area outside the bus
   * @param {Guest} guest which should be drawn in bus station
   *                leaving area
   */
  renderLeavingGuest (guest) {
    this.renderWaitingGuest(guest)
  }

  /**
   * display: guests, healthy, sick, incoming healthy,
   * incoming infected, outgoing healthy, outgoing infected
   */
  displayMetricsOnUi () {
    spanNumGuests.textContent = String(Metrics.numberOfGuests)
    spanHealthy.textContent = String(Metrics.healthy)
    spanInfected.textContent = String(Metrics.infected)
    spanIncomingHealthy.textContent = String(Metrics.numberIncomingHealthyGuests)
    spanIncomingInfected.textContent = String(Metrics.numberIncomingInfectedGuests)
    spanOutgoingHealthy.textContent = String(Metrics.numberOutgoingHealthyGuests)
    spanOutgoingInfected.textContent = String(Metrics.numberOutgoingInfectedGuests)
    spanDriveTime.textContent = String(Metrics.timestamp)
    spanNewInfections.textContent = String(Metrics.newInfections)
  }

  /**
   * create and display csv download link with all
   * the metrics the application gathered while running.
   */
  createDownloadLinkForCsvFile () {
    // put metrics as download link value
    Csv.filename = 'busrideMetrics_' + Utils.getCurrentDateAndTime(new Date()) + '.csv'
    csvDownloadLink.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(Csv.contents))
    csvDownloadLink.setAttribute('download', Csv.filename)

    // show download link
    csvDownloadArea.style.visibility = 'visible'
  }
}
