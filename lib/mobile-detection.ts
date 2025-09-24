// Utility functions for mobile detection
export const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  
  // Check user agent for mobile devices
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // Mobile regex patterns
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  
  return mobileRegex.test(userAgent);
};

// Check for touch support (another indicator of mobile)
export const isTouchDevice = () => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Combined mobile check
export const isMobileOrTouchDevice = () => {
  return isMobileDevice() || isTouchDevice();
};

// Get device pixel ratio for high DPI screens
export const getDevicePixelRatio = () => {
  if (typeof window === 'undefined') return 1;
  return window.devicePixelRatio || 1;
};

// Check if device has reduced motion preference
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};