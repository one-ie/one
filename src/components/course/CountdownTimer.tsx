import React, { useState, useEffect } from "react";
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
  targetDate: string;
  currentPrice: string;
  originalPrice: string;
}

export function CountdownTimer({ targetDate, currentPrice, originalPrice }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      let newTimeLeft: TimeLeft = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      };

      if (difference > 0) {
        newTimeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }

      setTimeLeft(newTimeLeft);
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    // Cleanup
    return () => clearInterval(timer);
  }, [targetDate]);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="text-3xl md:text-4xl font-bold bg-primary/10 text-primary rounded-lg px-4 py-2 min-w-[80px]">
        {value.toString().padStart(2, '0')}
      </div>
      <div className="text-sm text-muted-foreground mt-2">{label}</div>
    </div>
  );

  return (
    <section className="py-20 bg-gradient-to-b from-primary/5 via-transparent to-transparent">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto p-8 text-center">
          <Badge variant="outline" className="mb-4">
            Special Launch Pricing Ends Soon
          </Badge>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Price Increases In:
          </h2>

          <div className="flex justify-center gap-4 md:gap-8 mb-8">
            <TimeUnit value={timeLeft.days} label="Days" />
            <TimeUnit value={timeLeft.hours} label="Hours" />
            <TimeUnit value={timeLeft.minutes} label="Minutes" />
            <TimeUnit value={timeLeft.seconds} label="Seconds" />
          </div>

          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <span className="text-xl text-muted-foreground line-through">${originalPrice}</span>
              <span className="text-3xl font-bold text-primary">${currentPrice}</span>
            </div>
            <Button size="lg" className="text-lg px-8 group">
              Lock In Launch Price Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-sm">
              Launch pricing ends soon. Don't miss out on the lowest price available.
            </span>
          </div>
        </Card>
      </div>
    </section>
  );
} 