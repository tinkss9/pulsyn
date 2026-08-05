interface ScoreDisplayProps {
  score: number;
  rowsPerSec: number;
  dataIntegrity: number;
  checkpointRecovery: number;
  maskingEfficiency: number;
  compact?: boolean;
}

export default function ScoreDisplay({
  score,
  rowsPerSec,
  dataIntegrity,
  checkpointRecovery,
  maskingEfficiency,
  compact = false,
}: ScoreDisplayProps) {
  if (compact) {
    return (
      <div className="font-mono text-amber-400">
        {score.toLocaleString()}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-3xl font-bold font-mono text-amber-400">
        {score.toLocaleString()}
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-white/[0.02] rounded-lg p-3">
          <div className="text-gray-500 text-xs mb-1">Rows/sec (40%)</div>
          <div className="font-mono text-cyan-400">{rowsPerSec.toLocaleString()}</div>
        </div>
        <div className="bg-white/[0.02] rounded-lg p-3">
          <div className="text-gray-500 text-xs mb-1">Integrity (30%)</div>
          <div className="font-mono text-green-400">{dataIntegrity}%</div>
        </div>
        <div className="bg-white/[0.02] rounded-lg p-3">
          <div className="text-gray-500 text-xs mb-1">Recovery (20%)</div>
          <div className="font-mono text-purple-400">{checkpointRecovery}%</div>
        </div>
        <div className="bg-white/[0.02] rounded-lg p-3">
          <div className="text-gray-500 text-xs mb-1">Masking (10%)</div>
          <div className="font-mono text-amber-400">{maskingEfficiency}%</div>
        </div>
      </div>
    </div>
  );
}
