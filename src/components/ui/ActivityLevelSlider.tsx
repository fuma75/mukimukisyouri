'use client';
import React, { useRef, useEffect, useState } from 'react';

const SittingSvg = () => (
  <svg viewBox="0 0 100 100" width="110" height="110">
    {/* Desk */}
    <rect x="40" y="60" width="45" height="5" fill="var(--primary)" rx="2" />
    <rect x="75" y="65" width="5" height="25" fill="var(--primary)" rx="2" />
    {/* Laptop */}
    <rect x="45" y="55" width="22" height="5" fill="var(--primary)" rx="2" />
    <polygon points="62,55 75,30 80,30 67,55" fill="var(--primary)" />
    {/* Chair */}
    <rect x="15" y="60" width="30" height="5" fill="var(--primary)" rx="2" />
    <rect x="25" y="65" width="5" height="25" fill="var(--primary)" rx="2" />
    <rect x="10" y="25" width="5" height="40" fill="var(--primary)" rx="2" />
    
    {/* Person Head */}
    <circle cx="38" cy="20" r="10" fill="var(--primary)" />
    {/* Person Body */}
    <path d="M30 35 Q40 25 45 35 L45 55 L25 55 L25 40 Z" fill="var(--primary)" />
    {/* Leg */}
    <path d="M35 50 L55 50 L55 75" stroke="var(--primary)" strokeWidth="8" strokeLinecap="round" fill="none" strokeLinejoin="round" />
    
    {/* Arm */}
    <g>
      <animateTransform attributeName="transform" type="translate" values="0 0; 0 2; 0 0" dur="0.5s" repeatCount="indefinite" />
      <path d="M38 40 L50 50 L60 50" stroke="var(--primary)" strokeWidth="6" strokeLinecap="round" fill="none" strokeLinejoin="round">
        <animateTransform attributeName="transform" type="rotate" values="0 38 40; 5 38 40; 0 38 40" dur="0.5s" repeatCount="indefinite" />
      </path>
    </g>
  </svg>
);

const WalkingSvg = () => (
  <svg viewBox="0 0 100 100" width="110" height="110">
    <g transform="translate(100, 0) scale(-1, 1)">
      <g>
        <animateTransform attributeName="transform" type="translate" values="0 0; 0 3; 0 0; 0 3; 0 0" dur="1s" repeatCount="indefinite" />
        {/* Back arm */}
        <path stroke="var(--primary)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.4">
          <animate attributeName="d" dur="1s" repeatCount="indefinite" values="M50 35 L40 45 L35 55; M50 35 L50 48 L50 60; M50 35 L60 45 L65 55; M50 35 L50 48 L50 60; M50 35 L40 45 L35 55" />
        </path>
        {/* Back leg */}
        <path stroke="var(--primary)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.4">
          <animate attributeName="d" dur="1s" repeatCount="indefinite" values="M50 60 L60 75 L70 85; M50 60 L40 70 L45 80; M50 60 L35 75 L30 90; M50 60 L45 78 L45 95; M50 60 L60 75 L70 85" />
        </path>
        
        {/* Head & Body */}
        <circle cx="50" cy="20" r="10" fill="var(--primary)" />
        <path d="M43 35 Q50 25 57 35 L52 60 L48 60 Z" fill="var(--primary)" />
        
        {/* Front arm */}
        <path stroke="var(--primary)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <animate attributeName="d" dur="1s" repeatCount="indefinite" values="M50 35 L60 45 L65 55; M50 35 L50 48 L50 60; M50 35 L40 45 L35 55; M50 35 L50 48 L50 60; M50 35 L60 45 L65 55" />
        </path>
        {/* Front leg */}
        <path stroke="var(--primary)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <animate attributeName="d" dur="1s" repeatCount="indefinite" values="M50 60 L35 75 L30 90; M50 60 L45 78 L45 95; M50 60 L60 75 L70 85; M50 60 L40 70 L45 80; M50 60 L35 75 L30 90" />
        </path>
      </g>
    </g>
  </svg>
);

