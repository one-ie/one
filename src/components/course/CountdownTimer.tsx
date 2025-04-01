'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownTimerProps {
  className?: string;
  onComplete?: () => void;
  targetDate: string;
  currentPrice: string;
  originalPrice: string;
}

export function CountdownTimer({ className = '', onComplete, targetDate, currentPrice, originalPrice }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDateTime = new Date(targetDate);

    const updateCountdown = () => {
      try {
        const now = new Date();
        let difference = targetDateTime.getTime() - now.getTime();
        
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
    <section className={`py-12 ${className}`}>
      <Card className="max-w-4xl mx-auto p-8">
        <div className="text-center mb-6">
          <Badge variant="outline" className="mb-2">
            <Clock className="w-4 h-4 mr-1" />
            Pre-Launch Special Offer
          </Badge>
          <h3 className="text-2xl font-bold mb-2">Lock In Your Pre-Launch Price</h3>
          <div className="flex justify-center items-center gap-4 mb-4">
            <span className="text-2xl font-bold text-primary">${currentPrice}</span>
            <span className="text-lg text-muted-foreground line-through">${originalPrice}</span>
          </div>
          <p className="text-muted-foreground">
            Price increases after launch on {new Date(targetDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          {timeUnits.map((unit, index) => (
            <div key={unit.label} className="flex items-center">
              <div className="bg-primary/5 border border-primary/10 px-6 py-4 rounded-xl text-center min-w-[120px]">
                <div className="text-4xl font-bold text-primary">
                  {unit.value.toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">
                  {unit.label}
                </div>
              </div>
              {index < timeUnits.length - 1 && (
                <div className="text-3xl font-bold text-primary/50 mx-2">:</div>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Lock in your pre-launch price now and get full access when the course launches
        </p>
      </Card>
    </section>
  );
} 