'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownTimerProps {
  className?: string;
  onComplete?: () => void;
  targetDate?: string;
  currentPrice?: string;
  originalPrice?: string;
}

export function CountdownTimer({ 
  className = '', 
  onComplete, 
  targetDate = '2025-05-01T00:00:00',
  currentPrice = '999', 
  originalPrice = '1,999' 
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      try {
        const now = new Date().getTime();
        const target = new Date(targetDate).getTime();
        const difference = target - now;

        // Check if countdown has expired
        if (difference <= 0) {
          setIsExpired(true);
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
          if (onComplete) onComplete();
          return;
        }

        // Calculate time units
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } catch (error) {
        console.error('Error calculating time left:', error);
      }
    };

    // Update immediately and then every second
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    // Cleanup
    return () => clearInterval(timer);
  }, [targetDate, onComplete]);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      timeZone: 'UTC'
    });
  };

  const timeUnits = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hours' },
    { value: timeLeft.minutes, label: 'Minutes' },
    { value: timeLeft.seconds, label: 'Seconds' }
  ];

  if (isExpired) {
    return (
      <section className={`py-12 ${className}`}>
        <Card className="max-w-4xl mx-auto p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Launch Price Now Active</h2>
          <p className="text-lg text-muted-foreground mb-6">
            The pre-launch offer has ended. Current price: ${originalPrice}
          </p>
          <a href="#pricing" className="no-underline">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Get Started Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </a>
        </Card>
      </section>
    );
  }

  return (
    <section className={`py-12 ${className}`}>
      <Card className="max-w-4xl mx-auto p-8 text-center bg-gradient-to-b from-primary/5 to-background border-2 border-primary/20">
        <h2 className="text-2xl font-bold mb-2">Pre-Launch Special Offer</h2>
        <p className="text-lg text-muted-foreground mb-6">Lock In Pre-Launch Price</p>
        
        <div className="flex justify-center items-center gap-4 mb-8">
          <span className="text-4xl font-bold text-primary">${currentPrice}</span>
          <span className="text-xl text-muted-foreground line-through">${originalPrice}</span>
        </div>

        <p className="text-sm text-muted-foreground mb-8">
          Price increases after launch on {formatDate(targetDate)}
        </p>

        <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
          {timeUnits.map((unit) => (
            <div key={unit.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold bg-primary/10 rounded-lg p-4 mb-2">
                {formatNumber(unit.value)}
              </div>
              <div className="text-sm text-muted-foreground">
                {unit.label}
              </div>
            </div>
          ))}
        </div>

        <p className="text-sm text-muted-foreground mb-8">
          Lock in pre-launch price and get full access when the course launches
        </p>

        <a href="#pricing" className="no-underline">
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            Lock In Pre-Launch Price <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </a>
      </Card>
    </section>
  );
} 