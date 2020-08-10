/**
 * provides helper functions
 */
export class Utils {
  /**
   * generate a random between 1 and an upper bound
   * including both bounds.
   * @param {number} upperBound
   * @returns {number} random number between the bounds
   */
  static randomNumberBetweenOneAnd (upperBound) {
    return Math.floor(Math.random() * upperBound) + 1
  }

  /**
   * math formula: distance between two points
   * @param x1 x-coordinate of point 1
   * @param y1 y-coordinate of point 1
   * @param x2 x-coordinate of point 2
   * @param y2 y-coordinate of point 2
   * @return {number} distance in pixels
   */
  static distanceBetweenTwoPoints (x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  }

  /**
   * application sleeps for given milliseconds
   * @param {int} milliseconds
   */
  static sleep (milliseconds) {
    const date = Date.now()
    let currentDate = null
    do {
      currentDate = Date.now()
    } while (currentDate - date < milliseconds)
  }

  /**
   * application sleeps for given milliseconds without
   * blocking the whole web page
   * @param {int} milliseconds
   */
  static sleepAsync (milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }

  /**
   * get current time in format YYYYMMDDhhmmss, which
   * is 20200610184153 for June 6th 2020, 18:41:53
   *
   * @param {Date} currentDate
   *
   * @return {string} date and time in format YYYYMMDDhhmmss
   */
  static getCurrentDateAndTime (currentDate) {
    if (currentDate === null) return ''
    if (String(currentDate.getFullYear()) === 'NaN') return ''

    // year
    const year = String(currentDate.getFullYear())

    // month
    let month = ''
    if ((currentDate.getMonth() + 1) < 10) {
      month += '0' // keep MM format
    }
    month += String(currentDate.getMonth() + 1)

    // day
    let day = ''
    if (currentDate.getDate() < 10) {
      day += '0' // keep DD format
    }
    day += String(currentDate.getDate())

    // hours
    let hours = ''
    if (currentDate.getHours() < 10) {
      hours += '0' // keep hh format
    }
    hours += String(currentDate.getHours())

    // minutes
    let minutes = ''
    if (currentDate.getMinutes() < 10) {
      minutes += '0' // keep mm format
    }
    minutes += String(currentDate.getMinutes())

    // seconds
    let seconds = ''
    if (currentDate.getSeconds() < 10) {
      seconds += '0' // keep mm format
    }
    seconds += String(currentDate.getSeconds())

    return String(year + month + day + hours + minutes + seconds)
  }

  /**
   * random gaussian number
   * @link https://riptutorial.com/javascript/example/8330/random--with-gaussian-distribution
   * @returns {number} a random gaussian number between 0 and 1
   */
  static randomGaussian () {
    let r = 0
    const v = 5 // how many times random is being called
    for (let i = v; i > 0; i--) {
      r += Math.random()
    }
    return r / v
  }

  /**
   * Gaussian Distribution
   * @param {number} mean (mue) center of Gaussian Distribution
   * @param {number} standardDeviation (sigma) how much the value spreads around the center
   * @return {number} gaussian random number around a given mean and a given deviation (Abweichung)
   */
  static randomNumberFromGaussianDistribution (mean, standardDeviation) {
    if (standardDeviation === 0) return mean

    // returns a number between -0.5 and +0.5 with gaussian probability, so
    // the mean is currently at 0. Without -0.5 it would return a random number
    // between 0 and 1, which means the mean would be at 0.5.
    let gaussRandom = this.randomGaussian() - 0.5

    gaussRandom *= standardDeviation // shift curve (mue)
    gaussRandom += (mean) // stretch curve (sigma)
    return gaussRandom
  }
}
