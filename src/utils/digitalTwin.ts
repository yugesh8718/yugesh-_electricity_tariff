/**
 * digitalTwin.ts
 *
 * Consumption Digital Twin — classifies a user's electricity usage pattern
 * into a fingerprint label with an explanation.
 *
 * Threshold logic (applied in order):
 *   peakShare >= 45%       → Peak-Heavy Household
 *   offPeakShare >= 45%    → Off-Peak Optimiser
 *   shoulderShare >= 50%   → Daytime Small Business (if small-business) OR Daytime Dominant
 *   Otherwise              → Balanced Household
 */

import type { ConsumptionInput, UsageFingerprint, FingerprintLabel } from '../types/index.js';

/**
 * Classify usage and return a fingerprint with explanation.
 * The label is derived solely from percentage thresholds — never random.
 */
export function classifyFingerprint(consumption: ConsumptionInput): UsageFingerprint {
  const { offPeak, shoulder, peak, total, consumerType } = consumption;

  // Guard against zero total
  const safeTotal = total > 0 ? total : offPeak + shoulder + peak;

  const offPeakShare = safeTotal > 0 ? (offPeak / safeTotal) * 100 : 0;
  const shoulderShare = safeTotal > 0 ? (shoulder / safeTotal) * 100 : 0;
  const peakShare = safeTotal > 0 ? (peak / safeTotal) * 100 : 0;

  let label: FingerprintLabel;
  let explanation: string;

  if (peakShare >= 45) {
    label = 'Peak-Heavy Household';
    explanation =
      `${peakShare.toFixed(1)}% of your electricity is used during peak hours, which is above the 45% threshold. ` +
      'Time-of-use plans will charge you higher rates for most of your consumption. ' +
      'A flat-rate plan is likely to be more economical unless you can shift significant usage out of peak hours.';
  } else if (offPeakShare >= 45) {
    label = 'Off-Peak Optimiser';
    explanation =
      `${offPeakShare.toFixed(1)}% of your electricity is used during off-peak hours, which is above the 45% threshold. ` +
      'You are well-positioned to benefit from time-of-use tariffs that offer discounted off-peak rates. ' +
      'Plans with low off-peak rates will typically cost you less than flat-rate alternatives.';
  } else if (shoulderShare >= 50) {
    if (consumerType === 'small-business') {
      label = 'Daytime Small Business';
      explanation =
        `${shoulderShare.toFixed(1)}% of your electricity is used during shoulder (normal) hours, which is above 50%. ` +
        'This pattern is typical of small businesses operating during standard business hours. ' +
        'Plans with competitive shoulder rates or flat-rate plans are usually most cost-effective.';
    } else {
      label = 'Daytime Dominant';
      explanation =
        `${shoulderShare.toFixed(1)}% of your electricity is used during shoulder (normal daytime) hours, above the 50% threshold. ` +
        'Your consumption is concentrated in standard daytime hours. ' +
        'Plans with competitive shoulder rates will generally offer better value for your usage profile.';
    }
  } else {
    label = 'Balanced Household';
    explanation =
      `Your electricity usage is spread fairly evenly across off-peak (${offPeakShare.toFixed(1)}%), ` +
      `shoulder (${shoulderShare.toFixed(1)}%), and peak (${peakShare.toFixed(1)}%) periods. ` +
      'Neither a flat-rate nor a time-of-use plan has a strong structural advantage — ' +
      'compare total costs directly to find the best option for your household.';
  }

  return {
    label,
    offPeakShare,
    shoulderShare,
    peakShare,
    explanation,
  };
}

/**
 * Main export — alias for classifyFingerprint for clarity at call sites.
 */
export const generateFingerprint = classifyFingerprint;
