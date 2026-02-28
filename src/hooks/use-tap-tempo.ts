import { useState, useCallback, useRef } from 'react';

export function useTapTempo(onChange: (bpm: number) => void) {
  const [taps, setTaps] = useState<number[]>([]);
  const tapsRef = useRef<number[]>([]);

  const handleTap = useCallback((e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const now = Date.now();
    
    const validTaps = tapsRef.current.filter(t => now - t < 5000);
    const newTaps = [...validTaps, now];
    tapsRef.current = newTaps;
    setTaps(newTaps);

    if (newTaps.length > 1) {
      let totalInterval = 0;
      for (let i = 1; i < newTaps.length; i++) {
        totalInterval += newTaps[i] - newTaps[i - 1];
      }
      const avgInterval = totalInterval / (newTaps.length - 1);
      const currentBpm = Math.round(60000 / avgInterval);
      
      // Clamp between typical ranges (40 to 220)
      const finalBpm = Math.min(Math.max(currentBpm, 40), 220);
      onChange(finalBpm);
    }
  }, [onChange]);

  return { handleTap, taps };
}
