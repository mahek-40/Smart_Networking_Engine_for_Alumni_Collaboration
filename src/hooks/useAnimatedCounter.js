import { useState, useEffect, useRef } from 'react';

const useAnimatedCounter = (target, duration = 2000, start = 0) => {
  const [count, setCount] = useState(start);
  const frameRef = useRef(null);
  const startTimeRef = useRef(null);
  const startedRef = useRef(false);

  const startAnimation = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    const step = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(start + (target - start) * eased));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };
    frameRef.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, []);

  return { count, startAnimation };
};

export default useAnimatedCounter;
