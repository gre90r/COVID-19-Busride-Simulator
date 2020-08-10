/**
 * options for running the simulation
 */
export const SimulationOptions = {
  /**
   * true: after pressing start the Busride Simulation
   *       progress automatically
   * false: after pressing start you step through
   *        every step, and therefore can adjust
   *        parameters while running
   * @type {boolean}
   */
  automaticMode: true,
  /**
   * simulation steps every milliseconds defined here
   * @type {int}
   */
  simulationBaseSpeed: 500, // in milliseconds
  /**
   * let the application progress faster.
   * the value means X times as fast.
   * @type {int}
   */
  simulationSpeedMultiplier: 1,
  /**
   * true: application is in mode automatic simulation progression
   * false: application is in mode step through simulation
   * @type {boolean}
   */
  isAutomaticModeRunning: false
}
