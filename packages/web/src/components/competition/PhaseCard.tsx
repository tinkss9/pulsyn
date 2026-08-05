import { LucideIcon } from 'lucide-react';

interface PhaseCardProps {
  phaseNumber: number;
  name: string;
  status: 'active' | 'upcoming' | 'completed';
  weeks: string;
  participants: string;
  entry: string;
  prize: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

export default function PhaseCard({
  phaseNumber,
  name,
  status,
  weeks,
  participants,
  entry,
  prize,
  description,
  icon: Icon,
  color,
}: PhaseCardProps) {
  return (
    <div 
      className={`relative bg-white/[0.02] border rounded-2xl p-6 hover:bg-white/[0.04] transition-all ${
        status === 'active' 
          ? `border-${color}-500/30 shadow-lg shadow-${color}-500/10` 
          : status === 'completed'
          ? 'border-green-500/20'
          : 'border-white/5'
      }`}
    >
      {status === 'active' && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          LIVE NOW
        </div>
      )}
      {status === 'completed' && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          COMPLETED
        </div>
      )}
      
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl bg-${color}-500/10 flex items-center justify-center`}>
          <Icon className={`w-5 h-5 text-${color}-400`} />
        </div>
        <div>
          <div className="text-xs text-gray-500">Phase {phaseNumber}</div>
          <div className="font-semibold">{name}</div>
        </div>
      </div>
      
      <p className="text-sm text-gray-400 mb-4">{description}</p>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Duration</span>
          <span className="text-gray-300">{weeks}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Participants</span>
          <span className="text-gray-300">{participants}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Entry</span>
          <span className="text-gray-300">{entry}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Prize</span>
          <span className="text-amber-400 font-semibold">{prize}</span>
        </div>
      </div>
    </div>
  );
}
