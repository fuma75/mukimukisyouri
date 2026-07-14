import React, { createContext, useContext, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const todayStr = () => new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');

export type AchievementToast = {
  id: string;
  name: string;
  emoji: string;
  tier?: 'gold' | 'silver' | 'bronze' | null;
};

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
  checkAchievements: () => void;
};

const AppContext = createContext<AppState | undefined>(undefined);

// Minecraft-style Sound FX: High pitch crystal ding
const playAchievementSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    const playNote = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle'; // triangle waves are clean and soft
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.15, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.start(start);
      osc.stop(start + duration);
    };
    
    const now = ctx.currentTime;
    playNote(880, now, 0.45); // A5 note
    playNote(1760, now + 0.08, 0.60); // A6 note (one octave higher with short latency delay)
  } catch (e) {
    console.log('Audio Context error:', e);
  }
};

// Portal Toast Component
function MinecraftToast({ toast, onClose }: { toast: AchievementToast; onClose: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 50);
    const t2 = setTimeout(() => {
      setVisible(false);
      const t3 = setTimeout(onClose, 500);
      return () => clearTimeout(t3);
    }, 4500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div style={{
      position: 'fixed',
      top: '20px',
      right: visible ? '20px' : '-350px',
      width: '320px',
      background: '#212121',
      border: '4px solid #1a1a1a',
      borderRadius: '2px',
      boxShadow: '0 8px 0 rgba(0,0,0,0.4)',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      zIndex: 99999,
      transition: 'right 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      boxSizing: 'border-box',
      fontFamily: '"Courier New", Courier, monospace, sans-serif'
    }}>
      {/* Icon frame matching Minecraft GUI slot */}
      <div style={{
        width: '40px',
        height: '40px',
        background: '#3a3a3a',
        border: '3px solid #555555',
        borderRadius: '2px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        flexShrink: 0
      }}>
        {toast.emoji}
      </div>

      {/* Minecraft-like color coding and shadow styling */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, overflow: 'hidden' }}>
        <span style={{
          color: '#FFFF55',
          fontSize: '13px',
          fontWeight: 'bold',
          letterSpacing: '0.05em',
          textShadow: '2px 2px 0px #3F3F00'
        }}>
          実績解除！
        </span>
        <span style={{
          color: '#FFFFFF',
          fontSize: '12px',
          fontWeight: 'bold',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          textShadow: '2px 2px 0px #3F3F3F'
        }}>
          {toast.name}
        </span>
      </div>
      
      <div 
        onClick={() => { setVisible(false); setTimeout(onClose, 500); }}
        style={{ color: '#888', cursor: 'pointer', fontSize: '10px', position: 'absolute', top: '5px', right: '8px' }}
      >
        ✕
      </div>
    </div>,
    document.body
  );
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [streak, setStreak] = useState(0);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [theme, setTheme] = useState('dark');
  const [textSize, setTextSize] = useState('normal');

  const [activeToast, setActiveToast] = useState<AchievementToast | null>(null);

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

  // 新規実績・称号のアンロック判定とトースト起動関数
  const checkAchievements = () => {
    if (typeof window === 'undefined') return;
    
    const workoutsRaw = localStorage.getItem('kinnikun_workouts') || '[]';
    const mealsRaw = localStorage.getItem('kinnikun_meals') || '[]';
    const weightRaw = localStorage.getItem('kinnikun_weights') || '[]';
    const streakRaw = localStorage.getItem('kinnikun_streak') || '0';
    const profileRaw = localStorage.getItem('kinnikun_profile');
    
    let workouts = [];
    let meals = [];
    let weightLogs = [];
    try { workouts = JSON.parse(workoutsRaw); } catch(e){}
    try { meals = JSON.parse(mealsRaw); } catch(e){}
    try { weightLogs = JSON.parse(weightRaw); } catch(e){}
    const curStreak = parseInt(streakRaw, 10) || 0;
    
    let profile: any = {};
    try { profile = profileRaw ? JSON.parse(profileRaw) : {}; } catch(e){}
    
    const workoutCount = workouts.length;
    const mealCount = meals.length;
    const totalVolume = workouts.reduce((sum: number, w: any) => sum + (w.volume || 0), 0);
    
    const readKnowledge = localStorage.getItem('kinnikun_badge_knowledge') === 'true';
    const readGif = localStorage.getItem('kinnikun_badge_knowledge_gif') === 'true';
    const startPlan = localStorage.getItem('kinnikun_badge_knowledge_plan') === 'true';
    const knowledgeSteps = (readKnowledge ? 1 : 0) + (readGif ? 1 : 0) + (startPlan ? 1 : 0);

    // カロリー目標達成日数
    const mealDays: Record<string, number> = {};
    meals.forEach((m: any) => {
      mealDays[m.date] = (mealDays[m.date] || 0) + m.calories;
    });
    const targetCal = profile.targetCalories || 2000;
    const goalAchievedDays = Object.values(mealDays).filter(cal => cal >= targetCal * 0.9 && cal <= targetCal * 1.1).length;

    // XP & Level calculations
    let badgeLevelsUnlocked = 0;
    if (workoutCount >= 50) badgeLevelsUnlocked += 3;
    else if (workoutCount >= 10) badgeLevelsUnlocked += 2;
    else if (workoutCount >= 1) badgeLevelsUnlocked += 1;
    
    if (mealCount >= 100) badgeLevelsUnlocked += 3;
    else if (mealCount >= 30) badgeLevelsUnlocked += 2;
    else if (mealCount >= 10) badgeLevelsUnlocked += 1;
    
    badgeLevelsUnlocked += knowledgeSteps;
    
    if (totalVolume >= 200000) badgeLevelsUnlocked += 3;
    else if (totalVolume >= 50000) badgeLevelsUnlocked += 2;
    else if (totalVolume >= 5000) badgeLevelsUnlocked += 1;
    
    if (curStreak >= 30) badgeLevelsUnlocked += 3;
    else if (curStreak >= 10) badgeLevelsUnlocked += 2;
    else if (curStreak >= 3) badgeLevelsUnlocked += 1;

    const workoutXp = workoutCount * 50;
    const mealXp = mealCount * 10;
    const goalAchievedXp = goalAchievedDays * 200;
    const streakXp = Math.floor(curStreak / 7) * 300;
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

    // 隠し実績：完璧な一週間
    const last7DaysIntake = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
      const dMeals = meals.filter((m: any) => m.date === dStr);
      last7DaysIntake.push(dMeals.reduce((sum: number, m: any) => sum + (m.calories || 0), 0));
    }
    const isPerfectWeek = last7DaysIntake.every(cal => cal >= targetCal * 0.9 && cal <= targetCal * 1.1);

    // 隠し実績：有言実行
    let currentWeight = profile.weight || 60;
    if (weightLogs.length > 0) {
      currentWeight = weightLogs[weightLogs.length - 1].weight;
    }
    const targetWeight = profile.targetWeight || currentWeight;
    let isTargetWeightAchieved = false;
    if (profile.goal === '減量' || profile.goal === 'lose-fat') {
      isTargetWeightAchieved = currentWeight <= targetWeight;
    } else if (profile.goal === '増量' || profile.goal === 'gain-muscle') {
      isTargetWeightAchieved = currentWeight >= targetWeight;
    } else {
      isTargetWeightAchieved = Math.abs(currentWeight - targetWeight) <= 0.2;
    }

    const hasLateNightWorkout = workouts.some((w: any) => w.hour !== undefined && (w.hour >= 0 && w.hour < 5));
    const hasMorningWorkout = workouts.some((w: any) => w.hour !== undefined && (w.hour >= 5 && w.hour <= 7));

    // 実績リスト
    const list = [
      // バッジ段階
      { id: 'badge_workout_bronze', name: '初心者冒険者', condition: workoutCount >= 1, emoji: '🌱', tier: 'bronze' },
      { id: 'badge_workout_silver', name: '熟練の冒険者', condition: workoutCount >= 10, emoji: '⚔️', tier: 'silver' },
      { id: 'badge_workout_gold', name: '伝説の冒険者', condition: workoutCount >= 50, emoji: '🏆', tier: 'gold' },
      
      { id: 'badge_meals_bronze', name: '見習い料理人', condition: mealCount >= 10, emoji: '🍳', tier: 'bronze' },
      { id: 'badge_meals_silver', name: '栄養の管理者', condition: mealCount >= 30, emoji: '🥗', tier: 'silver' },
      { id: 'badge_meals_gold', name: '至高のシェフ', condition: mealCount >= 100, emoji: '👨‍🍳', tier: 'gold' },
      
      { id: 'badge_knowledge_bronze', name: '本読みの卵', condition: knowledgeSteps >= 1, emoji: '🥚', tier: 'bronze' },
      { id: 'badge_knowledge_silver', name: '知識の探求者', condition: knowledgeSteps >= 2, emoji: '🔍', tier: 'silver' },
      { id: 'badge_knowledge_gold', name: '知識の賢者', condition: knowledgeSteps >= 3, emoji: '🧙‍♂️', tier: 'gold' },
      
      { id: 'badge_volume_bronze', name: '鉄の卵', condition: totalVolume >= 5000, emoji: '⚙️', tier: 'bronze' },
      { id: 'badge_volume_silver', name: '鉄人の証', condition: totalVolume >= 50000, emoji: '🏋️‍♂️', tier: 'silver' },
      { id: 'badge_volume_gold', name: '鋼鉄の巨人', condition: totalVolume >= 200000, emoji: '🤖', tier: 'gold' },
      
      { id: 'badge_streak_bronze', name: '継続の卵', condition: curStreak >= 3, emoji: '🔥', tier: 'bronze' },
      { id: 'badge_streak_silver', name: '継続の達人', condition: curStreak >= 10, emoji: '🦁', tier: 'silver' },
      { id: 'badge_streak_gold', name: '不動の精神', condition: curStreak >= 30, emoji: '🏔️', tier: 'gold' },
      
      // 隠し実績
      { id: 'secret_late_night', name: '深夜の鍛錬', condition: hasLateNightWorkout, emoji: '🌙', tier: null },
      { id: 'secret_morning_tiger', name: '朝活の虎', condition: hasMorningWorkout, emoji: '🌅', tier: null },
      { id: 'secret_perfect_week', name: '完璧な一週間', condition: isPerfectWeek, emoji: '💯', tier: null },
      { id: 'secret_target_weight', name: '有言実行', condition: isTargetWeightAchieved, emoji: '🎯', tier: null },
      
      // 称号
      { id: 'title_novice', name: '筋虎の見習い', condition: currentLevel >= 5, emoji: '🛡️', tier: null },
      { id: 'title_hundred', name: '百戦の虎', condition: workoutCount >= 100, emoji: '🐅', tier: null },
      { id: 'title_iron', name: '鉄を愛する者', condition: totalVolume >= 10000, emoji: '🔗', tier: null },
      { id: 'title_food', name: '食を制する虎', condition: mealCount >= 200, emoji: '🍱', tier: null },
      { id: 'title_streak', name: '不屈の闘志', condition: curStreak >= 30, emoji: '🎗️', tier: null }
    ];

    const activeSecrets = (hasLateNightWorkout ? 1 : 0) + (hasMorningWorkout ? 1 : 0) + (isPerfectWeek ? 1 : 0) + (isTargetWeightAchieved ? 1 : 0);
    const reachedCount = badgeLevelsUnlocked + activeSecrets;
    list.push({ id: 'secret_true_kinnikun', name: '真・筋虎', condition: reachedCount === 19, emoji: '👑', tier: 'gold' });
    list.push({ id: 'title_king', name: '筋虎王', condition: (reachedCount + (reachedCount === 19 ? 1 : 0)) >= 16, emoji: '👑', tier: null });

    const notifiedRaw = localStorage.getItem('kinnikun_notified_achievements') || '[]';
    let notified: string[] = [];
    try { notified = JSON.parse(notifiedRaw); } catch(e){}

    // 条件を満たし、かつまだ通知されていない実績を探す
    const newUnlocked = list.filter(item => item.condition && !notified.includes(item.id));
    if (newUnlocked.length > 0) {
      const updatedNotified = [...notified, ...newUnlocked.map(item => item.id)];
      localStorage.setItem('kinnikun_notified_achievements', JSON.stringify(updatedNotified));
      
      // 最初の新規実績をトースト表示
      const target = newUnlocked[0];
      setActiveToast({ id: Date.now().toString(), name: target.name, emoji: target.emoji, tier: target.tier as any });
      playAchievementSound();
    }
  };

  // アプリマウント時にも自動チェック（初回起動時の同期用）
  useEffect(() => {
    const timer = setTimeout(() => {
      checkAchievements();
    }, 1500); // Wait for AppContext storage values to hydrate properly
    return () => clearTimeout(timer);
  }, [streak, userProfile]);

  return (
    <AppContext.Provider value={{ activeTab, setActiveTab, userProfile, setUserProfile, streak, setStreak, selectedDate, setSelectedDate, theme, setTheme, textSize, setTextSize, checkAchievements }}>
      {children}
      {activeToast && (
        <MinecraftToast 
          toast={activeToast} 
          onClose={() => setActiveToast(null)} 
        />
      )}
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
