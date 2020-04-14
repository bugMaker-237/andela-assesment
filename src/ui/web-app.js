/* eslint-disable */
const app = {
  initialise: function initialise() {
    const submittionBtn = document.querySelector('[data-go-estimate]');
    const form = document.getElementById('form');
    form.addEventListener('click', (ev) => ev.stopImmediatePropagation());
    submittionBtn.addEventListener('click', this.submit.bind(this));
  },
  submit: function submit(event) {
    event.stopImmediatePropagation();
    const e = document.querySelector('[data-period-type]');
    const val = e.options[e.selectedIndex].value;
    const request = {
      population: document.querySelector('[data-population]').value,
      timeToElapse: document.querySelector('[data-time-to-elapse]').value,
      reportedCases: document.querySelector('[data-reported-cases]').value,
      totalHospitalBeds: document.querySelector('[data-total-hospital-beds]')
        .value,
      periodType: val
    };
    request.region = {
      name: 'Africa',
      avgAge: 19.7,
      avgDailyIncomeInUSD: 3,
      avgDailyIncomePopulation: 0.56
    };
    console.log(request);
    const result = window.covid19ImpactEstimator(request);
    let templateImpact = document.getElementById('impact-template').innerHTML;
    let templateSevereImpact = templateImpact.toString();

    for (const key in result.impact) {
      templateImpact = templateImpact.replace(`#${key}`, result.impact[key]);
    }

    for (const key in result.severeImpact) {
      templateSevereImpact = templateSevereImpact.replace(
        `#${key}`,
        result.impact[key]
      );
    }

    document.getElementById('impact').innerHTML = templateImpact;
    document.getElementById('severe-impact').innerHTML = templateSevereImpact;
  }
};

app.initialise();
