'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

type AppState = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userProfile: any;
  setUserProfile: (profile: any) => void;
  streak: number;
  setStreak: (streak: number) => void;
};

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    // Load data from localStorage on mount
    const storedProfile = localStorage.getItem('kinnikun_profile');
    if (storedProfile) {
      setUserProfile(JSON.parse(storedProfile));
    }
    const storedStreak = localStorage.getItem('kinnikun_streak');
    if (storedStreak) {
      setStreak(parseInt(storedStreak, 10));
    }
  }, []);

  return (
    <AppContext.Provider value={{ activeTab, setActiveTab, userProfile, setUserProfile, streak, setStreak }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
