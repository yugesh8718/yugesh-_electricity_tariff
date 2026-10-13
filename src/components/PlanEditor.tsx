/**
 * PlanEditor.tsx
 *
 * Form component for creating or editing a TariffPlan.
 * Replaces old PlanEditor.jsx.
 * Accepts a TariffPlan and an onChange handler.
 */
import type { ChangeEvent } from 'react';
import type { TariffPlan } from '../types';

interface Props {
  plan: TariffPlan;
  onChange: (updated: TariffPlan) => void;
}

function NumericField({
  label,
  id,
  value,
  suffix,
  onChange,
  min = 0,
}: {
  label: string;
  id: string;
  value: number;
  suffix?: string;
  onChange: (v: number) => void;
  min?: number;
}) {
  return (
    <div className="form-group compact-field">
      <label htmlFor={id}>{label}</label>
      <div className="input-with-suffix">
        <input
          id={id}
          type="number"
          min={min}
          step="0.01"
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(parseFloat(e.target.value) || 0)}
        />
        {suffix && <span>{suffix}</span>}
      </div>
    </div>
  );
}

export default function PlanEditor({ plan, onChange }: Props) {
  function update<K extends keyof TariffPlan>(key: K, value: TariffPlan[K]) {
    onChange({ ...plan, [key]: value });
  }

  return (
    <div className="plan-editor">
      <div className="form-group">
        <label htmlFor={`plan-name-${plan.id}`}>Plan name</label>
        <input
          id={`plan-name-${plan.id}`}
          type="text"
          className="plan-name-input"
          value={plan.name}
          onChange={(e) => update('name', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor={`plan-desc-${plan.id}`}>Description (optional)</label>
        <input
          id={`plan-desc-${plan.id}`}
          type="text"
          value={plan.description ?? ''}
          onChange={(e) => update('description', e.target.value)}
        />
      </div>

      <div className="plan-fields">
        <NumericField
          label="Fixed charge (per billing period)"
          id={`fixed-${plan.id}`}
          value={plan.fixedCharge}
          suffix="₹"
          onChange={(v) => update('fixedCharge', v)}
        />
        <NumericField
          label="Off-peak rate"
          id={`offpeak-${plan.id}`}
          value={plan.offPeakRate}
          suffix="₹/kWh"
          onChange={(v) => update('offPeakRate', v)}
        />
        <NumericField
          label="Shoulder rate"
          id={`shoulder-${plan.id}`}
          value={plan.shoulderRate}
          suffix="₹/kWh"
          onChange={(v) => update('shoulderRate', v)}
        />
        <NumericField
          label="Peak rate"
          id={`peak-${plan.id}`}
          value={plan.peakRate}
          suffix="₹/kWh"
          onChange={(v) => update('peakRate', v)}
        />
        <NumericField
          label="Electricity duty / tax"
          id={`duty-${plan.id}`}
          value={plan.taxDutyPercent}
          suffix="%"
          onChange={(v) => update('taxDutyPercent', v)}
        />
        <NumericField
          label="Surcharge"
          id={`surcharge-${plan.id}`}
          value={plan.surcharge}
          suffix="₹"
          onChange={(v) => update('surcharge', v)}
        />
      </div>
    </div>
  );
}
