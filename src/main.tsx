import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import PerformanceMonitor from './components/common/PerformanceMonitor.tsx';
import './index.css';

// Preload critical resources
const preloadCriticalResources = () => {
  // Preload fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.as = 'font';
  fontLink.type = 'font/woff2';
  fontLink.crossOrigin = 'anonymous';
  document.head.appendChild(fontLink);

  // Preload critical images
  const criticalImages = [
    'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
  ];

  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
};

// Initialize performance optimizations
const initializePerformance = () => {
  // Enable passive event listeners
  document.addEventListener('touchstart', () => {}, { passive: true });
  document.addEventListener('touchmove', () => {}, { passive: true });
  document.addEventListener('wheel', () => {}, { passive: true });

  // Optimize scroll performance
  if ('scrollBehavior' in document.documentElement.style) {
    document.documentElement.style.scrollBehavior = 'smooth';
  }

  // Preload critical resources
  preloadCriticalResources();
};

// Initialize app
const initApp = () => {
  initializePerformance();

  const root = createRoot(document.getElementById('root')!);
  
  root.render(
    <StrictMode>
      <PerformanceMonitor />
      <App />
    </StrictMode>
  );
};

// Start app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}