'use client';
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../AppContext';

export default function Header() {
  const { activeTab, setActiveTab, userProfile, streak, theme, setTheme, textSize, setTextSize } = useAppContext();

  if (activeTab === 'dashboard') return null;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'ダッシュボード';
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

  return (
    <header className="app-header">
      <div className="header-title">
        <h1>{getPageTitle()}</h1>
        <p className="header-date">{todayStr}</p>
      </div>
      <div className="header-profile-container" style={{ position: 'relative' }}>
        <div 
          className="header-profile" 
          onClick={() => { setDropdownOpen(!dropdownOpen); setSettingsMenuOpen(false); }}
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <div className="streak-badge" title="連続記録（ストリーク）" style={{ display: 'flex', alignItems: 'center', background: 'rgba(255, 87, 51, 0.15)', color: '#ff5733', padding: '4px 12px', borderRadius: '20px', marginRight: '12px', fontWeight: 'bold', border: '1px solid rgba(255, 87, 51, 0.3)', fontSize: '0.9rem' }}>
            <i className="fa-solid fa-fire" style={{ marginRight: '5px', animation: 'pulse-glow 2s infinite' }}></i>
            <span>{streak}</span>日連続
          </div>
          <div className="avatar-placeholder">
            <i className="fa-solid fa-user"></i>
          </div>
          <div className="profile-info">
            <span className="profile-name">{userProfile?.name || 'ゲストユーザー'}</span>
            <span className="profile-goal">目標: {userProfile?.goal || '未設定'}</span>
          </div>
          <i className="fa-solid fa-chevron-down" style={{ marginLeft: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}></i>
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
