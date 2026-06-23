'use client';
import React, { useRef, useEffect, useState } from 'react';

interface WheelColumnProps {
  items: number[];
  value: number;
  onChange: (val: number) => void;
  suffix?: string;
}

function WheelColumn({ items, value, onChange, suffix = '' }: WheelColumnProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemHeight = 50;
  
  const [isDraggingStyle, setIsDraggingStyle] = useState(false);
  const isDraggingRef = useRef(false);
  const startPosY = useRef(0);
  const scrollStartY = useRef(0);
  
  const isProgrammaticScroll = useRef(false);
  const isMounted = useRef(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      isMounted.current = true;
    }, 150);
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    const applyScroll = () => {
      if (scrollRef.current) {
        const index = items.indexOf(value);
        if (index !== -1) {
          const targetScrollTop = index * itemHeight;
          if (Math.abs(scrollRef.current.scrollTop - targetScrollTop) > itemHeight / 2) {
            isProgrammaticScroll.current = true;
            scrollRef.current.scrollTop = targetScrollTop;
            setTimeout(() => {
              isProgrammaticScroll.current = false;
            }, 50);
          }
        }
      }
    };
    applyScroll();
    const timer = setTimeout(applyScroll, 50);
    return () => clearTimeout(timer);
  }, [value, items]);

  const handleScroll = () => {
    if (!scrollRef.current || !isMounted.current || isProgrammaticScroll.current) return;
    const scrollTop = scrollRef.current.scrollTop;
    const index = Math.round(scrollTop / itemHeight);
    if (index >= 0 && index < items.length) {
      const selectedValue = items[index];
      if (selectedValue !== value) {
        onChange(selectedValue);
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    isDraggingRef.current = true;
    setIsDraggingStyle(true);
    const pageY = 'touches' in e ? e.touches[0].pageY : e.pageY;
    startPosY.current = pageY - scrollRef.current!.offsetTop;
    scrollStartY.current = scrollRef.current!.scrollTop;
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDraggingRef.current || !scrollRef.current) return;
    e.preventDefault();
    const pageY = 'touches' in e ? e.touches[0].pageY : e.pageY;
    const walk = (startPosY.current - pageY);
    scrollRef.current.scrollTop = scrollStartY.current + walk;
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
    setIsDraggingStyle(false);
  };

  return (
    <div 
      ref={scrollRef}
      onScroll={handleScroll}
      onTouchStart={handleMouseDown}
      onTouchMove={handleMouseMove}
      onTouchEnd={handleMouseUpOrLeave}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          const idx = items.indexOf(value);
          if (idx > 0) onChange(items[idx - 1]);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          const idx = items.indexOf(value);
          if (idx < items.length - 1) onChange(items[idx + 1]);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          const next = scrollRef.current?.parentElement?.nextElementSibling?.firstElementChild;
          if (next instanceof HTMLElement) next.focus();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          const prev = scrollRef.current?.parentElement?.previousElementSibling?.firstElementChild;
          if (prev instanceof HTMLElement) prev.focus();
        }
      }}
      style={{ 
        flex: 1, 
        height: '250px', 
        overflowY: 'auto', 
        scrollSnapType: isDraggingStyle ? 'none' : 'y mandatory',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        position: 'relative',
        zIndex: 2,
        cursor: isDraggingStyle ? 'grabbing' : 'grab',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        outline: 'none'
      }}
      className="no-scrollbar wheel-col"
    >
      <div style={{ height: '100px' }}></div>
      {items.map(item => {
        const isSelected = item === value;
        return (
          <div 
            key={item} 
            style={{ 
              height: `${itemHeight}px`, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              scrollSnapAlign: 'center',
              fontSize: isSelected ? '1.8rem' : '1.3rem',
              fontWeight: isSelected ? 'bold' : 'normal',
              color: isSelected ? '#1e1e24' : '#adb5bd',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onClick={() => {
              if (scrollRef.current) {
                const index = items.indexOf(item);
                scrollRef.current.scrollTo({ top: index * itemHeight, behavior: 'smooth' });
              }
            }}
          >
            {item}
            <span style={{ fontSize: '1rem', marginLeft: '2px', color: isSelected ? '#495057' : '#ced4da' }}>{suffix}</span>
          </div>
        );
      })}
      <div style={{ height: '100px' }}></div>
    </div>
  );
}

export default function DateWheelPicker({ value, onChange, mode = 'full' }: { value: string, onChange: (val: string) => void, mode?: 'full' | 'year' }) {
  // value is YYYY-MM-DD
  const [year, month, day] = value.split('-').map(Number);
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - 99 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const maxDays = new Date(year, month, 0).getDate();
  const days = Array.from({ length: maxDays }, (_, i) => i + 1);

  const handleYearChange = (y: number) => {
    onChange(`${y}-${String(month).padStart(2, '0')}-${String(Math.min(day, new Date(y, month, 0).getDate())).padStart(2, '0')}`);
  }
  const handleMonthChange = (m: number) => {
    onChange(`${year}-${String(m).padStart(2, '0')}-${String(Math.min(day, new Date(year, m, 0).getDate())).padStart(2, '0')}`);
  }
  const handleDayChange = (d: number) => {
    onChange(`${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  }

  return (
    <div style={{ 
      display: 'flex', 
      width: '100%', 
      position: 'relative',
      maskImage: 'linear-gradient(to bottom, transparent, black 25%, black 75%, transparent)',
      WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 25%, black 75%, transparent)'
    }}>
      {/* Center Highlight Overlay */}
      <div style={{
        position: 'absolute',
        top: '100px',
        left: '5%',
        right: '5%',
        height: '50px',
        borderTop: '1px solid #ced4da',
        borderBottom: '1px solid #ced4da',
        background: 'rgba(26, 115, 232, 0.03)',
        pointerEvents: 'none',
        zIndex: 1,
        borderRadius: '8px'
      }}></div>
      
      <div style={{ flex: 1 }} className="wheel-col-container">
        <WheelColumn items={years} value={year} onChange={handleYearChange} suffix="年" />
      </div>
      {mode === 'full' && (
        <>
          <div style={{ flex: 1 }} className="wheel-col-container">
            <WheelColumn items={months} value={month} onChange={handleMonthChange} suffix="月" />
          </div>
          <div style={{ flex: 1 }} className="wheel-col-container">
            <WheelColumn items={days} value={day} onChange={handleDayChange} suffix="日" />
          </div>
        </>
      )}
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .wheel-col:focus {
          background: rgba(26, 115, 232, 0.03);
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}