const RunningSvg = () => (
  <svg viewBox="0 0 100 100" width="110" height="110">
    <g transform="translate(100, 0) scale(-1, 1)">
      <g>
        <animateTransform attributeName="transform" type="translate" values="0 -2; 0 3; 0 -2; 0 3; 0 -2" dur="0.6s" repeatCount="indefinite" />
        {/* Back arm */}
        <path stroke="var(--primary)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.4">
          <animate attributeName="d" dur="0.6s" repeatCount="indefinite" values="M50 35 L35 45 L30 30; M50 35 L50 45 L40 50; M50 35 L60 45 L55 60; M50 35 L50 45 L40 50; M50 35 L35 45 L30 30" />
        </path>
        {/* Back leg */}
        <path stroke="var(--primary)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.4">
          <animate attributeName="d" dur="0.6s" repeatCount="indefinite" values="M50 60 L60 70 L75 85; M50 60 L35 60 L35 80; M50 60 L40 70 L35 85; M50 60 L45 80 L45 95; M50 60 L60 70 L75 85" />
        </path>
        
        {/* Head & Body */}
        <circle cx="50" cy="20" r="10" fill="var(--primary)" />
        <path d="M43 35 Q50 25 57 35 L52 60 L48 60 Z" fill="var(--primary)" />
        
        {/* Front arm */}
        <path stroke="var(--primary)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <animate attributeName="d" dur="0.6s" repeatCount="indefinite" values="M50 35 L60 45 L55 60; M50 35 L50 45 L40 50; M50 35 L35 45 L30 30; M50 35 L50 45 L40 50; M50 35 L60 45 L55 60" />
        </path>
        {/* Front leg */}
        <path stroke="var(--primary)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <animate attributeName="d" dur="0.6s" repeatCount="indefinite" values="M50 60 L40 70 L35 85; M50 60 L45 80 L45 95; M50 60 L60 70 L75 85; M50 60 L35 60 L35 80; M50 60 L40 70 L35 85" />
        </path>
      </g>
    </g>
  </svg>
);

const JumpingSvg = () => (
  <svg viewBox="0 0 100 100" width="110" height="110">
    <g>
      <animateTransform attributeName="transform" type="translate" values="0 0; 0 -10; 0 0" dur="1s" repeatCount="indefinite" />
      
      {/* Head & Body */}
      <circle cx="50" cy="20" r="10" fill="var(--primary)" />
      <path d="M43 35 Q50 25 57 35 L55 60 L45 60 Z" fill="var(--primary)" />
      
      {/* Left arm */}
      <path stroke="var(--primary)" strokeWidth="7" strokeLinecap="round" fill="none" strokeLinejoin="round">
        <animate attributeName="d" dur="1s" repeatCount="indefinite" values="M45 40 L43 55 L42 70; M45 40 L25 25 L15 10; M45 40 L43 55 L42 70" />
      </path>
      
      {/* Right arm */}
      <path stroke="var(--primary)" strokeWidth="7" strokeLinecap="round" fill="none" strokeLinejoin="round">
        <animate attributeName="d" dur="1s" repeatCount="indefinite" values="M55 40 L57 55 L58 70; M55 40 L75 25 L85 10; M55 40 L57 55 L58 70" />
      </path>
      
      {/* Left leg */}
      <path d="M48 60 L40 85" stroke="var(--primary)" strokeWidth="8" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" values="0 48 60; 30 48 60; 0 48 60" dur="1s" repeatCount="indefinite" />
      </path>
      
      {/* Right leg */}
      <path d="M52 60 L60 85" stroke="var(--primary)" strokeWidth="8" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" values="0 52 60; -30 52 60; 0 52 60" dur="1s" repeatCount="indefinite" />
      </path>
    </g>
  </svg>
);

