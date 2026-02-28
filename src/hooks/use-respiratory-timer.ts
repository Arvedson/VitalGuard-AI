import { useState, useCallback, useRef } from 'react';

export function useRespiratoryTimer(onChange: (bpm: number) => void) {
  const [breathStarts, setBreathStarts] = useState<number[]>([]);
  const breathStartsRef = useRef<number[]>([]);
  const [isHolding, setIsHolding] = useState(false);

  const handleStartHold = useCallback(() => {
    const now = Date.now();
    setIsHolding(true);
    
    const validStarts = breathStartsRef.current.filter(t => now - t < 15000);
    const newStarts = [...validStarts, now];
    breathStartsRef.current = newStarts;
    setBreathStarts(newStarts);

    if (newStarts.length > 1) {
      let totalInterval = 0;
      for (let i = 1; i < newStarts.length; i++) {
        totalInterval += newStarts[i] - newStarts[i - 1];
      }
      const avgInterval = totalInterval / (newStarts.length - 1);
      const currentBpm = Math.round(60000 / avgInterval);
      
      // Clamp between typical ranges (5 to 60)
      const finalBpm = Math.min(Math.max(currentBpm, 5), 60);
      onChange(finalBpm);
    }
  }, [onChange]);

  const handleEndHold = useCallback(() => {
    setIsHolding(false);
  }, []);

  const reset = useCallback(() => {
    breathStartsRef.current = [];
    setBreathStarts([]);
    setIsHolding(false);
  }, []);

  return { handleStartHold, handleEndHold, isHolding, reset };
}
