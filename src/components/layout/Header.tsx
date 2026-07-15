'use client';
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../AppContext';
import { getWorkouts, getMeals } from '@/lib/storage';

export default function Header() {
  const { activeTab, setActiveTab, userProfile, streak, theme, setTheme, textSize, setTextSize } = useAppContext();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'ホーム';
      case 'workout': return '筋トレ記録';
      case 'meal': return '食事管理';
      case 'equipment': return '器具ガイド＆プラン';
      case 'muscle-map': return '筋肉マップ';
      case 'map': return '周辺のジム探し';
      case 'profile': return 'プロフィール設定';
      default: return '筋虎';
    }
  };

  const handleLogout = () => {
    if (window.confirm("全ての記録データを削除してログアウトします。本当によろしいですか？")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const [appLang, setAppLang] = useState('日本語');

  useEffect(() => {
    const lang = localStorage.getItem('app_language') || '日本語';
    setAppLang(lang);
  }, []);

  const selectLanguage = (lang: string) => {
    if (lang !== appLang) {
      localStorage.setItem('app_language', lang);
      setAppLang(lang);
      alert(`言語設定を「${lang}」に変更しました。\n※🐯 虎コーチの返答言語に反映されます（画面UIの翻訳は現在準備中です）。`);
    }
    setDropdownOpen(false);
  };

  const todayStr = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });

  // 最新のレベル（筋虎ランク）をヘッダー側でも動的計算して表示
  const allWorkouts = getWorkouts(null);
  const allMeals = getMeals(null);
  const totalVolumeAll = allWorkouts.reduce((sum, w) => sum + (w.volume || 0), 0);

  const readKnowledge = typeof window !== 'undefined' ? localStorage.getItem('kinnikun_badge_knowledge_view') === 'true' : false;
  const readGif = typeof window !== 'undefined' ? localStorage.getItem('kinnikun_badge_knowledge_zoom') === 'true' : false;
  const startPlan = typeof window !== 'undefined' ? localStorage.getItem('kinnikun_badge_knowledge_routine') === 'true' : false;

  const workoutCount = allWorkouts.length;
  const mealCount = allMeals.length;
  const knowledgeSteps = (readKnowledge ? 1 : 0) + (readGif ? 1 : 0) + (startPlan ? 1 : 0);

  let badgeLevelsUnlocked = 0;
  if (workoutCount >= 50) badgeLevelsUnlocked += 3;
  else if (workoutCount >= 10) badgeLevelsUnlocked += 2;
  else if (workoutCount >= 1) badgeLevelsUnlocked += 1;
  
  if (mealCount >= 100) badgeLevelsUnlocked += 3;
  else if (mealCount >= 30) badgeLevelsUnlocked += 2;
  else if (mealCount >= 10) badgeLevelsUnlocked += 1;
  
  badgeLevelsUnlocked += knowledgeSteps;
  
  if (totalVolumeAll >= 200000) badgeLevelsUnlocked += 3;
  else if (totalVolumeAll >= 50000) badgeLevelsUnlocked += 2;
  else if (totalVolumeAll >= 5000) badgeLevelsUnlocked += 1;
  
  const currentStreak = streak || userProfile?.streak || 0;
  if (currentStreak >= 30) badgeLevelsUnlocked += 3;
  else if (currentStreak >= 10) badgeLevelsUnlocked += 2;
  else if (currentStreak >= 3) badgeLevelsUnlocked += 1;

  const mealDays: Record<string, number> = {};
  allMeals.forEach(m => {
    mealDays[m.date] = (mealDays[m.date] || 0) + m.calories;
  });
  const targetCal = userProfile?.targetCalories || 2000;
  const goalAchievedDays = Object.values(mealDays).filter(cal => cal >= targetCal * 0.9 && cal <= targetCal * 1.1).length;

  const workoutXp = workoutCount * 50;
  const mealXp = mealCount * 10;
  const goalAchievedXp = goalAchievedDays * 200;
  const streakXp = Math.floor(currentStreak / 7) * 300;
  const badgeXp = badgeLevelsUnlocked * 100;

  const totalXp = workoutXp + mealXp + goalAchievedXp + streakXp + badgeXp;

  let tempXp = totalXp;
  let currentLevel = 1;
  let xpForNextLevel = 250;
  while (tempXp >= xpForNextLevel) {
    tempXp -= xpForNextLevel;
    currentLevel++;
    xpForNextLevel = currentLevel * 250;
  }

  return (
    <header className="app-header">
      <div className="header-title" style={{ minWidth: 0, flex: '1 1 auto' }}>
        <h1 className="logo-text-premium" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 'clamp(20px, 5.5vw, 26px)', margin: 0, textShadow: '0 2px 10px rgba(220,160,56,0.2)' }}>{getPageTitle()}</h1>
        <p className="header-date">{todayStr}</p>
      </div>
      <div className="header-profile-container" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0, position: 'relative' }}>
        <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid #ef4444', padding: '5px 10px', borderRadius: '20px', color: '#ef4444', fontSize: 'clamp(10px, 2.5vw, 12px)', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
          <i className="fa-solid fa-fire"></i> {currentStreak}日連続
        </div>

        {/* ホーム(タイトル) と プロフィール(右ボタン) の間に配置されるレベルバッジ */}
        <div style={{ background: 'rgba(220,160,56,0.15)', border: '1px solid #DCA038', padding: '5px 10px', borderRadius: '20px', color: '#DCA038', fontSize: 'clamp(10px, 2.5vw, 12px)', fontWeight: 'bold', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
          👑 Lv.{currentLevel}
        </div>

        <div 
          onClick={() => { setDropdownOpen(!dropdownOpen); setSettingsMenuOpen(false); }}
          style={{ background: 'rgba(20,20,20,0.8)', border: '1px solid rgba(220,160,56,0.2)', padding: '5px 10px 5px 5px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', flexShrink: 0 }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#DCA038', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', flexShrink: 0 }}>
            <i className="fa-solid fa-user"></i>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', paddingRight: '4px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#fff', lineHeight: '1.2' }}>{userProfile?.name || 'ゲスト'}</span>
            <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', lineHeight: '1.2' }}>目標: {userProfile?.goal || '未設定'}</span>
          </div>
          <i className="fa-solid fa-chevron-down" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginLeft: '2px' }}></i>
        </div>
        
        {dropdownOpen && (
          <div className="profile-dropdown" style={{ position: 'absolute', top: '100%', right: '0', marginTop: '10px', background: 'rgba(15, 15, 17, 0.95)', border: '1px solid rgba(220, 160, 56, 0.3)', borderRadius: '12px', padding: '8px', minWidth: '200px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', zIndex: 1000, backdropFilter: 'blur(10px)' }}>
            {settingsMenuOpen ? (
              <>
                <button className="dropdown-item" onClick={() => setSettingsMenuOpen(false)} style={{ color: '#DCA038', fontWeight: 'bold', letterSpacing: '0.1em' }}>
                  <i className="fa-solid fa-arrow-left"></i> 戻る
                </button>
                <div style={{ padding: '12px 16px 4px', fontSize: '0.8rem', color: '#DCA038', fontWeight: 'bold', letterSpacing: '0.1em' }}>
                  テーマ
                </div>
                <div style={{ display: 'flex', padding: '0 16px 8px', gap: '8px' }}>
                  <button 
                    onClick={() => setTheme('light')}
                    style={{ ...(theme === 'light' ? {flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #B58434', background: 'linear-gradient(180deg, #8B6220 0%, #4A3311 100%)', color: '#FDF0A6', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.5)', fontWeight: 'bold', textShadow: '0 1px 2px rgba(0,0,0,0.8)'} : {flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#a0aec0', cursor: 'pointer'}) }}>
                    <i className="fa-solid fa-sun"></i> ライト
                  </button>
                  <button 
                    onClick={() => setTheme('dark')}
                    style={{ ...(theme === 'dark' ? {flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #B58434', background: 'linear-gradient(180deg, #8B6220 0%, #4A3311 100%)', color: '#FDF0A6', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.5)', fontWeight: 'bold', textShadow: '0 1px 2px rgba(0,0,0,0.8)'} : {flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#a0aec0', cursor: 'pointer'}) }}>
                    <i className="fa-solid fa-moon"></i> ダーク
                  </button>
                </div>
                <div style={{ padding: '12px 16px 4px', fontSize: '0.8rem', color: '#DCA038', fontWeight: 'bold', letterSpacing: '0.1em' }}>
                  文字の大きさ
                </div>
                <div style={{ display: 'flex', padding: '0 16px 16px', gap: '8px' }}>
                  <button 
                    onClick={() => setTextSize('normal')}
                    style={{ ...(textSize === 'normal' ? {flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #B58434', background: 'linear-gradient(180deg, #8B6220 0%, #4A3311 100%)', color: '#FDF0A6', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.5)', fontWeight: 'bold', textShadow: '0 1px 2px rgba(0,0,0,0.8)'} : {flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#a0aec0', cursor: 'pointer'}), fontSize: '1rem' }}>
                    標準
                  </button>
                  <button 
                    onClick={() => setTextSize('large')}
                    style={{ ...(textSize === 'large' ? {flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #B58434', background: 'linear-gradient(180deg, #8B6220 0%, #4A3311 100%)', color: '#FDF0A6', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.5)', fontWeight: 'bold', textShadow: '0 1px 2px rgba(0,0,0,0.8)'} : {flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#a0aec0', cursor: 'pointer'}), fontSize: '1.2rem' }}>
                    大
                  </button>
                </div>
              </>
            ) : (
              <>
                <button className="dropdown-item" onClick={() => { setActiveTab('profile'); setDropdownOpen(false); }}>
                  <i className="fa-solid fa-user"></i> プロフィール
                </button>
                <button className="dropdown-item" onClick={() => setSettingsMenuOpen(true)}>
                  <i className="fa-solid fa-gear"></i> 設定
                </button>
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '6px 0' }}></div>
                <button className="dropdown-item" onClick={handleLogout} style={{ color: '#ff5733' }}>
                  <i className="fa-solid fa-right-from-bracket"></i> ログアウト
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
