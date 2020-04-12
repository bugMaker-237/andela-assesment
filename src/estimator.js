// @ts-check

//#region  Type Def
/**
 * @typedef {'days'| 'months' | 'weeks'} Period
 */
/**
 * @typedef {Object} EstimatorInput
 * @property {{name:string;avgAge:Number;avgDailyIncomeInUSD:Number;avgDailyIncomePopulation:Number}} region
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

/**
 * @typedef {Object} NavigationData
 * @property {EstimatorInput} input
 * @property {EstimatorOutput} output
 */

//#endregion

/**
 * @type {EstimatorOutput}
 */
const finalOutput = {
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
 * Entry point
 * @param {EstimatorInput} data
 */
const covid19ImpactEstimator = (data) =>
  setDollarsInFlight(
    setCasesForVentilatorsByRequestedTime(
      setCasesForICUByRequestedTime(
        setHospitalBedsByRequestedTime(
          setSevereCasesByRequestedTime(
            setInfectionsByRequestedTime(
              setCurrentlyInfected(
                setData({ input: data, output: finalOutput })
              )
            )
          )
        )
      )
    )
  );

/**
 * sets input data in output
 * @param {NavigationData} data
 * @returns {NavigationData}
 */
function setData(data) {
  const { input, output } = data;
  output.data = input;
  return data;
}
/**
 * Sets currently infected cases
 * @param {NavigationData} data
 * @returns {NavigationData}
 */
// @ts-ignore
function setCurrentlyInfected(data) {
  const { input } = data;
  const estimate = data.output.estimate;
  estimate.impact.currentlyInfected =
    input.reportedCases * Rates.reportedCasesRate;
  estimate.severeImpact.currentlyInfected =
    input.reportedCases * Rates.severeReportedCases;
  return data;
}

/**
 * Sets infectionsByRequestedTime
 * @param {NavigationData} data
 * @returns {NavigationData}
 */
function setInfectionsByRequestedTime(data) {
  const { input } = data;
  const estimate = data.output.estimate;

  const factor = _getDayFactor(input.periodType, input.timeToElapse);

  estimate.impact.infectionsByRequestedTime =
    estimate.impact.currentlyInfected * Math.pow(2, factor);

  estimate.severeImpact.infectionsByRequestedTime =
    estimate.impact.currentlyInfected * Math.pow(2, factor);

  return data;
}

/**
 * Sets severeCasesByRequestedTime
 * @param {NavigationData} data
 * @returns {NavigationData}
 */
function setSevereCasesByRequestedTime(data) {
  const estimate = data.output.estimate;

  estimate.impact.severeCasesByRequestedTime =
    estimate.impact.infectionsByRequestedTime * Rates.infectionsByRequestedTime;

  estimate.severeImpact.severeCasesByRequestedTime =
    estimate.severeImpact.infectionsByRequestedTime *
    Rates.infectionsByRequestedTime;

  return data;
}

/**
 * Sets hospitalBedsByRequestedTime
 * @param {NavigationData} data
 * @returns {NavigationData}
 */
function setHospitalBedsByRequestedTime(data) {
  const { input } = data;
  const estimate = data.output.estimate;

  const bedAvailaibility = input.totalHospitalBeds * Rates.bedAvailaibility;

  estimate.impact.hospitalBedsByRequestedTime =
    bedAvailaibility - estimate.impact.severeCasesByRequestedTime;

  estimate.severeImpact.hospitalBedsByRequestedTime =
    bedAvailaibility - estimate.severeImpact.severeCasesByRequestedTime;

  return data;
}

/**
 * Sets casesForICUByRequestedTime
 * @param {NavigationData} data
 * @returns {NavigationData}
 */
function setCasesForICUByRequestedTime(data) {
  const { input } = data;
  const estimate = data.output.estimate;

  estimate.impact.casesForICUByRequestedTime =
    estimate.impact.infectionsByRequestedTime *
    Rates.casesForICUByRequestedTime;

  estimate.severeImpact.casesForICUByRequestedTime =
    estimate.severeImpact.infectionsByRequestedTime *
    Rates.casesForICUByRequestedTime;

  return data;
}

/**
 * Sets casesForVentilatorsByRequestedTime
 * @param {NavigationData} data
 * @returns {NavigationData}
 */
function setCasesForVentilatorsByRequestedTime(data) {
  const { input } = data;
  const estimate = data.output.estimate;

  estimate.impact.casesForVentilatorsByRequestedTime =
    estimate.impact.infectionsByRequestedTime *
    Rates.casesForVentilatorsByRequestedTime;

  estimate.severeImpact.casesForVentilatorsByRequestedTime =
    estimate.severeImpact.infectionsByRequestedTime *
    Rates.casesForVentilatorsByRequestedTime;

  return data;
}

/**
 * Sets casesForVentilatorsByRequestedTime
 * @param {NavigationData} data
 * @returns {NavigationData}
 */
function setDollarsInFlight(data) {
  const { input } = data;
  const estimate = data.output.estimate;

  estimate.impact.dollarsInFlight =
    estimate.impact.infectionsByRequestedTime *
    input.region.avgDailyIncomePopulation *
    input.region.avgDailyIncomeInUSD *
    _getDays(input.periodType, input.timeToElapse);

  estimate.severeImpact.casesForVentilatorsByRequestedTime =
    estimate.severeImpact.infectionsByRequestedTime *
    input.region.avgDailyIncomePopulation *
    input.region.avgDailyIncomeInUSD *
    _getDays(input.periodType, input.timeToElapse);

  return data;
}

/**
 * gets the day factor
 * @param {Period} periodType
 * @param {Number} timeToElapse
 * @returns {Number}
 */
function _getDayFactor(periodType, timeToElapse) {
  return _getDays(periodType, timeToElapse) / 3;
}

/**
 * gets the days
 * @param {Period} periodType
 * @param {Number} timeToElapse
 * @returns {Number}
 */
function _getDays(periodType, timeToElapse) {
  let days = 0;

  switch (periodType) {
    case 'days':
      days = timeToElapse / 3;
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

export default covid19ImpactEstimator;
