'use client';
import React from 'react';
import { useAppContext } from '../AppContext';

export default function MobileNav() {
  const { activeTab, setActiveTab } = useAppContext();

  return (
    <nav className="mobile-nav">
      <button className={`mobile-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
        <i className="fa-solid fa-chart-simple"></i>
        <span>ホーム</span>
      </button>
      <button className={`mobile-nav-item ${activeTab === 'workout' ? 'active' : ''}`} onClick={() => setActiveTab('workout')}>
        <i className="fa-solid fa-calendar-check"></i>
        <span>筋トレ</span>
      </button>
      <button className={`mobile-nav-item ${activeTab === 'meal' ? 'active' : ''}`} onClick={() => setActiveTab('meal')}>
        <i className="fa-solid fa-utensils"></i>
        <span>食事</span>
      </button>
      <button className={`mobile-nav-item ${activeTab === 'equipment' ? 'active' : ''}`} onClick={() => setActiveTab('equipment')}>
        <i className="fa-solid fa-dumbbell"></i>
        <span>ガイド</span>
      </button>
      <button className={`mobile-nav-item ${activeTab === 'map' ? 'active' : ''}`} onClick={() => setActiveTab('map')}>
        <i className="fa-solid fa-map-location-dot"></i>
        <span>ジム</span>
      </button>
    </nav>
  );
}
