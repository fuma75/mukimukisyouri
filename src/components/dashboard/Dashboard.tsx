'use client';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../AppContext';
import { getProfile, getWorkouts, getMeals, getWeightLogs, saveWeightLog, saveProfile, Profile, WorkoutItem, MealItem, WeightLog } from '@/lib/storage';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, Filler } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import RulerPicker from '@/components/ui/RulerPicker';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, Filler);

export default function Dashboard() {
  const { activeTab, setActiveTab, textSize, theme, streak } = useAppContext();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workouts, setWorkouts] = useState<WorkoutItem[]>([]);
  const [meals, setMeals] = useState<MealItem[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [mounted, setMounted] = useState(false);
  const [showBmiEdit, setShowBmiEdit] = useState(false);
  const [editHeight, setEditHeight] = useState(167);
  const [editWeight, setEditWeight] = useState(60);
  const [showXpGuide, setShowXpGuide] = useState(false);

  useEffect(() => {
    if (activeTab === 'dashboard' || !mounted) {
      setProfile(getProfile());
      const todayStr = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
      setWorkouts(getWorkouts(todayStr));
      setMeals(getMeals(todayStr));
      setWeightLogs(getWeightLogs());
    }
    setMounted(true);
  }, [activeTab, mounted]);

  if (!mounted || !profile) return null;

  // 全期間の記録データをロード（経験値 & バッジレベル計算用）
  const allWorkouts = getWorkouts(null);
  const allMeals = getMeals(null);
  const totalVolumeAll = allWorkouts.reduce((sum, w) => sum + (w.volume || 0), 0);

  // 知識バッジ獲得ステップの算出
  const readKnowledge = typeof window !== 'undefined' ? localStorage.getItem('kinnikun_badge_knowledge') === 'true' : false;
  const readGif = typeof window !== 'undefined' ? localStorage.getItem('kinnikun_badge_knowledge_gif') === 'true' : false;
  const startPlan = typeof window !== 'undefined' ? localStorage.getItem('kinnikun_badge_knowledge_plan') === 'true' : false;

  const workoutCount = allWorkouts.length;
  const mealCount = allMeals.length;
  const knowledgeSteps = (readKnowledge ? 1 : 0) + (readGif ? 1 : 0) + (startPlan ? 1 : 0);

  // 解除済みのバッジレベル数をカウント（銅=1, 銀=2, 金=3）
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
  
  if (streak >= 30) badgeLevelsUnlocked += 3;
  else if (streak >= 10) badgeLevelsUnlocked += 2;
  else if (streak >= 3) badgeLevelsUnlocked += 1;

  // 目標達成日数のカウント（カロリー目標が設定されている前提、目標の90%〜110%を達成した日）
  const mealDays: Record<string, number> = {};
  allMeals.forEach(m => {
    mealDays[m.date] = (mealDays[m.date] || 0) + m.calories;
  });
  const targetCal = profile.targetCalories || 2000;
  const goalAchievedDays = Object.values(mealDays).filter(cal => cal >= targetCal * 0.9 && cal <= targetCal * 1.1).length;

  // XP合計値の動的算出 (画像指定のレートに完全準拠)
  const workoutXp = workoutCount * 50;
  const mealXp = mealCount * 10;
  const goalAchievedXp = goalAchievedDays * 200;
  const streakXp = Math.floor(streak / 7) * 300;
  const badgeXp = badgeLevelsUnlocked * 100;

  const totalXp = workoutXp + mealXp + goalAchievedXp + streakXp + badgeXp;

  // レベル計算
  let tempXp = totalXp;
  let currentLevel = 1;
  let xpForNextLevel = 250;
  while (tempXp >= xpForNextLevel) {
    tempXp -= xpForNextLevel;
    currentLevel++;
    xpForNextLevel = currentLevel * 250;
  }

  // 今日の分のカロリーPFC
  let consumedCalories = 0;
  let totalP = 0;
  let totalF = 0;
  let totalC = 0;

  meals.forEach(m => {
    consumedCalories += m.calories;
    totalP += m.protein;
    totalF += m.fat;
    totalC += m.carb;
  });

  let burnedCalories = 0;
  let totalVolume = 0;
  let totalSets = 0;
  const summaryMap: Record<string, WorkoutItem[]> = {};

  workouts.forEach(w => {
    if (w.calories !== undefined && w.calories > 0) {
      burnedCalories += w.calories;
    } else {
      burnedCalories += Math.round((w.volume || 0) * 0.05); 
    }
    totalVolume += w.volume || 0;
    totalSets += w.sets || 0;
    
    if (!summaryMap[w.category]) summaryMap[w.category] = [];
    summaryMap[w.category].push(w);
  });

  const progressPercent = Math.min((consumedCalories / (profile.targetCalories || 2000)) * 100, 100);

  // PFC Chart Data
  const hasData = totalP > 0 || totalF > 0 || totalC > 0;
  const pfcData = {
    labels: hasData ? ['P (タンパク質)', 'F (脂質)', 'C (炭水化物)'] : ['データなし'],
    datasets: [{
      data: hasData ? [totalP * 4, totalF * 9, totalC * 4] : [1],
      backgroundColor: hasData ? ['#F59E0B', '#FBBF24', '#EF4444'] : ['#f1f3f5'],
      borderWidth: 1,
      borderColor: '#ffffff'
    }]
  };

  const pfcOptions = {
    cutout: '70%',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: hasData,
        callbacks: {
          label: function(context: any) {
            const val = context.raw;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const pct = Math.round((val / total) * 100);
            return `${context.label}: ${pct}% (${Math.round(val)} kcal)`;
          }
        }
      }
    }
  };

  // Weekly & Weight Chart Data
  const last7Days = [];
  const intakeData = [];
  const burnData = [];
  const weightData: (number | null)[] = [];
  
  const weightMap: Record<string, number> = {};
  weightLogs.forEach(l => { weightMap[l.date] = l.weight; });
  
  let currentWeight = profile.weight;
  let maxWeight = profile.weight;
  let minWeight = profile.weight;
  
  if (weightLogs.length > 0) {
    const weights = weightLogs.map(l => l.weight);
    maxWeight = Math.max(profile.weight, ...weights);
    minWeight = Math.min(profile.weight, ...weights);
    currentWeight = weightLogs[weightLogs.length - 1].weight;
  }
  
  for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
      last7Days.push(`${d.getMonth() + 1}/${d.getDate()}`);
      
      const dMeals = getMeals(dStr);
      intakeData.push(dMeals.reduce((sum, m) => sum + (m.calories || 0), 0));
      
      const dWorkouts = getWorkouts(dStr);
      let dBurn = 0;
      dWorkouts.forEach(w => {
          if (w.calories !== undefined && w.calories > 0) dBurn += w.calories;
          else dBurn += Math.round((w.volume || 0) * 0.05); 
      });
      burnData.push(dBurn);
      
      // Weight mapping
      weightData.push(weightMap[dStr] !== undefined ? weightMap[dStr] : null);
  }
  
  // Fill missing weight gaps for a smooth line
  let lastVal = profile.weight;
  for (let i = 0; i < weightData.length; i++) {
    if (weightData[i] !== null) {
      lastVal = weightData[i] as number;
    } else {
      weightData[i] = lastVal;
    }
  }

  const weeklyData = {
    labels: last7Days,
    datasets: [
        {
            label: '摂取 (kcal)',
            data: intakeData,
            backgroundColor: 'rgba(76, 175, 80, 0.7)',
            borderColor: 'rgb(76, 175, 80)',
            borderWidth: 1,
            borderRadius: 4
        },
        {
            label: '消費 (kcal)',
            data: burnData,
            backgroundColor: 'rgba(255, 107, 107, 0.7)',
            borderColor: 'rgb(255, 107, 107)',
            borderWidth: 1,
            borderRadius: 4
        }
    ]
  };

  const weeklyOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { y: { beginAtZero: true } },
    plugins: { legend: { position: 'bottom' as const } }
  };

  const weightChartData = {
    labels: last7Days,
    datasets: [
      {
        label: '体重 (kg)',
        data: weightData,
        borderColor: 'var(--primary)',
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        fill: true,
        tension: 0.1,
        pointBackgroundColor: 'var(--primary)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ]
  };

  const weightChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { 
        y: { 
            min: Math.max(0, Math.floor(minWeight) - 2), 
            max: Math.ceil(maxWeight) + 2,
            ticks: { stepSize: 1 }
        },
        x: { grid: { display: false } }
    },
    plugins: { legend: { display: false } }
  };

  // 隠し実績：完璧な一週間の判定 (直近7日間の全日カロリーが目標の90%〜110%内)
  const isPerfectWeek = intakeData.every(cal => cal >= targetCal * 0.9 && cal <= targetCal * 1.1);

  // 隠し実績：有言実行の判定 (目標体重をクリアしているか)
  const targetWeight = profile.targetWeight || profile.weight;
  let isTargetWeightAchieved = false;
  if (profile.goal === 'lose-fat' || profile.goal === 'ダイエット・減量' || profile.goal === '減量') {
    isTargetWeightAchieved = currentWeight <= targetWeight;
  } else if (profile.goal === 'gain-muscle' || profile.goal === '筋肥大・バルクアップ' || profile.goal === '増量') {
    isTargetWeightAchieved = currentWeight >= targetWeight;
  } else {
    isTargetWeightAchieved = Math.abs(currentWeight - targetWeight) <= 0.2;
  }

  // 隠し実績：深夜・早朝の判定
  const hasLateNightWorkout = allWorkouts.some(w => w.hour !== undefined && (w.hour >= 0 && w.hour < 5));
  const hasMorningWorkout = allWorkouts.some(w => w.hour !== undefined && (w.hour >= 5 && w.hour <= 7));

  // バッジリスト（進捗＆銅銀金ティア）
  const tiers = {
    gold: {
      name: '金',
      bg: 'rgba(220, 160, 56, 0.15)',
      border: '2px solid #DCA038',
      color: '#DCA038',
      shadow: '0 0 15px rgba(220,160,56,0.35)'
    },
    silver: {
      name: '銀',
      bg: 'rgba(224, 224, 224, 0.1)',
      border: '2px solid #b0b0b0',
      color: '#e0e0e0',
      shadow: '0 0 15px rgba(224,224,224,0.2)'
    },
    bronze: {
      name: '銅',
      bg: 'rgba(205, 127, 50, 0.1)',
      border: '2px solid #cd7f32',
      color: '#d27d2d',
      shadow: '0 0 15px rgba(205,127,50,0.2)'
    }
  };

  const badgeSecrets = [
    // 冒険者の証 (workout)
    {
      id: 'badge_workout_bronze',
      name: '初心者冒険者',
      hint: 'はじめてのトレーニングを記録する',
      isUnlocked: workoutCount >= 1,
      emoji: '🌱',
      tier: 'bronze' as const
    },
    {
      id: 'badge_workout_silver',
      name: '熟練の冒険者',
      hint: 'トレーニングを10回記録する',
      isUnlocked: workoutCount >= 10,
      emoji: '⚔️',
      tier: 'silver' as const
    },
    {
      id: 'badge_workout_gold',
      name: '伝説の冒険者',
      hint: 'トレーニングを50回記録する',
      isUnlocked: workoutCount >= 50,
      emoji: '🏆',
      tier: 'gold' as const
    },
    // 栄養の管理者 (meals)
    {
      id: 'badge_meals_bronze',
      name: '見習い料理人',
      hint: '食事を10回記録する',
      isUnlocked: mealCount >= 10,
      emoji: '🍳',
      tier: 'bronze' as const
    },
    {
      id: 'badge_meals_silver',
      name: '栄養の管理者',
      hint: '食事を30回記録する',
      isUnlocked: mealCount >= 30,
      emoji: '🥗',
      tier: 'silver' as const
    },
    {
      id: 'badge_meals_gold',
      name: '至高のシェフ',
      hint: '食事を100回記録する',
      isUnlocked: mealCount >= 100,
      emoji: '👨‍🍳',
      tier: 'gold' as const
    },
    // 知識の賢者 (knowledge)
    {
      id: 'badge_knowledge_bronze',
      name: '本読みの卵',
      hint: 'コラム・器具ガイドを閲覧する',
      isUnlocked: knowledgeSteps >= 1,
      emoji: '🥚',
      tier: 'bronze' as const
    },
    {
      id: 'badge_knowledge_silver',
      name: '知識の探求者',
      hint: 'コラム内のトレーニングGIF動画をタップして拡大する',
      isUnlocked: knowledgeSteps >= 2,
      emoji: '🔍',
      tier: 'silver' as const
    },
    {
      id: 'badge_knowledge_gold',
      name: '知識の賢者',
      hint: 'おすすめプランからトレーニングを開始する',
      isUnlocked: knowledgeSteps >= 3,
      emoji: '🧙‍♂️',
      tier: 'gold' as const
    },
    // 鉄人の証 (volume)
    {
      id: 'badge_volume_bronze',
      name: '鉄の卵',
      hint: '累計ボリューム5,000kg突破',
      isUnlocked: totalVolumeAll >= 5000,
      emoji: '⚙️',
      tier: 'bronze' as const
    },
    {
      id: 'badge_volume_silver',
      name: '鉄人の証',
      hint: '累計ボリューム50,000kg突破',
      isUnlocked: totalVolumeAll >= 50000,
      emoji: '🏋️‍♂️',
      tier: 'silver' as const
    },
    {
      id: 'badge_volume_gold',
      name: '鋼鉄の巨人',
      hint: '累計ボリューム200,000kg突破',
      isUnlocked: totalVolumeAll >= 200000,
      emoji: '🤖',
      tier: 'gold' as const
    },
    // 継続の達人 (streak)
    {
      id: 'badge_streak_bronze',
      name: '継続の卵',
      hint: '3日間連続で記録を続ける',
      isUnlocked: streak >= 3,
      emoji: '🔥',
      tier: 'bronze' as const
    },
    {
      id: 'badge_streak_silver',
      name: '継続の達人',
      hint: '10日間連続で記録を続ける',
      isUnlocked: streak >= 10,
      emoji: '🦁',
      tier: 'silver' as const
    },
    {
      id: 'badge_streak_gold',
      name: '不動の精神',
      hint: '30日間連続で記録を続ける',
      isUnlocked: streak >= 30,
      emoji: '🏔️',
      tier: 'gold' as const
    }
  ];

  const secretsList = [
    {
      id: 'late_night',
      name: '深夜の鍛錬',
      icon: 'fa-moon',
      hint: '深夜（0時〜5時）にトレーニングを記録する',
      isUnlocked: hasLateNightWorkout,
      emoji: '🌙',
      tier: null
    },
    {
      id: 'morning_tiger',
      name: '朝活の虎',
      icon: 'fa-sun',
      hint: '朝早く（5時〜7時）にトレーニングを記録する',
      isUnlocked: hasMorningWorkout,
      emoji: '🌅',
      tier: null
    },
    {
      id: 'perfect_week',
      name: '完璧な一週間',
      icon: 'fa-calendar-check',
      hint: '直近7日間すべて目標カロリー(±10%)を達成する',
      isUnlocked: isPerfectWeek,
      emoji: '💯',
      tier: null
    },
    {
      id: 'target_weight',
      name: '有言実行',
      icon: 'fa-bullseye',
      hint: '設定した目標体重を達成する',
      isUnlocked: isTargetWeightAchieved,
      emoji: '🎯',
      tier: null
    }
  ];

  // 全実績数（15個のバッジ段階 + 4つの隠し実績 = 19）
  const otherSecretsCount = secretsList.filter(s => s.isUnlocked).length;
  const totalAchievementsReached = badgeLevelsUnlocked + otherSecretsCount;

  // 真・筋虎の判定 (全実績解除)
  const isTrueKinnikun = totalAchievementsReached === 19;

  const allSecrets = [
    ...badgeSecrets,
    ...secretsList,
    {
      id: 'true_kinnikun',
      name: '真・筋虎',
      icon: 'fa-crown',
      hint: '全実績を完全に解除する',
      isUnlocked: isTrueKinnikun,
      emoji: '👑',
      tier: 'gold' as const
    }
  ];

  // 称号リスト
  const titleList = [
    {
      name: '筋虎の見習い',
      condition: 'Lv.5に到達する',
      isUnlocked: currentLevel >= 5,
      progress: `現在のLv: ${currentLevel} / 5`
    },
    {
      name: '百戦の虎',
      condition: '累計100回ワークアウトを記録する',
      isUnlocked: workoutCount >= 100,
      progress: `現在の回数: ${workoutCount} / 100回`
    },
    {
      name: '鉄を愛する者',
      condition: '総重量10t (累計ボリューム10,000kg) 突破',
      isUnlocked: totalVolumeAll >= 10000,
      progress: `現在の重量: ${totalVolumeAll.toLocaleString()} / 10,000 kg`
    },
    {
      name: '食を制する虎',
      condition: '累計食事記録200回',
      isUnlocked: mealCount >= 200,
      progress: `現在の回数: ${mealCount} / 200回`
    },
    {
      name: '不屈の闘志',
      condition: '30日継続 of 証',
      isUnlocked: streak >= 30,
      progress: `現在の継続日数: ${streak} / 30日`
    },
    {
      name: '筋虎王',
      condition: '全実績(バッジ段階+隠し実績)の80%（16個以上）をクリアする',
      isUnlocked: (totalAchievementsReached + (isTrueKinnikun ? 1 : 0)) >= 16,
      progress: `現在のクリア実績: ${totalAchievementsReached + (isTrueKinnikun ? 1 : 0)} / 20個`
    }
  ];

  // Scale chart fonts based on textSize
  ChartJS.defaults.color = 'rgba(255, 255, 255, 0.6)';
  ChartJS.defaults.font.size = textSize === 'large' ? 14 : 12;
  
  const todayStrHeader = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });

  return (
    <section id="dashboard" className="content-section active" style={{ paddingBottom: '100px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 16px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Goal Summary Banner */}
          <div style={{ background: 'rgba(20,20,25,0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '30px 40px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold', letterSpacing: '0.05em' }}>現在の目標</p>
              <h2 style={{ margin: '8px 0 0 0', fontSize: '1.6rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {profile.goal === 'lose-fat' || profile.goal === 'ダイエット・減量' || profile.goal === '減量' ? 'ダイエット・減量' : 
                 profile.goal === 'gain-muscle' || profile.goal === '筋肥大・バルクアップ' || profile.goal === '増量' ? '筋肥大・バルクアップ' : 
                 profile.goal === 'maintain' || profile.goal === '健康維持・体力アップ' || profile.goal === '維持' ? '健康維持・体力アップ' : 
                 `${profile.goal || '目標未設定'}`}
              </h2>
            </div>
            
            <div style={{ flex: '1', textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '0 20px', minWidth: '200px' }}>
              {(() => {
                const estDays = profile.estimatedDays || (() => {
                  const w = Number(profile.weight);
                  const tw = Number(profile.targetWeight);
                  if (!w || !tw) return null;
                  const diff = Math.abs(w - tw);
                  if (diff === 0) return 0;
                  const dailyDiff = 400; 
                  return Math.round((diff * 7700) / dailyDiff);
                })();
                
                if (estDays !== null && estDays !== undefined) {
                  return (
                    <h2 style={{ margin: 0, color: '#DCA038', fontSize: '1.8rem', textShadow: '0 0 10px rgba(220,160,56,0.3)', fontWeight: 'bold' }}>
                      目標達成まで約 {estDays} 日
                    </h2>
                  );
                }
                return <p style={{ margin: '0', fontSize: '1.2rem', color: 'var(--text-muted)' }}>目標までの日数を計算中...</p>;
              })()}
            </div>

            <div style={{ flex: '1', textAlign: 'right', minWidth: '200px' }}>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold' }}>目標カロリー</p>
              <div style={{ margin: '5px 0 10px 0', fontSize: '2rem', fontWeight: 'bold', color: '#fff', textShadow: '0 0 10px rgba(255,255,255,0.2)' }}>
                {profile.targetCalories ? profile.targetCalories.toLocaleString() : '-'} <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.5)', fontWeight: 'normal' }}>kcal</span>
              </div>
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', fontSize: '0.85rem' }}>
                <div><span style={{ color: '#ff5224', fontWeight: 'bold' }}>P</span> <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>(タンパク質)</span> <strong style={{ color: '#fff' }}>{profile.targetProtein || '-'}</strong> <span style={{ color: 'rgba(255,255,255,0.5)' }}>g</span></div>
                <div><span style={{ color: '#ffac1c', fontWeight: 'bold' }}>F</span> <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>(脂質)</span> <strong style={{ color: '#fff' }}>{profile.targetFat || '-'}</strong> <span style={{ color: 'rgba(255,255,255,0.5)' }}>g</span></div>
                <div><span style={{ color: '#00e676', fontWeight: 'bold' }}>C</span> <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>(炭水化物)</span> <strong style={{ color: '#fff' }}>{profile.targetCarb || '-'}</strong> <span style={{ color: 'rgba(255,255,255,0.5)' }}>g</span></div>
              </div>
            </div>
          </div>

          {/* レベル表示 (LEVEL STATUS) */}
          <div style={{ background: 'rgba(20,20,25,0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '25px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                <span style={{ color: '#DCA038' }}>👑</span> 筋虎ランク
              </h3>
              <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#fff' }}>
                Lv.{currentLevel}
              </span>
            </div>

            {/* progress bar */}
            <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden', position: 'relative', marginBottom: '10px' }}>
              <div style={{
                width: `${Math.min(100, (tempXp / xpForNextLevel) * 100)}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #FDF0A6, #DCA038)',
                borderRadius: '6px',
                transition: 'width 0.5s ease-out'
              }} />
            </div>

            {/* XP text */}
            <div style={{ textAlign: 'center', fontSize: '1rem', fontWeight: 'bold', color: '#fff', marginBottom: '20px' }}>
              {tempXp.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP
            </div>

            {/* Milestones grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '5px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px', textAlign: 'center' }}>
              {[
                { lv: 1, title: '子虎' },
                { lv: 10, title: '若虎' },
                { lv: 20, title: '猛虎' },
                { lv: 30, title: '虎王' },
                { lv: 50, title: '覇虎' },
                { lv: 100, title: '神虎' }
              ].map((ms) => {
                const isReached = currentLevel >= ms.lv;
                return (
                  <div key={ms.lv} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: isReached ? '#DCA038' : 'rgba(255,255,255,0.3)' }}>
                      Lv.{ms.lv}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: isReached ? '#fff' : 'rgba(255,255,255,0.3)' }}>
                      {ms.title}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Show XP Guideline Toggle */}
            <div style={{ marginTop: '15px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
              <button 
                onClick={() => setShowXpGuide(!showXpGuide)}
                style={{ background: 'transparent', border: 'none', color: '#DCA038', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', margin: '0 auto', outline: 'none' }}
              >
                {showXpGuide ? '経験値ガイドを閉じる ▴' : '経験値の獲得方法を確認 ▾'}
              </button>
              
              {showXpGuide && (
                <div style={{ marginTop: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '15px', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold' }}>
                    <span>行動</span>
                    <span>獲得XP</span>
                  </div>
                  {[
                    { action: '筋トレ記録', xp: '+50 XP' },
                    { action: '食事記録', xp: '+10 XP' },
                    { action: 'カロリー目標達成 (目標の±10%)', xp: '+200 XP' },
                    { action: '7日連続記録達成 (7日ごと)', xp: '+300 XP' },
                    { action: '新実績バッジ解除 (1段階ごと)', xp: '+100 XP' },
                  ].map((row, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '0.8rem', color: '#fff', borderBottom: idx < 4 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                      <span>{row.action}</span>
                      <span style={{ color: '#DCA038', fontWeight: 'bold' }}>{row.xp}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '20px' }}>
          {/* Calorie Balance */}
          <div style={{ background: 'rgba(20,20,25,0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '25px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🔥 カロリーバランス
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold', letterSpacing: '0.05em' }}>摂取 VS 消費</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', flex: 1 }}>
              <div style={{ position: 'relative', width: '140px', height: '140px', flexShrink: 0 }}>
                {/* Circular Progress mimicking Doughnut */}
                <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="15" />
                  <circle cx="70" cy="70" r="60" fill="none" stroke="#DCA038" strokeWidth="15" strokeDasharray={`${Math.PI * 120}`} strokeDashoffset={`${Math.PI * 120 * (1 - (progressPercent / 100))}`} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
                </svg>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fff', lineHeight: 1.1 }}>{consumedCalories.toLocaleString()}</span>
                  <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>/ {profile.targetCalories?.toLocaleString()} kcal</span>
                  <span style={{ fontSize: '0.8rem', color: '#DCA038', fontWeight: 'bold', marginTop: '4px' }}>摂取</span>
                </div>
              </div>
              
              <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>目標摂取</span>
                  <span style={{ color: '#fff', fontWeight: 'bold' }}>{profile.targetCalories?.toLocaleString()} kcal</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <span style={{ color: '#DCA038', fontWeight: 'bold' }}>{consumedCalories.toLocaleString()} kcal</span>
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>現在摂取</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>消費（運動）</span>
                  <span style={{ color: '#DCA038', fontWeight: 'bold' }}>{burnedCalories.toLocaleString()} kcal</span>
                </div>
                
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '5px 0' }}></div>
                
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold', marginBottom: '5px' }}>本日のPFC摂取</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <span style={{ color: '#ff5224', fontWeight: 'bold' }}>P (タンパク質)</span>
                  <span style={{ color: '#ff5224', fontWeight: 'bold' }}>{Math.round(totalP)} g</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <span style={{ color: '#ffac1c', fontWeight: 'bold' }}>F (脂質)</span>
                  <span style={{ color: '#ffac1c', fontWeight: 'bold' }}>{Math.round(totalF)} g</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <span style={{ color: '#00e676', fontWeight: 'bold' }}>C (炭水化物)</span>
                  <span style={{ color: '#00e676', fontWeight: 'bold' }}>{Math.round(totalC)} g</span>
                </div>
              </div>
            </div>
          </div>

          {/* PFC Balance */}
          <div style={{ background: 'rgba(20,20,25,0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '25px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🟢 PFCバランス
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold', letterSpacing: '0.05em' }}>三大栄養素比率</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', flex: 1 }}>
              <div style={{ width: '140px', height: '140px', flexShrink: 0, position: 'relative' }}>
                <Doughnut data={pfcData} options={{...pfcOptions, cutout: '80%'}} />
                {/* Fallback empty ring if no data */}
                {!hasData && (
                   <svg width="140" height="140" viewBox="0 0 140 140" style={{ position: 'absolute', top: 0, left: 0 }}>
                     <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="15" />
                   </svg>
                )}
              </div>
              
              <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff5224' }}></div>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>P: タンパク質</span>
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#fff', paddingLeft: '16px' }}>
                    {totalP.toFixed(1)}g <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 'normal' }}>/ {profile.targetProtein}g</span>
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffac1c' }}></div>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>F: 脂質</span>
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#fff', paddingLeft: '16px' }}>
                    {totalF.toFixed(1)}g <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 'normal' }}>/ {profile.targetFat}g</span>
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00e676' }}></div>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>C: 炭水化物</span>
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#fff', paddingLeft: '16px' }}>
                    {totalC.toFixed(1)}g <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 'normal' }}>/ {profile.targetCarb}g</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          </div>

          {/* Weekly Chart */}
          <div style={{ background: 'rgba(20,20,25,0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '25px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📊 過去1週間のカロリー推移
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold', letterSpacing: '0.05em' }}>摂取 vs 消費</span>
            </div>
            <div style={{ height: '300px', width: '100%' }}>
              <Bar data={{
                ...weeklyData,
                datasets: [
                  { ...weeklyData.datasets[0], backgroundColor: 'rgba(76, 175, 80, 0.8)', borderColor: 'rgba(76, 175, 80, 1)' },
                  { ...weeklyData.datasets[1], backgroundColor: 'rgba(239, 68, 68, 0.8)', borderColor: 'rgba(239, 68, 68, 1)' }
                ]
              }} options={{
                ...weeklyOptions,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { color: 'rgba(255,255,255,0.6)', usePointStyle: true, boxWidth: 10 }
                  }
                },
                scales: {
                  y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.5)' } },
                  x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.5)' } }
                }
              }} />
            </div>
          </div>

          {/* BMI Chart */}
          {(() => {
            const h = profile.height / 100;
            const bmi = h > 0 ? currentWeight / (h * h) : null;
            if (!bmi) return null;
            const bmiVal = Math.round(bmi * 10) / 10;
            let bmiLabel = '標準';
            let bmiColor = '#4ade80';
            if (bmi < 18.5) { bmiLabel = '低体重'; bmiColor = '#60a5fa'; }
            else if (bmi < 25) { bmiLabel = '標準'; bmiColor = '#4ade80'; }
            else if (bmi < 30) { bmiLabel = '過体重'; bmiColor = '#fb923c'; }
            else { bmiLabel = '肥満'; bmiColor = '#f87171'; }
            const MIN = 15, MAX = 40;
            const pointerPct = Math.min(98, Math.max(2, ((bmi - MIN) / (MAX - MIN)) * 100));
            const totalRange = MAX - MIN;
            const segments = [
              { from: 15,   to: 18.5, color: '#60a5fa' },
              { from: 18.5, to: 22,   color: '#34d399' },
              { from: 22,   to: 25,   color: '#a3e635' },
              { from: 25,   to: 30,   color: '#fbbf24' },
              { from: 30,   to: 35,   color: '#fb923c' },
              { from: 35,   to: 40,   color: '#f87171' },
            ];
            const labels = [15, 18.5, 25, 30, 35, 40];
            return (
              <div style={{ background: 'rgba(20,20,25,0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '25px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    📉 体重推移 & BMI
                  </h3>
                  <button
                    onClick={() => { setEditHeight(profile.height); setEditWeight(currentWeight); setShowBmiEdit(true); }}
                    style={{ background: 'linear-gradient(180deg, #FDF0A6, #DCA038)', color: '#000', border: 'none', borderRadius: '20px', padding: '6px 16px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(220,160,56,0.3)' }}
                  >編集</button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px' }}>
                  {/* Left: BMI Data */}
                  <div style={{ flex: '1 1 300px', minWidth: 0 }}>
                    <div style={{ padding: '10px 10px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <div>
                          <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '4px' }}>あなたのBMI</span>
                          <span style={{ fontSize: '2.8rem', fontWeight: 'bold', color: '#fff', lineHeight: 1, textShadow: '0 0 10px rgba(255,255,255,0.2)' }}>{bmiVal}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '20px', border: `1px solid ${bmiColor}` }}>
                          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: bmiColor, display: 'inline-block', flexShrink: 0, boxShadow: `0 0 8px ${bmiColor}` }} />
                          <span style={{ fontSize: '0.95rem', fontWeight: 'bold', color: bmiColor }}>{bmiLabel}</span>
                        </div>
                      </div>
                      
                      <div style={{ position: 'relative', paddingBottom: '24px', marginTop: '20px' }}>
                        <div style={{ position: 'relative', marginBottom: '4px' }}>
                          <div style={{ display: 'flex', height: '12px', borderRadius: '6px', overflow: 'hidden', gap: '2px' }}>
                            {segments.map((seg, i) => (
                              <div key={i} style={{
                                flex: (seg.to - seg.from) / totalRange,
                                background: seg.color,
                                borderRadius: i === 0 ? '6px 0 0 6px' : i === segments.length - 1 ? '0 6px 6px 0' : '0',
                              }} />
                            ))}
                          </div>
                          <div style={{
                            position: 'absolute',
                            top: '12px',
                            left: `${pointerPct}%`,
                            transform: 'translateX(-50%)',
                            width: 0, height: 0,
                            borderLeft: '6px solid transparent',
                            borderRight: '6px solid transparent',
                            borderTop: '8px solid #fff',
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
                          }} />
                        </div>
                        <div style={{ position: 'relative', height: '16px', marginTop: '8px' }}>
                          {labels.map(v => {
                            const pct = ((v - MIN) / (MAX - MIN)) * 100;
                            return (
                              <span key={v} style={{
                                position: 'absolute',
                                left: `${pct}%`,
                                transform: 'translateX(-50%)',
                                fontSize: '0.7rem',
                                color: 'rgba(255,255,255,0.4)',
                                whiteSpace: 'nowrap',
                              }}>{v}</span>
                            );
                          })}
                        </div>
                      </div>
                      
                      <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', display: 'block' }}>現在の体重</span>
                          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>{currentWeight} <span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>kg</span></span>
                        </div>
                        <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                        <div style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', display: 'block' }}>身長</span>
                          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>{profile.height} <span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>cm</span></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Weight Chart */}
                  <div style={{ flex: '2 1 300px', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginBottom: '10px', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                      <div><span style={{ color: 'rgba(255,255,255,0.5)', marginRight: '6px' }}>最も重い</span><span style={{ color: '#fff', fontWeight: 'bold' }}>{maxWeight} kg</span></div>
                      <div><span style={{ color: 'rgba(255,255,255,0.5)', marginRight: '6px' }}>最も軽い</span><span style={{ color: '#fff', fontWeight: 'bold' }}>{minWeight} kg</span></div>
                    </div>
                    <div style={{ flex: 1, position: 'relative', minHeight: '200px' }}>
                      <Line data={{
                        ...weightChartData,
                        datasets: [{
                          ...weightChartData.datasets[0],
                          borderColor: '#DCA038',
                          backgroundColor: 'rgba(220, 160, 56, 0.1)',
                          pointBackgroundColor: '#DCA038'
                        }]
                      }} options={{
                        ...weightChartOptions as any,
                        scales: {
                          y: { ...(weightChartOptions as any).scales.y, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.5)' } },
                          x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.5)' } }
                        }
                      }} />
                    </div>
                  </div>
                </div>

                {/* BMI Edit Modal */}
                {showBmiEdit && typeof document !== 'undefined' && createPortal(
                  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowBmiEdit(false)}>
                    <div style={{ background: '#1e1e24', borderRadius: '24px', padding: '30px', width: '100%', maxWidth: '480px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }} onClick={e => e.stopPropagation()}>
                      <h3 style={{ margin: '0 0 24px', fontSize: '1.2rem', fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>身体情報の編集</h3>

                      <p style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.7)' }}>体重</p>
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', marginBottom: '8px' }}>
                        <input 
                          type="number" 
                          value={editWeight || ''} 
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '') setEditWeight(0);
                            else setEditWeight(Number(val));
                          }} 
                          style={{ fontSize: '3rem', fontWeight: 'bold', color: '#DCA038', background: 'transparent', border: 'none', borderBottom: '2px solid rgba(220, 160, 56, 0.5)', width: '130px', textAlign: 'center', outline: 'none', padding: 0, margin: 0, lineHeight: 1, textShadow: '0 0 10px rgba(220,160,56,0.3)' }} 
                        />
                        <span style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.5)', marginLeft: '6px' }}>kg</span>
                      </div>
                      <div style={{ position: 'relative', width: '100%', marginBottom: '28px' }}>
                        <RulerPicker min={20} max={200} step={0.5} value={editWeight} onChange={setEditWeight} orientation="horizontal" tickColor="rgba(255,255,255,0.2)" labelColor="rgba(255,255,255,0.5)" />
                      </div>

                      <p style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.7)' }}>身長</p>
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', marginBottom: '8px' }}>
                        <input 
                          type="number" 
                          value={editHeight || ''} 
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '') setEditHeight(0);
                            else setEditHeight(Number(val));
                          }} 
                          style={{ fontSize: '3rem', fontWeight: 'bold', color: '#DCA038', background: 'transparent', border: 'none', borderBottom: '2px solid rgba(220, 160, 56, 0.5)', width: '130px', textAlign: 'center', outline: 'none', padding: 0, margin: 0, lineHeight: 1, textShadow: '0 0 10px rgba(220,160,56,0.3)' }} 
                        />
                        <span style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.5)', marginLeft: '6px' }}>cm</span>
                      </div>
                      <div style={{ position: 'relative', width: '100%', marginBottom: '32px' }}>
                        <RulerPicker min={100} max={250} step={1} value={editHeight} onChange={setEditHeight} orientation="horizontal" tickColor="rgba(255,255,255,0.2)" labelColor="rgba(255,255,255,0.5)" />
                      </div>

                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => setShowBmiEdit(false)} style={{ flex: 1, padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', color: '#fff' }}>キャンセル</button>
                        <button
                          onClick={() => {
                            if (editHeight < 100 || editWeight < 20) return;
                            const updated = saveProfile({ ...profile, height: editHeight, weight: editWeight });
                            setProfile(updated);
                            saveWeightLog({ date: new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-'), weight: editWeight });
                            setShowBmiEdit(false);
                            window.location.reload();
                          }}
                          style={{ flex: 2, padding: '16px', borderRadius: '12px', border: 'none', background: 'linear-gradient(180deg, #FDF0A6, #DCA038)', color: '#000', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(220,160,56,0.3)' }}
                        >保存する</button>
                      </div>
                    </div>
                  </div>, document.body
                )}
              </div>
            );
          })()}

          {/* 🎖️ 称号＆隠し実績 (TITLES & SECRETS) */}
          <div style={{ background: 'rgba(20,20,25,0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '25px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 20px rgba(0,0,0,0.4)', marginTop: '20px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🎖️ 称号＆実績
            </h3>
            
            {/* 称号リスト */}
            <div style={{ marginBottom: '25px' }}>
              <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', fontWeight: 'bold', marginBottom: '12px' }}>🛡️ 獲得称号</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                {titleList.map((t, idx) => (
                  <div 
                    key={idx}
                    onClick={() => alert(`【${t.name}】\n獲得条件: ${t.condition}\n\n${t.progress}`)}
                    style={{
                      background: t.isUnlocked ? 'rgba(220, 160, 56, 0.1)' : 'rgba(255,255,255,0.02)',
                      border: t.isUnlocked ? '1px solid #DCA038' : '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <i className={`fa-solid fa-ribbon`} style={{ color: t.isUnlocked ? '#DCA038' : 'rgba(255,255,255,0.2)', fontSize: '1.2rem' }}></i>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: t.isUnlocked ? '#fff' : 'rgba(255,255,255,0.3)' }}>{t.name}</div>
                      <div style={{ fontSize: '0.7rem', color: t.isUnlocked ? '#DCA038' : 'rgba(255,255,255,0.2)' }}>{t.isUnlocked ? '獲得済み' : 'ロック中'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 実績リスト (バッジ段階＋既存の隠し実績) */}
            <div>
              <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', fontWeight: 'bold', marginBottom: '12px' }}>✨ 実績（ロック要素あり）</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                {allSecrets.map((s, idx) => {
                  const isUnlocked = s.isUnlocked;
                  const tierStyle = isUnlocked && s.tier ? tiers[s.tier] : null;

                  return (
                    <div 
                      key={idx}
                      onClick={() => {
                        if (isUnlocked) {
                          alert(`実績解除！\n【${s.name}】${s.tier ? `（難易度: ${tiers[s.tier].name}）` : ''}\n解除条件: ${s.hint}`);
                        } else {
                          alert(`【未解除の実績】\n条件: ？？？？\n(ヒント: ${s.tier ? `${s.hint.split('を')[0]}など` : 'トレーニング時間やカロリー目標、目標体重の達成などを探求しましょう'})`);
                        }
                      }}
                      style={{
                        background: isUnlocked ? (tierStyle ? tierStyle.bg : 'rgba(76, 175, 80, 0.1)') : 'rgba(255,255,255,0.02)',
                        border: isUnlocked ? (tierStyle ? tierStyle.border : '1px solid #4CAF50') : '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'transform 0.2s',
                        boxShadow: isUnlocked && tierStyle ? tierStyle.shadow : 'none'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <span style={{ fontSize: '1.2rem', filter: isUnlocked ? 'none' : 'grayscale(100%) opacity(30%)' }}>
                        {isUnlocked ? s.emoji : '🔒'}
                      </span>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: isUnlocked ? '#fff' : 'rgba(255,255,255,0.3)' }}>
                          {isUnlocked ? s.name : '？？？？'}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: isUnlocked ? (tierStyle ? tierStyle.color : '#4CAF50') : 'rgba(255,255,255,0.2)' }}>
                          {isUnlocked ? (s.tier ? `${tiers[s.tier].name}ランク` : '解除済み') : '未解除'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );

}
