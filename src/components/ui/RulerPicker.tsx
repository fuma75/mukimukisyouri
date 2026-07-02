'use client';
import React, { useRef, useEffect, useState } from 'react';

interface RulerPickerProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (val: number) => void;
  orientation?: 'horizontal' | 'vertical';
  tickColor?: string;
  labelColor?: string;
}

export default function RulerPicker({ min, max, step, value, onChange, orientation = 'horizontal', tickColor = '#e9ecef', labelColor = '#adb5bd' }: RulerPickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDraggingStyle, setIsDraggingStyle] = useState(false);
  const isDraggingRef = useRef(false);
  const startPos = useRef(0);
  const scrollStartPos = useRef(0);
  const isProgrammaticScroll = useRef(false);
  const isMounted = useRef(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      isMounted.current = true;
    }, 150);
    return () => clearTimeout(timer);
  }, []);
  
  // Settings
  const tickSpacing = 10; // px per step
  const numTicks = Math.round((max - min) / step);
  const totalLength = numTicks * tickSpacing;
  
  useEffect(() => {
    const applyScroll = () => {
      if (scrollRef.current && !isDraggingStyle) {
        const valOffset = ((value - min) / step) * tickSpacing;
        const currentScroll = orientation === 'horizontal' ? scrollRef.current.scrollLeft : scrollRef.current.scrollTop;
        if (Math.abs(currentScroll - valOffset) > 1) {
          isProgrammaticScroll.current = true;
          if (orientation === 'horizontal') {
            scrollRef.current.scrollLeft = valOffset;
          } else {
            scrollRef.current.scrollTop = valOffset;
          }
          setTimeout(() => {
            isProgrammaticScroll.current = false;
          }, 50);
        }
      }
    };
    applyScroll();
    const timer = setTimeout(applyScroll, 50); // Retry after layout
    return () => clearTimeout(timer);
  }, [value, min, step, isDraggingStyle, orientation]);

  const handleScroll = () => {
    if (!scrollRef.current || !isMounted.current || isProgrammaticScroll.current) return;
    
    const scrollPos = orientation === 'horizontal' 
      ? scrollRef.current.scrollLeft 
      : scrollRef.current.scrollTop;
      
    const computedVal = min + (scrollPos / tickSpacing) * step;
    let finalVal = Math.min(Math.max(computedVal, min), max);
    
    const fixedVal = Number(finalVal.toFixed(step < 1 ? 1 : 0));
    if (fixedVal !== value) {
      onChange(fixedVal);
    }
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    isDraggingRef.current = true;
    setIsDraggingStyle(true);
    
    const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX;
    const pageY = 'touches' in e ? e.touches[0].pageY : e.pageY;
    
    if (orientation === 'horizontal') {
      startPos.current = pageX - scrollRef.current!.offsetLeft;
      scrollStartPos.current = scrollRef.current!.scrollLeft;
    } else {
      startPos.current = pageY - scrollRef.current!.offsetTop;
      scrollStartPos.current = scrollRef.current!.scrollTop;
    }
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDraggingRef.current || !scrollRef.current) return;
    
    const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX;
    const pageY = 'touches' in e ? e.touches[0].pageY : e.pageY;

    if (orientation === 'horizontal') {
      const x = pageX - scrollRef.current.offsetLeft;
      const walk = (startPos.current - x); 
      scrollRef.current.scrollLeft = scrollStartPos.current + walk;
    } else {
      const y = pageY - scrollRef.current.offsetTop;
      const walk = (startPos.current - y);
      scrollRef.current.scrollTop = scrollStartPos.current + walk;
    }
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
    setIsDraggingStyle(false);
  };

  const ticks = [];
  const ticksPerNumber = step < 1 ? Math.round(1 / step) : 10;

  for (let i = 0; i <= numTicks; i++) {
    const isMajor = i % ticksPerNumber === 0;
    const isMedium = i % (ticksPerNumber / 2) === 0;
    const tickValue = min + i * step;

    if (orientation === 'horizontal') {
      ticks.push(
        <div key={i} style={{
          position: 'absolute',
          left: `${i * tickSpacing}px`,
          bottom: 20, // push up so numbers fit below
          width: '2px',
          height: isMajor ? '40px' : isMedium ? '25px' : '15px',
          backgroundColor: tickColor,
          transform: 'translateX(-50%)'
        }}>
          {isMajor && (
            <div style={{
              position: 'absolute',
              top: '45px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '14px',
              color: labelColor,
              fontWeight: 'bold'
            }}>
              {Number(tickValue.toFixed(0))}
            </div>
          )}
        </div>
      );
    } else {
      ticks.push(
        <div key={i} style={{
          position: 'absolute',
          top: `${i * tickSpacing}px`,
          left: 0,
          height: '2px',
          width: isMajor ? '40px' : isMedium ? '25px' : '15px',
          backgroundColor: tickColor,
          transform: 'translateY(-50%)'
        }}>
          {isMajor && (
            <div style={{
              position: 'absolute',
              left: '50px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '14px',
              color: labelColor,
              fontWeight: 'bold'
            }}>
              {Number(tickValue.toFixed(0))}
            </div>
          )}
        </div>
      );
    }
  }

  if (orientation === 'horizontal') {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100px', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          left: '50%',
          bottom: 30, // matches bottom of ticks
          width: '3px',
          height: '50px',
          backgroundColor: 'var(--primary)',
          transform: 'translateX(-50%)',
          zIndex: 10,
          borderRadius: '2px'
        }} />

        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUpOrLeave}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') {
              e.preventDefault();
              let nextVal = value - step;
              nextVal = Number(nextVal.toFixed(step < 1 ? 1 : 0));
              nextVal = Math.max(min, nextVal);
              if (nextVal !== value) onChange(nextVal);
            } else if (e.key === 'ArrowRight') {
              e.preventDefault();
              let nextVal = value + step;
              nextVal = Number(nextVal.toFixed(step < 1 ? 1 : 0));
              nextVal = Math.min(max, nextVal);
              if (nextVal !== value) onChange(nextVal);
            }
          }}
          style={{ width: '100%', height: '100%', overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', cursor: isDraggingStyle ? 'grabbing' : 'grab', userSelect: 'none', WebkitUserSelect: 'none', outline: 'none' }}
          className="no-scrollbar ruler-col"
        >
          <div style={{ position: 'relative', width: `${totalLength}px`, height: '100%', paddingLeft: '50%', paddingRight: '50%', boxSizing: 'content-box' }}>
            <div style={{ position: 'relative', height: '100%', width: `${totalLength}px` }}>
              {ticks}
            </div>
          </div>
        </div>
        <style>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .ruler-col:focus {
            box-shadow: inset 0 0 0 2px rgba(245, 158, 11, 0.4);
            border-radius: 8px;
          }
        `}</style>
      </div>
    );
  } else {
    // Vertical
    // Notice height is fixed to 300px, so padding is 150px
    return (
      <div style={{ position: 'relative', width: '100px', height: '300px', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: 10,
          height: '3px',
          width: '50px',
          backgroundColor: 'var(--primary)',
          transform: 'translateY(-50%)',
          zIndex: 10,
          borderRadius: '2px'
        }} />

        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUpOrLeave}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowUp') {
              e.preventDefault();
              let nextVal = value - step;
              nextVal = Number(nextVal.toFixed(step < 1 ? 1 : 0));
              nextVal = Math.max(min, nextVal);
              if (nextVal !== value) onChange(nextVal);
            } else if (e.key === 'ArrowDown') {
              e.preventDefault();
              let nextVal = value + step;
              nextVal = Number(nextVal.toFixed(step < 1 ? 1 : 0));
              nextVal = Math.min(max, nextVal);
              if (nextVal !== value) onChange(nextVal);
            }
          }}
          style={{ width: '100%', height: '100%', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', cursor: isDraggingStyle ? 'grabbing' : 'grab', userSelect: 'none', WebkitUserSelect: 'none', outline: 'none' }}
          className="no-scrollbar ruler-col"
        >
          <div style={{ position: 'relative', height: `${totalLength}px`, width: '100%', paddingTop: '150px', paddingBottom: '150px', boxSizing: 'content-box' }}>
            <div style={{ position: 'relative', width: '100%', height: `${totalLength}px` }}>
              {ticks}
            </div>
          </div>
        </div>
        <style>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .ruler-col:focus {
            box-shadow: inset 0 0 0 2px rgba(245, 158, 11, 0.4);
            border-radius: 8px;
          }
        `}</style>
      </div>
    );
  }
}
