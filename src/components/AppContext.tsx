import React, { createContext, useContext, useState, useEffect } from 'react';

const todayStr = () => new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');

type AppState = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userProfile: any;
  setUserProfile: (profile: any) => void;
  streak: number;
  setStreak: (streak: number) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  theme: string;
  setTheme: (theme: string) => void;
  textSize: string;
  setTextSize: (size: string) => void;
};

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [streak, setStreak] = useState(0);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [theme, setTheme] = useState('dark');
  const [textSize, setTextSize] = useState('normal');

  useEffect(() => {
    const storedProfile = localStorage.getItem('kinnikun_profile');
    if (storedProfile) {
      setUserProfile(JSON.parse(storedProfile));
    }
    const storedStreak = localStorage.getItem('kinnikun_streak');
    if (storedStreak) {
      setStreak(parseInt(storedStreak, 10));
    }
    const storedTheme = localStorage.getItem('kinnikun_theme') || 'dark';
    setTheme(storedTheme);
    const storedTextSize = localStorage.getItem('kinnikun_textSize') || 'normal';
    setTextSize(storedTextSize);
  }, []);

  useEffect(() => {
    localStorage.setItem('kinnikun_theme', theme);
    localStorage.setItem('kinnikun_textSize', textSize);
    
    // Apply classes to body
    document.documentElement.className = theme + '-theme text-size-' + textSize;
    document.body.className = theme + '-theme text-size-' + textSize;
  }, [theme, textSize]);

  return (
    <AppContext.Provider value={{ activeTab, setActiveTab, userProfile, setUserProfile, streak, setStreak, selectedDate, setSelectedDate, theme, setTheme, textSize, setTextSize }}>
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
