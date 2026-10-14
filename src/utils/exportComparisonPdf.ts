/**
 * exportComparisonPdf.ts
 *
 * Generates a structured PDF from an existing ComparisonResult.
 *
 * Rules:
 *   - Uses ONLY data already present in the ComparisonResult — never recalculates.
 *   - A4 portrait, clean layout, page numbers, wrapped text.
 *   - Uses "INR" instead of the ₹ glyph because jsPDF's built-in font does not
 *     include the Rupee character; using ₹ would render as a box.
 *   - Returns a Blob so callers can trigger a download or inspect the result.
 *   - Does NOT include Firebase UID, tokens, env vars, or private auth data.
 */

import type { ComparisonResult, BillBreakdown } from '../types';

// Lazy import so jsPDF is only bundled when actually used
async function loadJsPDF() {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  return { jsPDF, autoTable };
}

// ── Currency helper (PDF-safe, no ₹ glyph) ───────────────────────────────────

function rupees(value: number): string {
  return `INR ${value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(ts: string): string {
  try {
    return new Date(ts).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  } catch {
    return ts;
  }
}

function now(): string {
  return new Date().toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function todayFilename(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `tariff-comparison-${y}-${m}-${day}.pdf`;
}

function na(value: number): string {
  // Treat 0 as a real value — only undefined/null as N/A
  return rupees(value);
}

// ── State context (written by CalculatorPage into sessionStorage) ─────────────

interface StateCtx {
  stateId?: string;
  boardName?: string;
  scheduleId?: string;
}

function readStateCtx(): StateCtx {
  try {
    const raw = sessionStorage.getItem('ww-state-ctx');
    return raw ? (JSON.parse(raw) as StateCtx) : {};
  } catch {
    return {};
  }
}

// ── Main export function ──────────────────────────────────────────────────────

export async function exportComparisonPdf(result: ComparisonResult): Promise<Blob> {
  const { jsPDF, autoTable } = await loadJsPDF();

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const ctx = readStateCtx();
  const PAGE_W = 210;
  const MARGIN = 16;
  const CONTENT_W = PAGE_W - MARGIN * 2;

  let y = MARGIN;

  // ── Helper: add text with word-wrap and return new y ─────────────────────

  function addLine(text: string, opts: {
    size?: number; bold?: boolean; color?: [number, number, number];
    center?: boolean; indent?: number;
  } = {}): void {
    const { size = 10, bold = false, color = [30, 30, 30], center = false, indent = 0 } = opts;
    doc.setFontSize(size);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setTextColor(...color);
    const x = center ? PAGE_W / 2 : MARGIN + indent;
    const align = center ? 'center' : 'left';
    const lines = doc.splitTextToSize(text, CONTENT_W - indent);
    doc.text(lines, x, y, { align });
    y += (lines.length * size * 0.35278) + 2;
  }

  function gap(mm = 4): void {
    y += mm;
  }

  function hRule(color: [number, number, number] = [200, 200, 200]): void {
    doc.setDrawColor(...color);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 3;
  }

  // ── Add page numbers on every page ────────────────────────────────────────

  function addPageNumbers(): void {
    const total = doc.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${total}`, PAGE_W / 2, 292, { align: 'center' });
      doc.text(`Generated: ${now()}`, MARGIN, 292);
    }
  }

  // ── Cover / header ────────────────────────────────────────────────────────

  // Blue header bar
  doc.setFillColor(10, 22, 40);
  doc.rect(0, 0, PAGE_W, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('WattWise', MARGIN, 12);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Electricity Tariff Comparison Report', MARGIN, 19);
  doc.setFontSize(8);
  doc.text(`Generated: ${now()}`, PAGE_W - MARGIN, 24, { align: 'right' });

  y = 36;

  // ── Comparison summary ────────────────────────────────────────────────────

  addLine('COMPARISON DETAILS', { size: 9, bold: true, color: [80, 80, 80] });
  hRule();

  const { consumption, plans, bills, recommendedPlanId, explanation } = result;

  // Context from CalculatorPage (may be empty)
  if (ctx.stateId) {
    addLine(`State: ${ctx.stateId.toUpperCase()}`, { size: 9 });
  }
  if (ctx.boardName) {
    addLine(`DISCOM: ${ctx.boardName}`, { size: 9 });
  }
  if (ctx.scheduleId) {
    addLine(`Tariff schedule: ${ctx.scheduleId}`, { size: 9 });
  }
  if (consumption.providerName) {
    addLine(`Provider: ${consumption.providerName}`, { size: 9 });
  }
  if (consumption.tariffCode) {
    addLine(`Tariff code: ${consumption.tariffCode}`, { size: 9 });
  }
  addLine(`Billing period: ${consumption.billingPeriod === 'bimonthly' ? 'Bi-monthly (2 months)' : 'Monthly'}`, { size: 9 });
  addLine(`Consumer type: ${consumption.consumerType === 'household' ? 'Household' : 'Small Business'}`, { size: 9 });
  if (result.timestamp) {
    addLine(`Calculated at: ${formatDate(result.timestamp)}`, { size: 9 });
  }

  gap(2);

  // ── Consumption details ───────────────────────────────────────────────────

  addLine('CONSUMPTION DETAILS', { size: 9, bold: true, color: [80, 80, 80] });
  hRule();

  addLine(`Total units:       ${consumption.total.toFixed(2)} kWh`, { size: 9 });
  addLine(`Peak-hour units:   ${consumption.peak.toFixed(2)} kWh`, { size: 9 });
  addLine(`Shoulder units:    ${consumption.shoulder.toFixed(2)} kWh`, { size: 9 });
  addLine(`Off-peak units:    ${consumption.offPeak.toFixed(2)} kWh`, { size: 9 });

  gap(4);

  // ── Per-plan comparison table ─────────────────────────────────────────────

  // Build header from plan names
  const planHeaders = plans.map((p) => {
    const isRec = p.id === recommendedPlanId;
    return isRec ? `${p.name} (Recommended)` : p.name;
  });

  // Resolve bill by planId
  const billFor = (planId: string): BillBreakdown | undefined =>
    bills.find((b) => b.planId === planId);

  const rows: (string | number)[][] = [
    ['Off-peak charge',    ...plans.map((p) => na(billFor(p.id)?.offPeakCharge ?? 0))],
    ['Shoulder charge',   ...plans.map((p) => na(billFor(p.id)?.shoulderCharge ?? 0))],
    ['Peak charge',       ...plans.map((p) => na(billFor(p.id)?.peakCharge ?? 0))],
    ['Energy subtotal',   ...plans.map((p) => na(billFor(p.id)?.energyCharge ?? 0))],
    ['Fixed / supply charge', ...plans.map((p) => na(billFor(p.id)?.fixedCharge ?? 0))],
    ['Surcharge',         ...plans.map((p) => na(billFor(p.id)?.surcharge ?? 0))],
    ['Subtotal',          ...plans.map((p) => na(billFor(p.id)?.subtotal ?? 0))],
    ['Electricity duty',  ...plans.map((p) => na(billFor(p.id)?.duty ?? 0))],
    ['ESTIMATED TOTAL',   ...plans.map((p) => na(billFor(p.id)?.estimatedTotal ?? 0))],
    ['Effective INR/kWh', ...plans.map((p) => na(billFor(p.id)?.effectiveCostPerKwh ?? 0))],
  ];

  // Savings row (between first two plans)
  if (plans.length >= 2) {
    const b1 = billFor(plans[0].id)?.estimatedTotal ?? 0;
    const b2 = billFor(plans[1].id)?.estimatedTotal ?? 0;
    const diff = Math.abs(b1 - b2);
    const pct = b1 > 0 ? ((diff / Math.max(b1, b2)) * 100).toFixed(1) : '0.0';
    rows.push(['Difference', ...plans.map((_, i) => i === 0 ? rupees(diff) : `${pct}%`)]);
  }

  autoTable(doc, {
    startY: y,
    head: [['Charge Component', ...planHeaders]],
    body: rows,
    theme: 'striped',
    headStyles: {
      fillColor: [10, 22, 40],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: { fontSize: 8, cellPadding: 2 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 42 } },
    margin: { left: MARGIN, right: MARGIN },
    didDrawPage: (data) => {
      y = (data.cursor?.y ?? y) + 6;
    },
    willDrawCell: (data) => {
      // Highlight the ESTIMATED TOTAL row
      if (data.row.raw?.[0] === 'ESTIMATED TOTAL') {
        doc.setFillColor(10, 22, 40);
        doc.setTextColor(255, 255, 255);
      }
    },
  });

  // Update y after the table
  // @ts-expect-error jspdf-autotable adds lastAutoTable to the doc
  const tableEndY = (doc as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY;
  if (tableEndY) y = tableEndY + 6;

  // ── Winner & savings ──────────────────────────────────────────────────────

  const sorted = [...bills].sort((a, b) => a.estimatedTotal - b.estimatedTotal);
  const winner = sorted[0];
  const runner = sorted[1];

  if (winner) {
    // Check if new page needed
    if (y > 240) { doc.addPage(); y = MARGIN; }

    addLine('RECOMMENDATION', { size: 9, bold: true, color: [80, 80, 80] });
    hRule();
    addLine(`Recommended plan: ${winner.planName}`, { size: 11, bold: true, color: [10, 22, 40] });
    addLine(`Estimated total:  ${rupees(winner.estimatedTotal)}`, { size: 10 });

    if (runner) {
      const savings = runner.estimatedTotal - winner.estimatedTotal;
      const annualSavings = savings * (consumption.billingPeriod === 'bimonthly' ? 6 : 12);
      const pct = runner.estimatedTotal > 0
        ? ((savings / runner.estimatedTotal) * 100).toFixed(1)
        : '0.0';
      gap(2);
      addLine(`Monthly savings vs ${runner.planName}:  ${rupees(savings)}`, { size: 9 });
      addLine(`Estimated annual savings:              ${rupees(annualSavings)}`, { size: 9 });
      addLine(`Percentage difference:                 ${pct}%`, { size: 9 });
    }

    gap(4);
  }

  // ── Explanation ───────────────────────────────────────────────────────────

  if (explanation) {
    if (y > 240) { doc.addPage(); y = MARGIN; }
    addLine('WHY THIS PLAN IS CHEAPER', { size: 9, bold: true, color: [80, 80, 80] });
    hRule();
    addLine(explanation, { size: 9 });
    gap(3);
  }

  // ── Break-even impact ──────────────────────────────────────────────────────

  if (result.breakEven?.explanation) {
    if (y > 240) { doc.addPage(); y = MARGIN; }
    addLine('PEAK-USAGE IMPACT', { size: 9, bold: true, color: [80, 80, 80] });
    hRule();
    addLine(result.breakEven.explanation, { size: 9 });
    gap(3);
  }

  // ── Disclaimer ────────────────────────────────────────────────────────────

  if (y > 250) { doc.addPage(); y = MARGIN; }

  doc.setFillColor(248, 249, 250);
  const disclaimerBoxH = 26;
  doc.rect(MARGIN, y, CONTENT_W, disclaimerBoxH, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.rect(MARGIN, y, CONTENT_W, disclaimerBoxH, 'S');
  y += 4;

  addLine('DISCLAIMER', { size: 8, bold: true, color: [100, 100, 100], indent: 3 });
  addLine(
    'This report is an ESTIMATE ONLY based on the tariff rates and consumption data you entered. ' +
    'Actual electricity bills may differ due to meter readings, connection fees, arrears, revisions, ' +
    'subsidies, and other charges not reflected in this calculation. ' +
    'Always refer to your DISCOM\'s official tariff order and your actual bill for any disputes. ' +
    'Demo rates are illustrative and not from official tariff orders.',
    { size: 8, color: [80, 80, 80], indent: 3 },
  );

  // ── Page numbers ──────────────────────────────────────────────────────────

  addPageNumbers();

  return doc.output('blob');
}

/** Returns the standard filename for the downloaded PDF. */
export function getPdfFilename(): string {
  return todayFilename();
}
