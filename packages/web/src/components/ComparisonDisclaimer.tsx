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
            Pulsyn is currently in <strong>pre-production</strong>. We have 52 connectors: 
            4 certified (integration tested), 8 verified (real drivers, pending tests), 
            and 40 preview (real API endpoints, community tested). 
            Comparisons are based on publicly documented features and pricing, not live head-to-head tests. 
            We&apos;re committed to honest marketing — see <a href="/certification" className="underline hover:text-yellow-200">/certification</a> for details.
          </p>
        </div>
      </div>
    </div>
  );
}
