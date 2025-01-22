import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TimerProps {
  duration: number;
  onComplete: () => void;
}

export function Timer({ duration, onComplete }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft === 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  const progress = (timeLeft / duration) * 100;

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full transform -rotate-90">
        <motion.circle
          cx="64"
          cy="64"
          r="60"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeDasharray={`${progress * 3.77} 377`}
          initial={{ strokeDasharray: "377 377" }}
          animate={{ strokeDasharray: `${progress * 3.77} 377` }}
          transition={{ duration: 1 }}
          className="text-primary"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-4xl font-bold">{timeLeft}</span>
      </div>
    </div>
  );
}