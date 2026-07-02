'use client';
import React, { useEffect, useState } from 'react';
import { useAppContext } from '../AppContext';
import { getProfile, getWorkouts, getMeals, getWeightLogs, saveWeightLog, saveProfile, Profile, WorkoutItem, MealItem, WeightLog } from '@/lib/storage';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, Filler } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import RulerPicker from '@/components/ui/RulerPicker';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, Filler);

export default function Dashboard() {
  const { activeTab, setActiveTab } = useAppContext();
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

  return (
    <section id="dashboard" className="content-section active">
      <div className="dashboard-grid">
        {/* Goal Summary Banner */}
        <div className="summary-card glass-panel" style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', padding: '24px 30px', gap: '20px', borderLeft: '4px solid var(--accent-color)' }}>
          <div style={{ flex: '0 0 auto', minWidth: '150px', textAlign: 'left' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-muted)' }}>現在の目標</h3>
            <h2 style={{ margin: '5px 0 0 0', fontSize: '1.5rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {profile.goal === 'lose-fat' || profile.goal === 'ダイエット・減量' || profile.goal === '減量' ? '🔥 ダイエット・減量' : 
               profile.goal === 'gain-muscle' || profile.goal === '筋肥大・バルクアップ' || profile.goal === '増量' ? '💪 筋肥大・バルクアップ' : 
               profile.goal === 'maintain' || profile.goal === '健康維持・体力アップ' || profile.goal === '維持' ? '🏃‍♂️ 健康維持・体力アップ' : 
               `🎯 ${profile.goal || '目標未設定'}`}
            </h2>
          </div>
          
          <div className="dashboard-stat-middle">
            {(() => {
              const estDays = profile.estimatedDays || (() => {
                const w = Number(profile.weight);
                const tw = Number(profile.targetWeight);
                if (!w || !tw) return null;
                const diff = Math.abs(w - tw);
                if (diff === 0) return 0;
                const dailyDiff = 400; // 1日あたりの目標摂取カロリーと消費の差分目安
                return Math.round((diff * 7700) / dailyDiff);
              })();
              
              if (estDays !== null && estDays !== undefined) {
                return (
                  <p className="estimated-days-text">
                    目標達成まで約 {estDays} 日
                  </p>
                );
              }
              return <p style={{ margin: '0', fontSize: '1.2rem', color: 'var(--text-muted)' }}>目標までの日数を計算中...</p>;
            })()}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: '1 1 auto', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
               <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>目標カロリー</p>
               <p style={{ margin: '2px 0 0 0', fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{profile.targetCalories ? profile.targetCalories.toLocaleString() : '-'} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>kcal</span></p>
            </div>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'nowrap', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                 <p style={{ margin: 0, fontSize: '0.8rem', color: '#ff5224', whiteSpace: 'nowrap' }}>P (タンパク質)</p>
                 <p style={{ margin: '2px 0 0 0', fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>{profile.targetProtein || '-'} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>g</span></p>
              </div>
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                 <p style={{ margin: 0, fontSize: '0.8rem', color: '#ffac1c', whiteSpace: 'nowrap' }}>F (脂質)</p>
                 <p style={{ margin: '2px 0 0 0', fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>{profile.targetFat || '-'} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>g</span></p>
              </div>
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                 <p style={{ margin: 0, fontSize: '0.8rem', color: '#00e676', whiteSpace: 'nowrap' }}>C (炭水化物)</p>
                 <p style={{ margin: '2px 0 0 0', fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>{profile.targetCarb || '-'} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>g</span></p>
              </div>
            </div>
          </div>
        </div>

        <div className="summary-card glass-panel calories-card">
          <div className="card-header">
            <h3><i className="fa-solid fa-fire-flame-curved icon-orange"></i> カロリーバランス</h3>
            <span className="card-subtitle">摂取 vs 消費</span>
          </div>
          <div className="calorie-progress-container">
            <div className="calorie-circle-wrapper">
              <div className="calorie-val-box">
                <span className="num-large">{consumedCalories.toLocaleString()}</span>
                <span className="num-unit">/ <span>{profile.targetCalories?.toLocaleString()}</span> kcal</span>
                <span className="num-label">摂取</span>
              </div>
              <div className="circular-progress" style={{ '--cal-progress': `${progressPercent}%` } as React.CSSProperties}></div>
            </div>
            <div className="calorie-details">
              <div className="cal-detail-item">
                <span className="detail-label">目標摂取</span>
                <span className="detail-val">{profile.targetCalories?.toLocaleString()} kcal</span>
              </div>
              <div className="cal-detail-item">
                <span className="detail-label">現在摂取</span>
                <span className="detail-val text-primary">{consumedCalories.toLocaleString()} kcal</span>
              </div>
              <div className="cal-detail-item">
                <span className="detail-label">消費（運動）</span>
                <span className="detail-val text-accent">{burnedCalories.toLocaleString()} kcal</span>
              </div>
              <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '10px', paddingTop: '10px' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 'bold', letterSpacing: '0.05em' }}>本日のPFC摂取</p>
                <div className="cal-detail-item">
                  <span className="detail-label" style={{ color: '#F59E0B' }}>P (タンパク質)</span>
                  <span className="detail-val" style={{ color: '#F59E0B' }}>{Math.round(totalP)} g</span>
                </div>
                <div className="cal-detail-item">
                  <span className="detail-label" style={{ color: '#FBBF24' }}>F (脂質)</span>
                  <span className="detail-val" style={{ color: '#FBBF24' }}>{Math.round(totalF)} g</span>
                </div>
                <div className="cal-detail-item">
                  <span className="detail-label" style={{ color: '#EF4444' }}>C (炭水化物)</span>
                  <span className="detail-val" style={{ color: '#EF4444' }}>{Math.round(totalC)} g</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="summary-card glass-panel pfc-card">
          <div className="card-header">
            <h3><i className="fa-solid fa-pie-chart icon-green"></i> PFCバランス</h3>
            <span className="card-subtitle">三大栄養素比率</span>
          </div>
          <div className="pfc-chart-container">
            <div className="chart-wrapper">
              <Doughnut data={pfcData} options={pfcOptions} />
            </div>
            <div className="pfc-legend">
              <div className="pfc-legend-item protein">
                <span className="dot"></span>
                <span className="label">P: タンパク質</span>
                <span className="val">{totalP.toFixed(1)}g / {profile.targetProtein}g</span>
              </div>
              <div className="pfc-legend-item fat">
                <span className="dot"></span>
                <span className="label">F: 脂質</span>
                <span className="val">{totalF.toFixed(1)}g / {profile.targetFat}g</span>
              </div>
              <div className="pfc-legend-item carb">
                <span className="dot"></span>
                <span className="label">C: 炭水化物</span>
                <span className="val">{totalC.toFixed(1)}g / {profile.targetCarb}g</span>
              </div>
            </div>
          </div>
        </div>


        <div className="summary-card glass-panel chart-card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <h3><i className="fa-solid fa-chart-column icon-accent"></i> 過去1週間のカロリー推移</h3>
            <span className="card-subtitle">摂取 vs 消費</span>
          </div>
          <div className="weekly-chart-container" style={{ position: 'relative', height: '300px', width: '100%' }}>
            <Bar data={weeklyData} options={weeklyOptions} />
          </div>
        </div>

        <div className="summary-card glass-panel chart-card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ margin: 0 }}><i className="fa-solid fa-weight-scale icon-blue"></i> 体重</h3>
            </div>
            <button onClick={handleRecordWeight} style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '20px', padding: '8px 16px', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(26,115,232,0.2)' }}>記録する</button>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', margin: '10px 0 20px 0', padding: '0 10px' }}>
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>現在</span>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-main)', marginTop: '5px', lineHeight: 1 }}>
                {currentWeight} <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>kg</span>
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.9rem' }}>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)', marginRight: '15px' }}>最も重い</span>
                <span style={{ fontWeight: 'bold', color: 'var(--text-main)', fontSize: '1.1rem' }}>{maxWeight}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', marginRight: '15px' }}>最も軽い</span>
                <span style={{ fontWeight: 'bold', color: 'var(--text-main)', fontSize: '1.1rem' }}>{minWeight}</span>
              </div>
            </div>
          </div>

          <div className="weight-chart-container" style={{ position: 'relative', height: '220px', width: '100%' }}>
            <Line data={weightChartData} options={weightChartOptions as any} />
          </div>
        </div>

        {/* BMI カード */}
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
            <div className="summary-card glass-panel chart-card" style={{ gridColumn: '1 / -1' }}>
              <div className="card-header">
                <h3><i className="fa-solid fa-person icon-blue"></i> BMI</h3>
                <button
                  onClick={() => { setEditHeight(profile.height); setEditWeight(currentWeight); setShowBmiEdit(true); }}
                  style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '20px', padding: '8px 16px', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(26,115,232,0.2)' }}
                >編集</button>
              </div>
              {/* 身長・体重編集モーダル */}
              {showBmiEdit && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setShowBmiEdit(false)}>
                  <div style={{ background: '#fff', borderRadius: '24px 24px 0 0', padding: '16px 0 40px', width: '100%', maxWidth: '480px', boxShadow: '0 -8px 40px rgba(0,0,0,0.2)', maxHeight: '92vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                    <div style={{ width: '36px', height: '4px', background: '#dee2e6', borderRadius: '2px', margin: '0 auto 16px' }} />
                    <div style={{ padding: '0 24px' }}>
                      <h3 style={{ margin: '0 0 24px', fontSize: '1.1rem', fontWeight: 700 }}>BMI</h3>

                      {/* 体重 */}
                      <p style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 700, color: '#212529' }}>体重</p>
                      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>{editWeight}</span>
                        <span style={{ fontSize: '1.1rem', color: '#6c757d', marginLeft: '6px' }}>kg</span>
                      </div>
                    </div>
                    {/* 体重ルーラー */}
                    <div style={{ position: 'relative', width: '100%', marginBottom: '28px' }}>
                      <RulerPicker min={20} max={200} step={0.5} value={editWeight} onChange={setEditWeight} orientation="horizontal" tickColor="#ced4da" labelColor="#6c757d" />
                    </div>

                    <div style={{ padding: '0 24px' }}>
                      {/* 身長 */}
                      <p style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 700, color: '#212529' }}>身長</p>
                      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>{editHeight}</span>
                        <span style={{ fontSize: '1.1rem', color: '#6c757d', marginLeft: '6px' }}>cm</span>
                      </div>
                    </div>
                    {/* 身長ルーラー */}
                    <div style={{ position: 'relative', width: '100%', marginBottom: '32px' }}>
                      <RulerPicker min={100} max={250} step={1} value={editHeight} onChange={setEditHeight} orientation="horizontal" tickColor="#ced4da" labelColor="#6c757d" />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', padding: '0 24px' }}>
                      <button onClick={() => setShowBmiEdit(false)} style={{ flex: 1, padding: '16px', borderRadius: '50px', border: '1.5px solid #dee2e6', background: '#fff', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', color: '#495057' }}>キャンセル</button>
                      <button
                        onClick={() => {
                          if (editHeight < 100 || editWeight < 20) return;
                          const updated = saveProfile({ ...profile, height: editHeight, weight: editWeight });
                          setProfile(updated);
                          setShowBmiEdit(false);
                        }}
                        style={{ flex: 2, padding: '16px', borderRadius: '50px', border: 'none', background: 'var(--primary)', color: '#fff', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}
                      >保存</button>
                    </div>
                  </div>
                </div>
              )}
              <div style={{ padding: '4px 10px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ fontSize: '2.4rem', fontWeight: 'bold', color: 'var(--text-main)', lineHeight: 1 }}>{bmiVal}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: bmiColor, display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>{bmiLabel}</span>
                  </div>
                </div>
                <div style={{ position: 'relative', paddingBottom: '24px' }}>
                  <div style={{ position: 'relative', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', height: '10px', borderRadius: '6px', overflow: 'hidden', gap: '2px' }}>
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
                      top: '10px',
                      left: `${pointerPct}%`,
                      transform: 'translateX(-50%)',
                      width: 0, height: 0,
                      borderLeft: '5px solid transparent',
                      borderRight: '5px solid transparent',
                      borderTop: '7px solid var(--text-main, #333)',
                    }} />
                  </div>
                  <div style={{ position: 'relative', height: '16px', marginTop: '6px' }}>
                    {labels.map(v => {
                      const pct = ((v - MIN) / (MAX - MIN)) * 100;
                      return (
                        <span key={v} style={{
                          position: 'absolute',
                          left: `${pct}%`,
                          transform: 'translateX(-50%)',
                          fontSize: '0.68rem',
                          color: 'var(--text-muted)',
                          whiteSpace: 'nowrap',
                        }}>{v}</span>
                      );
                    })}
                  </div>
                </div>
                <div style={{ marginTop: '8px', padding: '10px 12px', background: 'var(--bg-secondary, rgba(0,0,0,0.03))', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <span>身長</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{profile.height} cm</span>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </section>
  );
}
