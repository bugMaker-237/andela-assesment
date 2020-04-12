// @ts-check

// #region  Type Def
/**
 * @typedef {'days'| 'months' | 'weeks'} Period
 * @typedef {{name:string;avgAge:Number;avgDailyIncomeInUSD:Number;
 * avgDailyIncomePopulation:Number}} Region
 */
/**
 * @typedef {Object} EstimatorInput
 * @property {Region} region
 * @property {Period} periodType
 * @property {Number} timeToElapse
 * @property {Number} reportedCases
 * @property {Number} population
 * @property {Number} totalHospitalBeds
 */

/**
 * @typedef {Object} EstimatorImpact
 * @property {Number} currentlyInfected
 * @property {Number} infectionsByRequestedTime
 * @property {Number} severeCasesByRequestedTime
 * @property {Number} hospitalBedsByRequestedTime
 * @property {Number} casesForICUByRequestedTime
 * @property {Number} casesForVentilatorsByRequestedTime
 * @property {Number} dollarsInFlight
 */
/**
 * @typedef {Object} EstimatorOutput
 * @property {EstimatorInput} data
 * @property {{impact:EstimatorImpact; severeImpact:EstimatorImpact;}} estimate
 */


// #region

/**
 * @type {EstimatorOutput}
 */
const initialOutput = {
  // @ts-ignore
  data: {},
  estimate: {
    // @ts-ignore
    impact: {},
    // @ts-ignore
    severeImpact: {}
  }
};

const Rates = {
  reportedCases: 10,
  severeReportedCases: 50,
  infectionsByRequestedTime: 0.15,
  bedAvailaibility: 0.35,
  casesForICUByRequestedTime: 0.05,
  casesForVentilatorsByRequestedTime: 0.02
};
// #region Utils
/**
 * gets the days
 * @param {Period} periodType
 * @param {Number} timeToElapse
 * @returns {Number}
 */
function getDays(periodType, timeToElapse) {
  let days = 0;

  switch (periodType) {
    case 'days':
      days = timeToElapse;
      break;
    case 'weeks':
      days = timeToElapse * 7;
      break;
    case 'months':
      days = timeToElapse * 30;
      break;
    default:
      break;
  }

  return days;
}

/**
 * gets the day factor
 * @param {Period} periodType
 * @param {Number} timeToElapse
 * @returns {Number}
 */
const getDayFactor = (periodType, timeToElapse) => Math.trunc(
  getDays(periodType, timeToElapse) / 3
);

/**
 * @param {EstimatorInput} input
 * @param {{impact:EstimatorImpact; severeImpact:EstimatorImpact;}} estimate
 * @returns {EstimatorOutput}
 */
const buildOutput = (input, estimate) => ({ data: input, estimate });

// #endregion

// HINT : Input data
// {
//   region: {
//    name: "Africa",
//    avgAge: 19.7,
//    avgDailyIncomeInUSD: 5,
//    avgDailyIncomePopulation: 0.71
//   },
//    periodType: "days",
//    timeToElapse: 58,
//    reportedCases: 674,
//    population: 66622705,
//    totalHospitalBeds: 1380614
// }

/**
 * Sets currently infected cases
 * @param {EstimatorOutput} data
 * @returns {EstimatorOutput}
 */
function setCurrentlyInfected(data) {
  const { data: input, estimate } = data;
  estimate.impact.currentlyInfected = input.reportedCases * Rates.reportedCases;
  estimate.severeImpact.currentlyInfected = input.reportedCases * Rates.severeReportedCases;
  return buildOutput(input, estimate);
}

/**
 * Sets infectionsByRequestedTime
 * @param {EstimatorOutput} data
 * @returns {EstimatorOutput}
 */
function setInfectionsByRequestedTime(data) {
  const { data: input, estimate } = data;

  const factor = getDayFactor(input.periodType, input.timeToElapse);

  estimate.impact.infectionsByRequestedTime = estimate.impact.currentlyInfected * 2 ** factor;

  estimate.severeImpact.infectionsByRequestedTime = estimate.impact.currentlyInfected * 2 ** factor;

  return buildOutput(input, estimate);
}

