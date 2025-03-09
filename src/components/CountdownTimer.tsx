'use client';

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: Date | string | number;
  className?: string;
  onComplete?: () => void;
}

export function CountdownTimer({ targetDate, className = '', onComplete }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = Math.max(0, target - now);
      
      if (difference <= 0 && onComplete) {
        onComplete();
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onComplete]);

  const timeUnits = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hours' },
    { value: timeLeft.minutes, label: 'Minutes' },
    { value: timeLeft.seconds, label: 'Seconds' }
  ];

  return (
    <div className={`flex flex-wrap justify-center gap-4 ${className}`}>
      {timeUnits.map((unit) => (
          <div className="bg-[#1a1a1a] px-4 py-3 md:px-6 md:py-4 rounded-lg min-w-[100px] text-center">
            <div className="text-2xl md:text-3xl font-bold text-white">{unit.value}</div>
            <div className="text-xs md:text-sm text-[#aaaaaa] uppercase tracking-wide">{unit.label}</div>
          </div>
      ))}
    </div>
  );
} 