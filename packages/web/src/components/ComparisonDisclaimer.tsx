// Comparison Disclaimer — shown on all /vs/ pages
export function ComparisonDisclaimer() {
  return (
    <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4 mb-8">
      <div className="flex items-start gap-3">
        <span className="text-yellow-400 text-lg mt-0.5">⚠</span>
        <div>
          <p className="text-yellow-200 text-sm font-medium mb-1">
            Transparency Notice
          </p>
          <p className="text-yellow-300/80 text-sm leading-relaxed">
            Pulsyn is currently in <strong>pre-production</strong>. Our core CDC engine works and has 145 passing tests,
            but we have not yet completed production benchmarking against the competitors listed below.
            The comparisons are based on publicly documented features and pricing, not live head-to-head tests.
            We&apos;re committed to honest marketing — if something changes, we&apos;ll update this page.
          </p>
        </div>
      </div>
    </div>
  );
}
