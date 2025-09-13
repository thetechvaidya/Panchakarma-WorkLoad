import React, { useRef, useState, useEffect } from 'react';

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  leftAction?: { icon: string; color: string; label: string };
  rightAction?: { icon: string; color: string; label: string };
  className?: string;
  disabled?: boolean;
}

const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  leftAction,
  rightAction,
  className = '',
  disabled = false
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [showLeftAction, setShowLeftAction] = useState(false);
  const [showRightAction, setShowRightAction] = useState(false);

  const threshold = 100; // Minimum swipe distance to trigger action

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    
    const touch = e.touches[0];
    if (!touch) return;
    
    setStartX(touch.clientX);
    setStartY(touch.clientY);
    setCurrentX(0);
    setCurrentY(0);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || disabled) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    if (!touch) return;
    
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;
    
    setCurrentX(deltaX);
    setCurrentY(deltaY);
    
    // Show action hints
    setShowLeftAction(deltaX < -50 && !!leftAction && !!onSwipeLeft);
    setShowRightAction(deltaX > 50 && !!rightAction && !!onSwipeRight);
    
    // Apply transform
    if (cardRef.current) {
      cardRef.current.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) rotate(${deltaX * 0.1}deg)`;
      cardRef.current.style.opacity = `${1 - Math.abs(deltaX) / 300}`;
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging || disabled) return;
    
    setIsDragging(false);
    setShowLeftAction(false);
    setShowRightAction(false);
    
    const absDeltaX = Math.abs(currentX);
    const absDeltaY = Math.abs(currentY);
    
    // Reset card position
    if (cardRef.current) {
      cardRef.current.style.transform = '';
      cardRef.current.style.opacity = '';
    }
    
    // Determine swipe direction and trigger appropriate action
    if (absDeltaX > absDeltaY && absDeltaX > threshold) {
      if (currentX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (currentX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    } else if (absDeltaY > threshold) {
      if (currentY > 0 && onSwipeDown) {
        onSwipeDown();
      } else if (currentY < 0 && onSwipeUp) {
        onSwipeUp();
      }
    }
    
    setCurrentX(0);
    setCurrentY(0);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || disabled) return;
      
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      setCurrentX(deltaX);
      setCurrentY(deltaY);
      
      setShowLeftAction(deltaX < -50 && !!leftAction && !!onSwipeLeft);
      setShowRightAction(deltaX > 50 && !!rightAction && !!onSwipeRight);
      
      if (cardRef.current) {
        cardRef.current.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) rotate(${deltaX * 0.1}deg)`;
        cardRef.current.style.opacity = `${1 - Math.abs(deltaX) / 300}`;
      }
    };

    const handleMouseUp = () => {
      handleTouchEnd();
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startX, startY, disabled, leftAction, rightAction, onSwipeLeft, onSwipeRight]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    
    setStartX(e.clientX);
    setStartY(e.clientY);
    setCurrentX(0);
    setCurrentY(0);
    setIsDragging(true);
  };

  return (
    <div className="relative">
      {/* Left Action Indicator */}
      {showLeftAction && leftAction && (
        <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 ${leftAction.color} text-white p-4 rounded-r-lg z-10 animate-slide-up`}>
          <i className={`fas ${leftAction.icon} text-xl`}></i>
          <p className="text-xs mt-1">{leftAction.label}</p>
        </div>
      )}
      
      {/* Right Action Indicator */}
      {showRightAction && rightAction && (
        <div className={`absolute right-0 top-1/2 transform -translate-y-1/2 ${rightAction.color} text-white p-4 rounded-l-lg z-10 animate-slide-up`}>
          <i className={`fas ${rightAction.icon} text-xl`}></i>
          <p className="text-xs mt-1">{rightAction.label}</p>
        </div>
      )}
      
      {/* Main Card */}
      <div
        ref={cardRef}
        className={`relative bg-white rounded-xl shadow-mobile border border-gray-200 transition-all duration-200 ${
          isDragging ? 'cursor-grabbing z-20' : 'cursor-grab'
        } ${disabled ? 'cursor-default' : ''} ${className}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        style={{
          touchAction: disabled ? 'auto' : 'none',
          userSelect: 'none',
        }}
      >
        {children}
        
        {/* Swipe Hint */}
        {!disabled && (leftAction || rightAction) && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-1 text-gray-400 text-xs">
              <i className="fas fa-hand-paper"></i>
              <span>Swipe for actions</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SwipeableCard;