'use client';
import React from 'react';
import { useAppContext } from '@/components/AppContext';

export default function Sidebar() {
  const { activeTab, setActiveTab, theme } = useAppContext();
  const isDark = theme === 'dark';

  const navItems = [
    { id: 'dashboard', icon: 'fa-house', label: 'ダッシュボード' },
    { id: 'workout', icon: 'fa-dumbbell', label: '筋トレ' },
    { id: 'meal', icon: 'fa-bowl-food', label: '食事' },
    { id: 'equipment', icon: 'fa-book-open', label: '知識＆コラム' },
    { id: 'muscle-map', icon: 'fa-chart-simple', label: '進捗＆分析' },
    { id: 'ai-coach', icon: 'fa-user', label: 'AI虎コーチ' },
    { id: 'profile', icon: 'fa-gear', label: '設定' },
  ];

  return (
    <aside className="sidebar" id="app-sidebar" style={{
      background: isDark ? '#050505' : '#FCF8F2',
      borderRight: isDark ? '1px solid #1f1f1f' : '1px solid #EBE4D6',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Tiger Watermark (Light Mode mostly, faint in dark) */}
      <div style={{
        position: 'absolute',
        top: '-5%',
        right: '-10%',
        width: '120%',
        height: '30%',
        background: isDark ? 'radial-gradient(circle, rgba(220,160,56,0.03) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(220,160,56,0.1) 0%, transparent 70%)',
        opacity: 0.5,
        pointerEvents: 'none',
        zIndex: 0
      }}></div>
      
      <div style={{
        position: 'absolute',
        top: '5%',
        right: '5%',
        fontSize: '120px',
        opacity: isDark ? 0.02 : 0.03,
        color: isDark ? '#ffffff' : '#000000',
        pointerEvents: 'none',
        zIndex: 0
      }}>
        <i className="fa-solid fa-tiger"></i>
      </div>

      <div className="sidebar-logo-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '40px 0 30px', position: 'relative', zIndex: 1 }}>
        <span className="logo-text-premium" style={{ 
          fontSize: '2.5rem', 
          marginBottom: '5px', 
          lineHeight: '1.2',
          color: isDark ? '#DCA038' : '#B58434',
          textShadow: isDark ? '0 2px 10px rgba(220,160,56,0.2)' : 'none'
        }}>筋虎</span>
        <span style={{ fontSize: '0.75rem', color: isDark ? '#DCA038' : '#B58434', letterSpacing: '0.25em', fontWeight: 'bold' }}>- K I N T O R A -</span>
      </div>

      <nav className="sidebar-nav" style={{ flex: 1, padding: '0 15px', position: 'relative', zIndex: 1 }}>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '15px 0',
                marginBottom: '5px',
                background: isActive 
                  ? (isDark ? 'linear-gradient(145deg, rgba(20,20,20,0.9), rgba(10,10,10,0.9))' : '#ffffff')
                  : 'transparent',
                border: 'none',
                borderRadius: '12px',
                borderLeft: isActive ? `4px solid ${isDark ? '#FDF0A6' : '#DCA038'}` : '4px solid transparent',
                borderTop: isActive && isDark ? '1px solid rgba(220,160,56,0.3)' : '1px solid transparent',
                borderBottom: isActive && isDark ? '1px solid rgba(220,160,56,0.1)' : '1px solid transparent',
                borderRight: isActive && isDark ? '1px solid rgba(220,160,56,0.1)' : '1px solid transparent',
                boxShadow: isActive 
                  ? (isDark ? '0 4px 15px rgba(220,160,56,0.15)' : '0 4px 15px rgba(0,0,0,0.05)')
                  : 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                borderBottomStyle: (!isActive && item.id !== 'profile') ? 'solid' : (isActive ? 'solid' : 'none'),
                borderBottomWidth: (!isActive && item.id !== 'profile') ? '1px' : (isActive ? '1px' : '0'),
                borderBottomColor: (!isActive && item.id !== 'profile') ? (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)') : (isActive && isDark ? 'rgba(220,160,56,0.1)' : 'transparent'),
              }}
            >
              <i className={`fa-solid ${item.icon}`} style={{ 
                fontSize: '1.8rem', 
                marginBottom: '8px',
                color: isActive 
                  ? (isDark ? '#FDF0A6' : '#DCA038') 
                  : (isDark ? '#B58434' : '#B58434'),
                textShadow: isActive && isDark ? '0 0 10px rgba(253,240,166,0.5)' : 'none'
              }}></i>
              <span style={{
                fontSize: '0.85rem',
                fontWeight: isActive ? 'bold' : 'normal',
                color: isActive 
                  ? (isDark ? '#FDF0A6' : '#111') 
                  : (isDark ? '#ffffff' : '#333'),
                letterSpacing: '0.05em'
              }}>{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="sidebar-footer" style={{ 
        padding: '20px', 
        textAlign: 'center',
        position: 'relative',
        zIndex: 1,
        borderTop: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)'
      }}>
        <span style={{ 
          fontSize: '0.7rem', 
          color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
          letterSpacing: '0.05em'
        }}>© KINTORA Inc.</span>
        
        {/* Scratches SVG */}
        <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '60px', height: '60px', opacity: isDark ? 0.3 : 0.4 }}>
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M70 10 Q 50 40 40 90" stroke={isDark ? "#DCA038" : "#B58434"} strokeWidth="3" strokeLinecap="round" style={{filter: "drop-shadow(0px 0px 2px rgba(220,160,56,0.5))"}}/>
            <path d="M85 20 Q 65 50 55 95" stroke={isDark ? "#DCA038" : "#B58434"} strokeWidth="4" strokeLinecap="round" style={{filter: "drop-shadow(0px 0px 2px rgba(220,160,56,0.5))"}}/>
            <path d="M100 30 Q 80 60 70 100" stroke={isDark ? "#DCA038" : "#B58434"} strokeWidth="3" strokeLinecap="round" style={{filter: "drop-shadow(0px 0px 2px rgba(220,160,56,0.5))"}}/>
          </svg>
        </div>
      </div>
    </aside>
  );
}
