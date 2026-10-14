/**
 * ComparisonExportActions.tsx
 *
 * Renders two buttons:
 *   1. "Download Comparison PDF"  — generates PDF from existing result, triggers download.
 *   2. "Print Comparison"         — triggers browser print dialog (print CSS hides UI chrome).
 *
 * Does NOT recalculate any bill. Receives the existing ComparisonResult as a prop.
 * Authentication is NOT required to download or print.
 */
import { useState, useCallback } from 'react';
import type { ComparisonResult } from '../types';
import { exportComparisonPdf, getPdfFilename } from '../utils/exportComparisonPdf';

interface Props {
  result: ComparisonResult | null;
}

type PdfStatus = 'idle' | 'generating' | 'done' | 'error';

export default function ComparisonExportActions({ result }: Props) {
  const [pdfStatus, setPdfStatus] = useState<PdfStatus>('idle');
  const [pdfError, setPdfError] = useState<string | null>(null);

  // ── PDF download ───────────────────────────────────────────────────────────

  const handleDownloadPdf = useCallback(async () => {
    if (!result || pdfStatus === 'generating') return;

    setPdfStatus('generating');
    setPdfError(null);

    try {
      const blob = await exportComparisonPdf(result);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = getPdfFilename();
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      setPdfStatus('done');
      // Reset status label after 3 s so the button returns to its normal state
      setTimeout(() => setPdfStatus('idle'), 3000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error generating PDF.';
      setPdfError(`Unable to generate PDF: ${msg}`);
      setPdfStatus('error');
    }
  }, [result, pdfStatus]);

  // ── Print ──────────────────────────────────────────────────────────────────

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // ── Labels ────────────────────────────────────────────────────────────────

  const pdfLabel =
    pdfStatus === 'generating' ? 'Generating PDF…' :
    pdfStatus === 'done'       ? 'Downloaded ✓'    :
    pdfStatus === 'error'      ? 'Retry PDF'        :
    'Download Comparison PDF';

  const isDisabled = !result || pdfStatus === 'generating';

  return (
    <div className="comparison-export-actions" aria-label="Export comparison report">

      {/* aria-live region for screen readers */}
      <p
        className="comparison-export-status"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {pdfStatus === 'generating' && 'Generating PDF report, please wait…'}
        {pdfStatus === 'done'       && 'PDF downloaded successfully.'}
        {pdfStatus === 'error'      && (pdfError ?? 'Unable to generate PDF.')}
      </p>

      {/* PDF download button */}
      <button
        type="button"
        className="btn btn-primary comparison-export-btn"
        onClick={() => void handleDownloadPdf()}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={pdfStatus === 'generating'}
        aria-label={
          !result
            ? 'Download PDF — no comparison result available'
            : pdfLabel
        }
      >
        📄 {pdfLabel}
      </button>

      {/* Print button */}
      <button
        type="button"
        className="btn btn-secondary comparison-export-btn"
        onClick={handlePrint}
        aria-label="Print the comparison report using the browser print dialog"
      >
        🖨 Print Comparison
      </button>

      {/* Error message (visible in UI, not just screen reader) */}
      {pdfStatus === 'error' && pdfError && (
        <p
          className="field-error comparison-export-error"
          role="alert"
          aria-live="assertive"
        >
          {pdfError}
        </p>
      )}
    </div>
  );
}
