/**
 * Countdown Timer Component
 * Displays countdown for sales/promotions with urgency styling
 * Auto-updates every second
 */

'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface CountdownTimerProps {
  endDate: Date;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  onComplete?: () => void;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function calculateTimeRemaining(endDate: Date): TimeRemaining {
  const total = endDate.getTime() - Date.now();

  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return { days, hours, minutes, seconds, total };
}

export function CountdownTimer({
  endDate,
  label = 'Sale ends in',
  size = 'md',
  onComplete
}: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(
    calculateTimeRemaining(endDate)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const time = calculateTimeRemaining(endDate);
      setTimeRemaining(time);

      if (time.total <= 0 && onComplete) {
        onComplete();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate, onComplete]);

  if (timeRemaining.total <= 0) {
    return (
      <div className="text-sm text-muted-foreground font-medium">
        Sale has ended
      </div>
    );
  }

  // Red color when less than 1 hour remaining
  const isUrgent = timeRemaining.total < 60 * 60 * 1000;
  const totalHours = timeRemaining.days * 24 + timeRemaining.hours;

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const digitClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`inline-flex flex-col gap-2 ${sizeClasses[size]}`}
    >
      {label && (
        <div className={`font-medium ${isUrgent ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`}>
          {label}
        </div>
      )}

      <div className="flex items-center gap-2">
        {/* Days (only show if > 0) */}
        {timeRemaining.days > 0 && (
          <>
            <TimeUnit
              value={timeRemaining.days}
              label="days"
              size={size}
              digitClass={digitClasses[size]}
              isUrgent={false}
            />
            <Separator size={size} />
          </>
        )}

        {/* Hours */}
        <TimeUnit
          value={totalHours}
          label="hrs"
          size={size}
          digitClass={digitClasses[size]}
          isUrgent={isUrgent}
        />
        <Separator size={size} />

        {/* Minutes */}
        <TimeUnit
          value={timeRemaining.minutes}
          label="min"
          size={size}
          digitClass={digitClasses[size]}
          isUrgent={isUrgent}
        />
        <Separator size={size} />

        {/* Seconds */}
        <TimeUnit
          value={timeRemaining.seconds}
          label="sec"
          size={size}
          digitClass={digitClasses[size]}
          isUrgent={isUrgent}
        />
      </div>
    </motion.div>
  );
}

interface TimeUnitProps {
  value: number;
  label: string;
  size: 'sm' | 'md' | 'lg';
  digitClass: string;
  isUrgent: boolean;
}

function TimeUnit({ value, label, size, digitClass, isUrgent }: TimeUnitProps) {
  return (
    <motion.div
      key={value}
      initial={{ scale: 1.2 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col items-center"
    >
      <div
        className={`font-bold tabular-nums ${digitClass} ${
          isUrgent
            ? 'text-red-600 dark:text-red-400'
            : 'text-foreground'
        }`}
      >
        {value.toString().padStart(2, '0')}
      </div>
      <div className={`text-xs text-muted-foreground uppercase ${size === 'sm' ? 'text-[10px]' : ''}`}>
        {label}
      </div>
    </motion.div>
  );
}

function Separator({ size }: { size: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'sm' ? 'text-lg' : size === 'md' ? 'text-2xl' : 'text-3xl';

  return (
    <div className={`font-bold text-muted-foreground ${sizeClass}`}>
      :
    </div>
  );
}
