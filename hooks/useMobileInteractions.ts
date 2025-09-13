import { useCallback, useRef, useState, useEffect } from 'react';

// Haptic Feedback Types
export enum HapticType {
  LIGHT = 'light',
  MEDIUM = 'medium',
  HEAVY = 'heavy',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  SELECTION = 'selection'
}

// Haptic Feedback Hook
export const useHapticFeedback = () => {
  const triggerHaptic = useCallback((type: HapticType = HapticType.LIGHT) => {
    // Check if device supports haptic feedback
    if ('vibrate' in navigator) {
      let pattern: number | number[];
      
      switch (type) {
        case HapticType.LIGHT:
          pattern = 50;
          break;
        case HapticType.MEDIUM:
          pattern = 100;
          break;
        case HapticType.HEAVY:
          pattern = 200;
          break;
        case HapticType.SUCCESS:
          pattern = [50, 50, 50];
          break;
        case HapticType.WARNING:
          pattern = [100, 50, 100];
          break;
        case HapticType.ERROR:
          pattern = [200, 100, 200, 100, 200];
          break;
        case HapticType.SELECTION:
          pattern = 25;
          break;
        default:
          pattern = 50;
      }
      
      navigator.vibrate(pattern);
    }
    
    // iOS Haptic Feedback (if available)
    if ('hapticFeedback' in window) {
      try {
        switch (type) {
          case HapticType.LIGHT:
            (window as any).hapticFeedback.impact('light');
            break;
          case HapticType.MEDIUM:
            (window as any).hapticFeedback.impact('medium');
            break;
          case HapticType.HEAVY:
            (window as any).hapticFeedback.impact('heavy');
            break;
          case HapticType.SUCCESS:
            (window as any).hapticFeedback.notification('success');
            break;
          case HapticType.WARNING:
            (window as any).hapticFeedback.notification('warning');
            break;
          case HapticType.ERROR:
            (window as any).hapticFeedback.notification('error');
            break;
          case HapticType.SELECTION:
            (window as any).hapticFeedback.selection();
            break;
        }
      } catch (error) {
        console.warn('Haptic feedback not available:', error);
      }
    }
  }, []);

  return { triggerHaptic };
};

// Touch Gesture Types
export interface TouchGestureCallbacks {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinchIn?: (scale: number) => void;
  onPinchOut?: (scale: number) => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  onTap?: () => void;
}

export interface TouchGestureOptions {
  swipeThreshold?: number;
  longPressDelay?: number;
  doubleTapDelay?: number;
  pinchThreshold?: number;
  preventDefault?: boolean;
}

// Touch Gestures Hook
export const useTouchGestures = (
  callbacks: TouchGestureCallbacks,
  options: TouchGestureOptions = {}
) => {
  const {
    swipeThreshold = 50,
    longPressDelay = 500,
    doubleTapDelay = 300,
    pinchThreshold = 0.1,
    preventDefault = true
  } = options;

  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTap = useRef<number>(0);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const initialPinchDistance = useRef<number>(0);
  const [isLongPressing, setIsLongPressing] = useState(false);

  const getTouchDistance = (touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (preventDefault) {
      e.preventDefault();
    }

    const touch = e.touches[0];
    const now = Date.now();

    if (e.touches.length === 1 && touch) {
      touchStart.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: now
      };

      // Start long press timer
      if (callbacks.onLongPress) {
        longPressTimer.current = setTimeout(() => {
          setIsLongPressing(true);
          callbacks.onLongPress?.();
        }, longPressDelay);
      }
    } else if (e.touches.length === 2 && e.touches[0] && e.touches[1]) {
      // Start pinch gesture
      initialPinchDistance.current = getTouchDistance(e.touches[0], e.touches[1]);
      
      // Clear long press timer
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }
  }, [callbacks, longPressDelay, preventDefault]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (preventDefault) {
      e.preventDefault();
    }

    // Handle pinch gestures
    if (e.touches.length === 2 && e.touches[0] && e.touches[1] && initialPinchDistance.current > 0) {
      const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / initialPinchDistance.current;
      
      if (Math.abs(scale - 1) > pinchThreshold) {
        if (scale > 1 && callbacks.onPinchOut) {
          callbacks.onPinchOut(scale);
        } else if (scale < 1 && callbacks.onPinchIn) {
          callbacks.onPinchIn(scale);
        }
      }
    }

    // Cancel long press if finger moves too much
    if (touchStart.current && longPressTimer.current && e.touches[0]) {
      const touch = e.touches[0];
      const deltaX = Math.abs(touch.clientX - touchStart.current.x);
      const deltaY = Math.abs(touch.clientY - touchStart.current.y);
      
      if (deltaX > 10 || deltaY > 10) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }
  }, [callbacks, pinchThreshold, preventDefault]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (preventDefault) {
      e.preventDefault();
    }

    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (isLongPressing) {
      setIsLongPressing(false);
      return;
    }

    if (!touchStart.current || e.touches.length > 0) {
      return;
    }

    const touch = e.changedTouches[0];
    if (!touch) return;
    
    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;
    const deltaTime = Date.now() - touchStart.current.time;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Handle swipe gestures
    if (distance > swipeThreshold && deltaTime < 500) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0 && callbacks.onSwipeRight) {
          callbacks.onSwipeRight();
        } else if (deltaX < 0 && callbacks.onSwipeLeft) {
          callbacks.onSwipeLeft();
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && callbacks.onSwipeDown) {
          callbacks.onSwipeDown();
        } else if (deltaY < 0 && callbacks.onSwipeUp) {
          callbacks.onSwipeUp();
        }
      }
    } 
    // Handle tap gestures
    else if (distance < 10 && deltaTime < 500) {
      const now = Date.now();
      
      // Check for double tap
      if (now - lastTap.current < doubleTapDelay && callbacks.onDoubleTap) {
        callbacks.onDoubleTap();
        lastTap.current = 0; // Reset to prevent triple tap
      } else {
        lastTap.current = now;
        
        // Delayed single tap (to allow for double tap detection)
        setTimeout(() => {
          if (lastTap.current === now && callbacks.onTap) {
            callbacks.onTap();
          }
        }, doubleTapDelay);
      }
    }

    touchStart.current = null;
    initialPinchDistance.current = 0;
  }, [callbacks, swipeThreshold, doubleTapDelay, isLongPressing, preventDefault]);

  const attachGestureListeners = useCallback((element: HTMLElement | null) => {
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: !preventDefault });
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventDefault });
    element.addEventListener('touchend', handleTouchEnd, { passive: !preventDefault });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, preventDefault]);

  return { attachGestureListeners, isLongPressing };
};

