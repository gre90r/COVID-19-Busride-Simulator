/**
 * health condition of a person
 * @type {{HEALTHY: int, INFECTED: int}}
 */
export const HealthCondition = {
  HEALTHY: 0,
  INFECTED: 1
}

/**
 * a Person is either a guest or the bus driver who
 * is able to become infected. All persons share the
 * same contact time.
 * @abstract class is used to create Guest or BusDriver
 */
export class Person {
  constructor () {
    /**
     * how long the person was exposed in the radius
     * of an infected person
     * @type {int}
     */
    this.contactTime = 0
    /**
     * health condition of the person. either healthy
     * or infected. 0 = healthy, 1 = infected. Please
     * use the HealthCondition data structure to
     * set the health condition value to improve
     * readability.
     * @type {int}
     */
    this.healthCondition = HealthCondition.HEALTHY
  }

  /**
   * set health condition status to HealthCondition.HEALTHY or
   * HealthCondition.INFECTED
   * @type {int} @param healthCondition
   */
  setHealthCondition (healthCondition) {
    this.healthCondition = healthCondition
  }
}
