'use client';
import React from 'react';
import { useAppContext } from '@/components/AppContext';

export default function Sidebar() {
  const { activeTab, setActiveTab } = useAppContext();

  const navItems = [
    { id: 'dashboard', icon: 'fa-house', label: 'ダッシュボード' },
    { id: 'workout', icon: 'fa-dumbbell', label: '筋トレ' },
    { id: 'meal', icon: 'fa-bowl-food', label: '食事' },
    { id: 'equipment', icon: 'fa-book-open', label: '器具の使い方' },
    { id: 'map', icon: 'fa-map-location-dot', label: 'ジムマップ' },
  ];

  return (
    <aside className="sidebar" id="app-sidebar">
      
      <div className="sidebar-logo-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '20px 0 30px' }}>
        <span className="logo-text-premium" style={{ fontSize: '2.5rem', marginBottom: '5px', lineHeight: '1.2' }}>筋虎</span>
        <span style={{ fontSize: '0.75rem', color: '#DCA038', letterSpacing: '0.25em', fontWeight: 'bold' }}>- K I N T O R A -</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <i className={`fa-solid ${item.icon}`}></i>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <span className="footer-version">v1.0.0 (Next.js)</span>
      </div>
    </aside>
  );
}
