'use client';
import React from 'react';
import { useAppContext } from '@/components/AppContext';

export default function Sidebar() {
  const { activeTab, setActiveTab } = useAppContext();

  const navItems = [
    { id: 'dashboard', icon: 'fa-chart-simple', label: 'ダッシュボード' },
    { id: 'workout', icon: 'fa-calendar-check', label: '筋トレ記録' },
    { id: 'meal', icon: 'fa-utensils', label: '食事管理' },
    { id: 'equipment', icon: 'fa-dumbbell', label: '器具ガイド＆プラン' },
    { id: 'map', icon: 'fa-map-location-dot', label: 'ジム探し' },
  ];

  return (
    <aside className="sidebar" id="app-sidebar">
      
      <div className="sidebar-logo-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '20px 0 30px' }}>
        <img src="/images/logo.png" alt="logo" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', marginBottom: '10px' }} />
        <span className="logo-text-premium">筋虎</span>
        <span className="logo-subtext">K I N T O R A</span>
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
