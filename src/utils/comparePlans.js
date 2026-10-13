import { calculateBill } from './calculateBill.js';

/** Returns bills, cheapest plan(s), and savings for the supplied usage. */
export function comparePlans(usage, plans) {
  if (!Array.isArray(plans) || plans.length < 2) {
    throw new Error('At least two tariff plans are required.');
  }

  const results = plans.map((plan) => ({
    plan,
    bill: calculateBill(usage, plan),
  }));

  const lowestBill = Math.min(...results.map((result) => result.bill));
  const cheapest = results.filter((result) => Math.abs(result.bill - lowestBill) < 1e-9);
  const highestBill = Math.max(...results.map((result) => result.bill));

  return {
    results,
    cheapest,
    isTie: cheapest.length > 1,
    savings: highestBill - lowestBill,
    lowestBill,
    highestBill,
  };
}
