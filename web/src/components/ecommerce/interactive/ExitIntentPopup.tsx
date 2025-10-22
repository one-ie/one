/**
 * Exit Intent Popup Component
 * Triggers when mouse moves toward browser top (exit intent)
 * One-time offer with email capture and countdown timer
 * Uses localStorage to show only once per session
 * Requires client:load hydration
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toastActions } from '@/components/ecommerce/interactive/Toast';
import { Gift, Clock } from 'lucide-react';

const STORAGE_KEY = 'exit-intent-shown';
const COUNTDOWN_MINUTES = 10;

export function ExitIntentPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [timeLeft, setTimeLeft] = useState(COUNTDOWN_MINUTES * 60); // in seconds
  const [hasShown, setHasShown] = useState(false);

  // Check if already shown this session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const shown = sessionStorage.getItem(STORAGE_KEY);
      setHasShown(!!shown);
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsOpen(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Exit intent detection
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      // Detect mouse moving to top of screen (exit intent)
      if (e.clientY <= 10 && !hasShown) {
        setIsOpen(true);
        setHasShown(true);
        sessionStorage.setItem(STORAGE_KEY, 'true');
      }
    },
    [hasShown]
  );

  useEffect(() => {
    if (hasShown) return;

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [hasShown, handleMouseMove]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      toastActions.error('Please enter a valid email address');
      return;
    }

    // Store discount code in localStorage
    localStorage.setItem('discount-code', 'FIRST10');

    toastActions.success(
      'Discount Applied!',
      'Your 10% off code FIRST10 has been applied to your cart'
    );

    setIsOpen(false);
  };

  const handleDismiss = () => {
    setIsOpen(false);
  };

  // Format time left
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Gift className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Wait! Don't Leave Yet
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Get <span className="font-bold text-primary">10% off</span> your first order
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-center gap-2 rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-950">
            <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
              Offer expires in {timeDisplay}
            </p>
          </div>

          <DialogFooter className="sm:flex-col gap-2">
            <Button type="submit" size="lg" className="w-full">
              Get My 10% Discount
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleDismiss}
              className="w-full"
            >
              No thanks, I'll pay full price
            </Button>
          </DialogFooter>
        </form>

        <p className="text-xs text-center text-muted-foreground">
          One-time offer. Code will be applied automatically at checkout.
        </p>
      </DialogContent>
    </Dialog>
  );
}
