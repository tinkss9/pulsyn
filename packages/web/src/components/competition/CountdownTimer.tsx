'use client';

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: string;
  label?: string;
}

export default function CountdownTimer({ targetDate, label }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const blocks = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hours' },
    { value: timeLeft.minutes, label: 'Min' },
    { value: timeLeft.seconds, label: 'Sec' },
  ];

  return (
    <div className="text-center">
      {label && <div className="text-sm text-gray-400 mb-3">{label}</div>}
      <div className="flex gap-3 justify-center">
        {blocks.map((block) => (
          <div key={block.label} className="bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 min-w-[70px]">
            <div className="text-2xl font-bold font-mono text-white">
              {String(block.value).padStart(2, '0')}
            </div>
            <div className="text-xs text-gray-500 uppercase">{block.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
