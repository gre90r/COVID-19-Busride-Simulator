/**
 * data which will be saved in csv file
 */
export const Metrics = {
  /**
   * in minutes. how much time has passed since the first station
   * @type {int}
   */
  timestamp: 0,
  /**
   * how many guests are sitting in the bus, healthy and infected.
   * "Anzahl der Passagiere im Bus"
   * @type {int}
   */
  numberOfGuests: 0,
  /**
   * "Anzahl der infizierten Zugaenge"
   * @type {int}
   */
  numberIncomingInfectedGuests: 0,
  /**
   * "Anzahl der gesunden Zugaenge"
   * @type {int}
   */
  numberIncomingHealthyGuests: 0,
  /**
   * "Anzahl der infizierten Abgaenge"
   * @type {int}
   */
  numberOutgoingInfectedGuests: 0,
  /**
   * "Anzahl der gesunden Abgaenge"
   * @type {int}
   */
  numberOutgoingHealthyGuests: 0,
  /**
   * currently healthy guests in the bus
   * @type {int}
   */
  healthy: 0,
  /**
   * currently infected guests in the bus
   * @type {int}
   */
  infected: 0,
  /**
   * guests who were healthy and became infected
   * @type {int}
   */
  newInfections: 0
}

/**
 * everything related to exporting the csv file
 */
export const Csv = {
  /**
   * column captions. append file contents here with \n
   * @type {string}
   */
  contents: 'timestamp,' +
    'numberOfGuests,' +
    'numberIncomingHealthyGuests,' +
    'numberIncomingInfectedGuests,' +
    'numberOutgoingHealthyGuests,' +
    'numberOutgoingInfectedGuests,' +
    'healthy,' +
    'infected,' +
    'newInfections\n',
  /**
   * overwrite with 'busrideMetrics_<currentDateTime>.csv'
   * @type {string}
   */
  filename: 'busrideMetrics.csv'
}
