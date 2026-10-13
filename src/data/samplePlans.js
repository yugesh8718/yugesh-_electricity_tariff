// Fictional demonstration rates. These are not official electricity tariffs.
export const samplePlans = [
  {
    id: 'saver',
    name: 'Plan A — Saver',
    fixedMonthlyCharge: 80,
    peakRate: 7,
    normalRate: 5,
    offPeakRate: 3,
  },
  {
    id: 'timesmart',
    name: 'Plan B — TimeSmart',
    fixedMonthlyCharge: 160,
    peakRate: 4,
    normalRate: 5.5,
    offPeakRate: 2.5,
  },
];

export const sampleUsage = {
  peak: 10,
  normal: 100,
  offPeak: 100,
};
