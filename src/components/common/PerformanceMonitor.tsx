import React, { useEffect } from 'react';
import { trackWebVitals } from '../../utils/performance';

const PerformanceMonitor: React.FC = () => {
  useEffect(() => {
    // Track Web Vitals
    trackWebVitals();

    // Monitor memory usage
    const monitorMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
          console.warn('High memory usage detected');
        }
      }
    };

    const memoryInterval = setInterval(monitorMemory, 30000); // Check every 30 seconds

    // Monitor frame rate
    let frameCount = 0;
    let lastTime = performance.now();

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        if (fps < 30) {
          console.warn(`Low FPS detected: ${fps}`);
        }
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);

    return () => {
      clearInterval(memoryInterval);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default PerformanceMonitor;