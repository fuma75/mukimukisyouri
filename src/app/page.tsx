'use client';
import React, { useEffect, useState } from 'react';
import { AppProvider, useAppContext } from '@/components/AppContext';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';

import Dashboard from '@/components/dashboard/Dashboard';
import Workout from '@/components/workout/Workout';
import Meal from '@/components/meal/Meal';
import TrainerChat from '@/components/trainer/TrainerChat';
import Profile from '@/components/profile/Profile';
import Map from '@/components/map/Map';
import Login from '@/components/auth/Login';

function MainContent() {
  const { activeTab, userProfile } = useAppContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.scrollTop = 0;
    }
    const contentBody = document.querySelector('.content-body');
    if (contentBody) {
      contentBody.scrollTop = 0;
    }
  }, [activeTab]);

  if (!mounted) return null;

  if (!userProfile) {
    return <Login />;
  }

  return (
    <>
      <Sidebar />
      <main className="main-content">
        <Header />
        <div className="content-body">
          <div style={{ display: activeTab === 'dashboard' ? 'block' : 'none', height: '100%' }}><Dashboard /></div>
          <div style={{ display: activeTab === 'workout' ? 'block' : 'none', height: '100%' }}><Workout /></div>
          <div style={{ display: activeTab === 'meal' ? 'block' : 'none', height: '100%' }}><Meal /></div>
          <div style={{ display: activeTab === 'trainer' ? 'block' : 'none', height: '100%' }}><TrainerChat /></div>
          <div style={{ display: activeTab === 'map' ? 'block' : 'none', height: '100%' }}><Map /></div>
          <div style={{ display: activeTab === 'profile' ? 'block' : 'none', height: '100%' }}><Profile /></div>
        </div>
      </main>
      <MobileNav />
    </>
  );
}

export default function Page() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