/**
 * Sets severeCasesByRequestedTime
 * @param {EstimatorOutput} data
 * @returns {EstimatorOutput}
 */
function setSevereCasesByRequestedTime(data) {
  const { data: input, estimate } = data;

  estimate.impact.severeCasesByRequestedTime = Math.trunc(estimate.impact
    .infectionsByRequestedTime
  * Rates.infectionsByRequestedTime);

  estimate.severeImpact.severeCasesByRequestedTime = Math.trunc(estimate.severeImpact
    .infectionsByRequestedTime
    * Rates.infectionsByRequestedTime);

  return buildOutput(input, estimate);
}

/**
 * Sets hospitalBedsByRequestedTime
 * @param {EstimatorOutput} data
 * @returns {EstimatorOutput}
 */
function setHospitalBedsByRequestedTime(data) {
  const { data: input, estimate } = data;

  const bedAvailaibility = Math.trunc(input.totalHospitalBeds * Rates.bedAvailaibility);

  estimate.impact.hospitalBedsByRequestedTime = bedAvailaibility
  - estimate.impact.severeCasesByRequestedTime;

  estimate.severeImpact.hospitalBedsByRequestedTime = bedAvailaibility
  - estimate.severeImpact.severeCasesByRequestedTime;

  return buildOutput(input, estimate);
}

/**
 * Sets casesForICUByRequestedTime
 * @param {EstimatorOutput} data
 * @returns {EstimatorOutput}
 */
function setCasesForICUByRequestedTime(data) {
  const { data: input, estimate } = data;

  estimate.impact.casesForICUByRequestedTime = Math.trunc(estimate.impact
    .infectionsByRequestedTime
    * Rates.casesForICUByRequestedTime);

  estimate.severeImpact.casesForICUByRequestedTime = Math.trunc(estimate.severeImpact
    .infectionsByRequestedTime
    * Rates.casesForICUByRequestedTime);

  return buildOutput(input, estimate);
}

/**
 * Sets casesForVentilatorsByRequestedTime
 * @param {EstimatorOutput} data
 * @returns {EstimatorOutput}
 */
function setCasesForVentilatorsByRequestedTime(data) {
  const { data: input, estimate } = data;

  estimate.impact.casesForVentilatorsByRequestedTime = Math.trunc(estimate.impact
    .infectionsByRequestedTime
    * Rates.casesForVentilatorsByRequestedTime);

  estimate.severeImpact.casesForVentilatorsByRequestedTime = Math.trunc(estimate.severeImpact
    .infectionsByRequestedTime * Rates.casesForVentilatorsByRequestedTime);

  return buildOutput(input, estimate);
}

/**
 * Sets casesForVentilatorsByRequestedTime
 * @param {EstimatorOutput} data
 * @returns {EstimatorOutput}
 */
function setDollarsInFlight(data) {
  const { data: input, estimate } = data;

  estimate.impact.dollarsInFlight = Math.trunc(estimate.impact.infectionsByRequestedTime
    * input.region.avgDailyIncomePopulation
    * input.region.avgDailyIncomeInUSD
    * getDays(input.periodType, input.timeToElapse));

  estimate.severeImpact.casesForVentilatorsByRequestedTime = Math.trunc(estimate.severeImpact
    .infectionsByRequestedTime
    * input.region.avgDailyIncomePopulation
    * input.region.avgDailyIncomeInUSD
    * getDays(input.periodType, input.timeToElapse));

  return buildOutput(input, estimate);
}

/**
 * Entry point
 * @param {EstimatorInput} data
 */
const covid19ImpactEstimator = (data) => setDollarsInFlight(
  setCasesForVentilatorsByRequestedTime(
    setCasesForICUByRequestedTime(
      setHospitalBedsByRequestedTime(
        setSevereCasesByRequestedTime(
          setInfectionsByRequestedTime(
            setCurrentlyInfected(
              buildOutput(data, initialOutput.estimate)
            )
          )
        )
      )
    )
  )
);


export default covid19ImpactEstimator;