const activities = [
  { id: '座学メイン', label: '1日中デスクの前に座っている', Component: SittingSvg },
  { id: '３０分', label: '時々運動したり、30分程度ウォーキングをする', Component: WalkingSvg },
  { id: '１時間', label: '毎日1時間以上の運動をしている', Component: JumpingSvg },
  { id: '運動大好き', label: '運動をするのが大好きで、もっと多くのエクササイズに挑戦したい', Component: RunningSvg },
];

export default function ActivityLevelSlider({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const [activeIndex, setActiveIndex] = useState(() => {
    const idx = activities.findIndex(a => a.id === value);
    return idx >= 0 ? idx : 0;
  });

  // Mouse Drag logic for PC
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [initialScrollLeft, setInitialScrollLeft] = useState(0);

  useEffect(() => {
    if (!value) {
      onChange(activities[0].id);
    }
  }, [value, onChange]);

  const handleScroll = () => {
    if (isProgrammaticScroll.current) return;
    if (containerRef.current) {
      const scrollLeft = containerRef.current.scrollLeft;
      const width = containerRef.current.clientWidth;
      const index = Math.round(scrollLeft / width);
      if (index !== activeIndex && index >= 0 && index < activities.length) {
        setActiveIndex(index);
        onChange(activities[index].id);
      }
    }
  };

  const scrollTo = (index: number, smooth: boolean = true) => {
    isProgrammaticScroll.current = true;
    if (containerRef.current) {
      const width = containerRef.current.clientWidth;
      containerRef.current.scrollTo({ left: index * width, behavior: smooth ? 'smooth' : 'auto' });
    }
    setActiveIndex(index);
    onChange(activities[index].id);
    
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, smooth ? 500 : 100);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setInitialScrollLeft(containerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth;
    const index = Math.round(containerRef.current.scrollLeft / width);
    scrollTo(index, true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    containerRef.current.scrollLeft = initialScrollLeft - walk;
  };

  return (
    <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* Visual Carousel */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={{
          width: '100%',
          display: 'flex',
          overflowX: 'auto',
          scrollSnapType: isDragging ? 'none' : 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        className="no-scrollbar"
      >
        <style>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .custom-range {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 24px;
            -webkit-appearance: none;
            appearance: none;
            background: transparent;
            outline: none;
            margin: 0;
            z-index: 2;
            cursor: pointer;
          }
          .custom-range::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 32px;
            height: 32px;
            background: #fff;
            border: 6px solid var(--primary);
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            margin-top: -4px;
          }
          .custom-range::-moz-range-thumb {
            width: 24px;
            height: 24px;
            background: #fff;
            border: 6px solid var(--primary);
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          }
        `}</style>
        {activities.map((act, i) => (
          <div 
            key={act.id} 
            style={{ 
              minWidth: '100%', 
              scrollSnapAlign: 'start',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px 0'
            }}
          >
            <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <act.Component />
            </div>
            <p style={{ textAlign: 'center', fontSize: '1.1rem', fontWeight: 'bold', color: '#1e1e24', marginTop: '5px', padding: '0 20px', minHeight: '40px' }}>
              {act.label}
            </p>
          </div>
        ))}
      </div>

      {/* Slideable Bar UI */}
      <div style={{ width: '100%', padding: '0 20px', marginTop: '0px' }}>
        <div style={{ position: 'relative', height: '32px', display: 'flex', alignItems: 'center' }}>
          
          {/* Track Background */}
          <div style={{ position: 'absolute', left: '16px', right: '16px', height: '16px', background: '#f4f6fb', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
            {activities.map((_, i) => (
              <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#dee2e6' }} />
            ))}
          </div>

          {/* Slider Input */}
          <input 
            type="range" 
            min="0" 
            max={activities.length - 1} 
            step="1"
            value={activeIndex}
            onChange={(e) => scrollTo(Number(e.target.value), false)}
            className="custom-range"
          />
        </div>
        
        {/* Labels under slider */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.9rem', color: '#495057', fontWeight: 'bold' }}>
          <span>座位がほとんど</span>
          <span>有効</span>
        </div>
      </div>

    </div>
  );
}
