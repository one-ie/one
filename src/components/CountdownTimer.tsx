'use client';

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: Date | string | number;
  className?: string;
  onComplete?: () => void;
}

export function CountdownTimer({ targetDate, className = '', onComplete }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateCountdown = () => {
      try {
        const endDate = new Date(targetDate);
        const now = new Date();
        
        // Add debug logging
        console.log('Target date:', endDate, 'Now:', now);
        
        // Calculate the difference in milliseconds
        let difference = endDate.getTime() - now.getTime();
        console.log('Time difference (ms):', difference);
        
        // If countdown is finished
        if (difference <= 0) {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
          if (onComplete) onComplete();
          return;
        }

        // Calculate all units
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        difference -= days * (1000 * 60 * 60 * 24);

        const hours = Math.floor(difference / (1000 * 60 * 60));
        difference -= hours * (1000 * 60 * 60);

        const minutes = Math.floor(difference / (1000 * 60));
        difference -= minutes * (1000 * 60);

        const seconds = Math.floor(difference / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } catch (error) {
        console.error('Error updating countdown:', error);
      }
    };

    // Update immediately and then every second
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, [targetDate, onComplete]);

  const timeUnits = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hours' },
    { value: timeLeft.minutes, label: 'Minutes' },
    { value: timeLeft.seconds, label: 'Seconds' }
  ];

  return (
    <div className={`inline-flex items-center justify-center gap-2 ${className}`}>
      {timeUnits.map((unit, index) => (
        <div key={unit.label} className="flex items-center">
          <div className="bg-[#1a1a1a] px-6 py-4 rounded-lg text-center min-w-[120px]">
            <div className="text-3xl font-bold text-white">{unit.value.toString().padStart(2, '0')}</div>
            <div className="text-sm text-[#aaaaaa] uppercase tracking-wide">{unit.label}</div>
          </div>
          {index < timeUnits.length - 1 && (
            <div className="text-3xl font-bold text-white mx-3">:</div>
          )}
        </div>
      ))}
    </div>
  );
}