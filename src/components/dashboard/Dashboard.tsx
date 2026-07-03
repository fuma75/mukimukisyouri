'use client';
import React, { useEffect, useState } from 'react';
import { useAppContext } from '../AppContext';
import { getProfile, getWorkouts, getMeals, getWeightLogs, saveWeightLog, saveProfile, Profile, WorkoutItem, MealItem, WeightLog } from '@/lib/storage';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, Filler } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import RulerPicker from '@/components/ui/RulerPicker';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, Filler);

export default function Dashboard() {
  const { activeTab, setActiveTab, textSize } = useAppContext();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workouts, setWorkouts] = useState<WorkoutItem[]>([]);
  const [meals, setMeals] = useState<MealItem[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [mounted, setMounted] = useState(false);
  const [showBmiEdit, setShowBmiEdit] = useState(false);
  const [editHeight, setEditHeight] = useState(167);
  const [editWeight, setEditWeight] = useState(60);

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

  const handleRecordWeight = () => {
    const input = window.prompt(`本日の体重を入力してください (現在の設定: ${profile.weight}kg):`, currentWeight.toString());
    if (input) {
      const w = parseFloat(input);
      if (!isNaN(w) && w > 0) {
        const todayStr = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
        saveWeightLog({ date: todayStr, weight: w });
        
        // Also update profile weight if it's the latest
        const p = getProfile();
        p.weight = w;
        localStorage.setItem('kinnikun_profile', JSON.stringify(p));
        
        // Reload to update chart
        window.location.reload();
      } else {
        alert('正しい数値を入力してください。');
      }
    }
  };



  // Scale chart fonts based on textSize
  ChartJS.defaults.color = 'rgba(255, 255, 255, 0.6)';
  ChartJS.defaults.font.size = textSize === 'large' ? 14 : 12;
  
  const todayStrHeader = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });

  return (
    <section id="dashboard" className="content-section active" style={{ paddingBottom: '100px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 16px' }}>
        
        {/* Header matching image */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
          <div>
            <h1 className="logo-text-premium" style={{ fontSize: '32px', margin: 0, textShadow: '0 2px 10px rgba(220,160,56,0.2)', color: '#fff' }}>ダッシュボード</h1>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginTop: '6px', fontWeight: 'bold' }}>
              {todayStrHeader}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '5px' }}>
            <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid #ef4444', padding: '6px 12px', borderRadius: '20px', color: '#ef4444', fontSize: '12px', fontWeight: 'bold' }}>
              <i className="fa-solid fa-fire"></i> {profile.streak || 0}日連続
            </div>
            <div style={{ background: 'rgba(20,20,20,0.8)', border: '1px solid rgba(220,160,56,0.2)', padding: '6px 16px 6px 6px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(180deg, #FDF0A6, #DCA038)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                <i className="fa-solid fa-user"></i>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: '#fff', fontSize: '12px', fontWeight: 'bold', lineHeight: 1.2 }}>{profile.name || 'がお'}</span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', lineHeight: 1.2 }}>目標: {profile.goal?.includes('減量') ? '減量' : profile.goal?.includes('肥大') ? '増量' : '維持'}</span>
              </div>
              <i className="fa-solid fa-chevron-down" style={{ color: '#DCA038', fontSize: '10px', marginLeft: '5px' }}></i>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Goal Summary Banner */}
          <div style={{ background: 'rgba(20,20,25,0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '30px 40px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold', letterSpacing: '0.05em' }}>現在の目標</p>
              <h2 style={{ margin: '8px 0 0 0', fontSize: '1.6rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {profile.goal === 'lose-fat' || profile.goal === 'ダイエット・減量' || profile.goal === '減量' ? '🔥 ダイエット・減量' : 
                 profile.goal === 'gain-muscle' || profile.goal === '筋肥大・バルクアップ' || profile.goal === '増量' ? '💪 筋肥大・バルクアップ' : 
                 profile.goal === 'maintain' || profile.goal === '健康維持・体力アップ' || profile.goal === '維持' ? '🏃‍♂️ 健康維持・体力アップ' : 
                 `🎯 ${profile.goal || '目標未設定'}`}
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
          {/* Calorie Balance */}
          <div style={{ background: 'rgba(20,20,25,0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '25px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🔥 カロリーバランス
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold', letterSpacing: '0.05em' }}>摂取 VS 消費</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '30px', flex: 1 }}>
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
              
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>目標摂取</span>
                  <span style={{ color: '#fff', fontWeight: 'bold' }}>{profile.targetCalories?.toLocaleString()} kcal</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>現在摂取</span>
                  <span style={{ color: '#DCA038', fontWeight: 'bold' }}>{consumedCalories.toLocaleString()} kcal</span>
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
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '30px', flex: 1 }}>
              <div style={{ width: '140px', height: '140px', flexShrink: 0, position: 'relative' }}>
                <Doughnut data={pfcData} options={{...pfcOptions, cutout: '80%'}} />
                {/* Fallback empty ring if no data */}
                {!hasData && (
                   <svg width="140" height="140" viewBox="0 0 140 140" style={{ position: 'absolute', top: 0, left: 0 }}>
                     <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="15" />
                   </svg>
                )}
              </div>
              
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
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

          {/* BMI Chart (Kept but matched style) */}
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
                  <div style={{ flex: '1', minWidth: '300px' }}>
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
                  <div style={{ flex: '2', minWidth: '300px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px', marginBottom: '10px', fontSize: '0.85rem' }}>
                      <div><span style={{ color: 'rgba(255,255,255,0.5)', marginRight: '8px' }}>最も重い</span><span style={{ color: '#fff', fontWeight: 'bold' }}>{maxWeight} kg</span></div>
                      <div><span style={{ color: 'rgba(255,255,255,0.5)', marginRight: '8px' }}>最も軽い</span><span style={{ color: '#fff', fontWeight: 'bold' }}>{minWeight} kg</span></div>
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
                {showBmiEdit && (
                  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowBmiEdit(false)}>
                    <div style={{ background: '#1e1e24', borderRadius: '24px', padding: '30px', width: '100%', maxWidth: '480px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }} onClick={e => e.stopPropagation()}>
                      <h3 style={{ margin: '0 0 24px', fontSize: '1.2rem', fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>身体情報の編集</h3>

                      <p style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.7)' }}>体重</p>
                      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '3rem', fontWeight: 'bold', color: '#DCA038', lineHeight: 1, textShadow: '0 0 10px rgba(220,160,56,0.3)' }}>{editWeight}</span>
                        <span style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.5)', marginLeft: '6px' }}>kg</span>
                      </div>
                      <div style={{ position: 'relative', width: '100%', marginBottom: '28px' }}>
                        <RulerPicker min={20} max={200} step={0.5} value={editWeight} onChange={setEditWeight} orientation="horizontal" tickColor="rgba(255,255,255,0.2)" labelColor="rgba(255,255,255,0.5)" />
                      </div>

                      <p style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.7)' }}>身長</p>
                      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '3rem', fontWeight: 'bold', color: '#DCA038', lineHeight: 1, textShadow: '0 0 10px rgba(220,160,56,0.3)' }}>{editHeight}</span>
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
                  </div>
                )}
              </div>
            );
          })()}

        </div>
      </div>
    </section>
  );

}
