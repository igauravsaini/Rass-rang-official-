import { useState, useEffect } from 'react';
import { EVENT_TARGET_TIMESTAMP } from '../lib/constants';

export interface CountdownValues {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  isStarted: boolean;
}

function calculateTimeRemaining(targetTimestamp: number): CountdownValues {
  const diff = targetTimestamp - Date.now();

  if (diff <= 0) {
    return {
      days: '00',
      hours: '00',
      minutes: '00',
      seconds: '00',
      isStarted: true,
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return {
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
    isStarted: false,
  };
}

export function useCountdown(targetTimestamp: number = EVENT_TARGET_TIMESTAMP): CountdownValues {
  // Synchronous initial value prevents flashing '00'
  const [timeLeft, setTimeLeft] = useState<CountdownValues>(() => calculateTimeRemaining(targetTimestamp));

  useEffect(() => {
    const update = () => {
      setTimeLeft(calculateTimeRemaining(targetTimestamp));
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [targetTimestamp]);

  return timeLeft;
}