// Device Capabilities Hook
export const useDeviceCapabilities = () => {
  const [capabilities, setCapabilities] = useState({
    hasTouch: false,
    hasHaptic: false,
    hasGyroscope: false,
    hasAccelerometer: false,
    hasCamera: false,
    hasGeolocation: false,
    isStandalone: false,
    orientation: 'portrait' as 'portrait' | 'landscape'
  });

  useEffect(() => {
    const checkCapabilities = async () => {
      const newCapabilities = {
        hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        hasHaptic: 'vibrate' in navigator || 'hapticFeedback' in window,
        hasGyroscope: 'DeviceOrientationEvent' in window,
        hasAccelerometer: 'DeviceMotionEvent' in window,
        hasCamera: false,
        hasGeolocation: 'geolocation' in navigator,
        isStandalone: window.matchMedia('(display-mode: standalone)').matches || 
                     (window.navigator as any).standalone === true,
        orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      };

      // Check camera capability
      try {
        if (navigator.mediaDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          newCapabilities.hasCamera = devices.some(device => device.kind === 'videoinput');
        }
      } catch (error) {
        console.warn('Could not check camera capability:', error);
      }

      setCapabilities(newCapabilities as typeof capabilities);
    };

    checkCapabilities();

    // Listen for orientation changes
    const handleOrientationChange = () => {
      setCapabilities(prev => ({
        ...prev,
        orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      }));
    };

    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return capabilities;
};

// Pull to Refresh Hook
export const usePullToRefresh = (onRefresh: () => Promise<void> | void, threshold = 100) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const currentY = useRef(0);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (window.scrollY === 0 && e.touches[0]) {
      startY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isRefreshing || window.scrollY > 0 || !e.touches[0]) return;

    currentY.current = e.touches[0].clientY;
    const distance = currentY.current - startY.current;

    if (distance > 0) {
      e.preventDefault();
      setPullDistance(Math.min(distance, threshold * 1.5));
    }
  }, [isRefreshing, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
    startY.current = 0;
    currentY.current = 0;
  }, [pullDistance, threshold, isRefreshing, onRefresh]);

  const attachPullToRefresh = useCallback((element: HTMLElement | null) => {
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    attachPullToRefresh,
    isRefreshing,
    pullDistance,
    pullProgress: Math.min(pullDistance / threshold, 1)
  };
};

// Screen Wake Lock Hook
export const useWakeLock = () => {
  const [isActive, setIsActive] = useState(false);
  const wakeLock = useRef<any>(null);

  const requestWakeLock = useCallback(async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLock.current = await (navigator as any).wakeLock.request('screen');
        setIsActive(true);
        
        wakeLock.current.addEventListener('release', () => {
          setIsActive(false);
        });
      }
    } catch (error) {
      console.warn('Wake lock request failed:', error);
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLock.current) {
      await wakeLock.current.release();
      wakeLock.current = null;
      setIsActive(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (wakeLock.current) {
        wakeLock.current.release();
      }
    };
  }, []);

  return { requestWakeLock, releaseWakeLock, isActive };
};