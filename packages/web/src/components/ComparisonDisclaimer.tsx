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
            Pulsyn has <strong>320 certified connectors</strong> (19 database engines + 301 SaaS integrations) 
            tested via Vitest live API tests and Docker database tests. 
            Comparisons are based on publicly documented features and pricing, not live head-to-head tests. 
            See <a href="/certification" className="underline hover:text-yellow-200">/certification</a> for methodology and pass rates.
          </p>
        </div>
      </div>
    </div>
  );
}
