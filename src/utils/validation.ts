/**
 * validation.ts
 *
 * Pure validation utilities for WattWise.
 * Returns a map of field names → error messages (empty object means valid).
 */

import type { ConsumptionInput, TariffPlan } from '../types/index.js';

/**
 * Validate consumption input fields.
 * Checks that offPeak, shoulder, and peak are non-negative finite numbers.
 *
 * @returns Record of { fieldName: errorMessage }. Empty when input is valid.
 */
export function validateConsumption(
  input: Partial<ConsumptionInput>
): Record<string, string> {
  const errors: Record<string, string> = {};

  const fields: Array<keyof Pick<ConsumptionInput, 'offPeak' | 'shoulder' | 'peak'>> = [
    'offPeak',
    'shoulder',
    'peak',
  ];

  for (const field of fields) {
    const value = input[field];
    if (value === undefined || value === null) {
      errors[field] = `${field} is required.`;
    } else if (!Number.isFinite(value as number)) {
      errors[field] = `${field} must be a finite number.`;
    } else if ((value as number) < 0) {
      errors[field] = `${field} must be a non-negative number.`;
    }
  }

  return errors;
}

/**
 * Validate tariff plan rate fields.
 * Checks that all rate fields are non-negative finite numbers.
 *
 * @returns Record of { fieldName: errorMessage }. Empty when plan is valid.
 */
export function validateTariffPlan(
  plan: Partial<TariffPlan>
): Record<string, string> {
  const errors: Record<string, string> = {};

  const rateFields: Array<
    keyof Pick<
      TariffPlan,
      'fixedCharge' | 'offPeakRate' | 'shoulderRate' | 'peakRate' | 'taxDutyPercent' | 'surcharge'
    >
  > = ['fixedCharge', 'offPeakRate', 'shoulderRate', 'peakRate', 'taxDutyPercent', 'surcharge'];

  for (const field of rateFields) {
    const value = plan[field];
    if (value === undefined || value === null) {
      errors[field] = `${field} is required.`;
    } else if (!Number.isFinite(value as number)) {
      errors[field] = `${field} must be a finite number.`;
    } else if ((value as number) < 0) {
      errors[field] = `${field} must be a non-negative number.`;
    }
  }

  return errors;
}
