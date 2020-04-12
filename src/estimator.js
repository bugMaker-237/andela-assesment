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
 * @property {EstimatorImpact} impact
 * @property {EstimatorImpact} severeImpact
 */

// #region

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
const getDayFactor = (periodType, timeToElapse) =>
  Math.trunc(getDays(periodType, timeToElapse) / 3);

/**
 * @param {EstimatorInput} input
 * @param {EstimatorImpact} impact
 * @param {EstimatorImpact} severeImpact
 * @returns {EstimatorOutput}
 */
const buildOutput = (input, impact, severeImpact) => ({
  data: input,
  impact,
  severeImpact
});

// #endregion

/**
 * Sets currently infected cases
 * @param {EstimatorOutput} data
 * @returns {EstimatorOutput}
 */
function setCurrentlyInfected(data) {
  const { data: input, impact, severeImpact } = data;
  impact.currentlyInfected = input.reportedCases * Rates.reportedCases;
  severeImpact.currentlyInfected =
    input.reportedCases * Rates.severeReportedCases;
  return buildOutput(input, impact, severeImpact);
}

/**
 * Sets infectionsByRequestedTime
 * @param {EstimatorOutput} data
 * @returns {EstimatorOutput}
 */
function setInfectionsByRequestedTime(data) {
  const { data: input, impact, severeImpact } = data;

  const factor = getDayFactor(input.periodType, input.timeToElapse);

  impact.infectionsByRequestedTime = impact.currentlyInfected * 2 ** factor;

  severeImpact.infectionsByRequestedTime =
    severeImpact.currentlyInfected * 2 ** factor;

  return buildOutput(input, impact, severeImpact);
}

/**
 * Sets severeCasesByRequestedTime
 * @param {EstimatorOutput} data
 * @returns {EstimatorOutput}
 */
function setSevereCasesByRequestedTime(data) {
  const { data: input, impact, severeImpact } = data;

  impact.severeCasesByRequestedTime = Math.trunc(
    impact.infectionsByRequestedTime * Rates.infectionsByRequestedTime
  );

  severeImpact.severeCasesByRequestedTime = Math.trunc(
    severeImpact.infectionsByRequestedTime * Rates.infectionsByRequestedTime
  );

  return buildOutput(input, impact, severeImpact);
}

/**
 * Sets hospitalBedsByRequestedTime
 * @param {EstimatorOutput} data
 * @returns {EstimatorOutput}
 */
function setHospitalBedsByRequestedTime(data) {
  const { data: input, impact, severeImpact } = data;

  const bedAvailaibility = input.totalHospitalBeds * Rates.bedAvailaibility;

  impact.hospitalBedsByRequestedTime = Math.trunc(
    bedAvailaibility - impact.severeCasesByRequestedTime
  );

  severeImpact.hospitalBedsByRequestedTime = Math.trunc(
    bedAvailaibility - severeImpact.severeCasesByRequestedTime
  );

  return buildOutput(input, impact, severeImpact);
}

/**
 * Sets casesForICUByRequestedTime
 * @param {EstimatorOutput} data
 * @returns {EstimatorOutput}
 */
function setCasesForICUByRequestedTime(data) {
  const { data: input, impact, severeImpact } = data;

  impact.casesForICUByRequestedTime = Math.trunc(
    impact.infectionsByRequestedTime * Rates.casesForICUByRequestedTime
  );

  severeImpact.casesForICUByRequestedTime = Math.trunc(
    severeImpact.infectionsByRequestedTime * Rates.casesForICUByRequestedTime
  );

  return buildOutput(input, impact, severeImpact);
}

/**
 * Sets casesForVentilatorsByRequestedTime
 * @param {EstimatorOutput} data
 * @returns {EstimatorOutput}
 */
function setCasesForVentilatorsByRequestedTime(data) {
  const { data: input, impact, severeImpact } = data;

  impact.casesForVentilatorsByRequestedTime = Math.trunc(
    impact.infectionsByRequestedTime * Rates.casesForVentilatorsByRequestedTime
  );
  severeImpact.casesForVentilatorsByRequestedTime = Math.trunc(
    severeImpact.infectionsByRequestedTime *
      Rates.casesForVentilatorsByRequestedTime
  );

  return buildOutput(input, impact, severeImpact);
}

/**
 * Sets casesForVentilatorsByRequestedTime
 * @param {EstimatorOutput} data
 * @returns {EstimatorOutput}
 */
function setDollarsInFlight(data) {
  const { data: input, impact, severeImpact } = data;

  impact.dollarsInFlight = Math.trunc(
    (impact.infectionsByRequestedTime *
      input.region.avgDailyIncomePopulation *
      input.region.avgDailyIncomeInUSD) /
      getDays(input.periodType, input.timeToElapse)
  );

  severeImpact.dollarsInFlight = Math.trunc(
    (severeImpact.infectionsByRequestedTime *
      input.region.avgDailyIncomePopulation *
      input.region.avgDailyIncomeInUSD) /
      getDays(input.periodType, input.timeToElapse)
  );

  return buildOutput(input, impact, severeImpact);
}

/**
 * Estimator Entry point
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
                // @ts-ignore
                buildOutput(data, {}, {})
              )
            )
          )
        )
      )
    )
  );

export default covid19ImpactEstimator;
