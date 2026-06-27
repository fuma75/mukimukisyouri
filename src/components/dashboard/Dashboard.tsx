'use client';
import React, { useEffect, useState } from 'react';
import { useAppContext } from '../AppContext';
import { getProfile, getWorkouts, getMeals, getWeightLogs, saveWeightLog, Profile, WorkoutItem, MealItem, WeightLog } from '@/lib/storage';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, Filler } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, Filler);

export default function Dashboard() {
  const { activeTab, setActiveTab } = useAppContext();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workouts, setWorkouts] = useState<WorkoutItem[]>([]);
  const [meals, setMeals] = useState<MealItem[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [mounted, setMounted] = useState(false);

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
      backgroundColor: hasData ? ['#ff5224', '#ffac1c', '#00e676'] : ['#f1f3f5'],
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
        borderColor: '#1a73e8',
        backgroundColor: 'rgba(26, 115, 232, 0.2)',
        fill: true,
        tension: 0.1,
        pointBackgroundColor: '#1a73e8',
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
              {profile.goal === 'lose-fat' || profile.goal === 'ダイエット・減量' ? '🔥 ダイエット・減量' : 
               profile.goal === 'gain-muscle' || profile.goal === '筋肥大・バルクアップ' ? '💪 筋肥大・バルクアップ' : 
               profile.goal === 'maintain' || profile.goal === '健康維持・体力アップ' ? '🏃‍♂️ 健康維持・体力アップ' : 
               `🎯 ${profile.goal || '目標未設定'}`}
            </h2>
          </div>
          
          <div className="dashboard-stat-middle">
            {profile.estimatedDays ? (
                <p className="estimated-days-text">
                  目標達成まで約 {profile.estimatedDays} 日
                </p>
            ) : (
               <p style={{ margin: '0', fontSize: '1.2rem', color: 'var(--text-muted)' }}>目標までの日数を計算中...</p>
            )}
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
                  <span className="detail-label" style={{ color: '#ff5224' }}>P (タンパク質)</span>
                  <span className="detail-val" style={{ color: '#ff5224' }}>{Math.round(totalP)} g</span>
                </div>
                <div className="cal-detail-item">
                  <span className="detail-label" style={{ color: '#ffac1c' }}>F (脂質)</span>
                  <span className="detail-val" style={{ color: '#ffac1c' }}>{Math.round(totalF)} g</span>
                </div>
                <div className="cal-detail-item">
                  <span className="detail-label" style={{ color: '#00e676' }}>C (炭水化物)</span>
                  <span className="detail-val" style={{ color: '#00e676' }}>{Math.round(totalC)} g</span>
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

        <div className="summary-card glass-panel workout-summary-card">
          <div className="card-header">
            <h3><i className="fa-solid fa-dumbbell icon-blue"></i> 本日のトレーニング</h3>
            <button className="btn btn-icon btn-sm" title="トレーニングを追加" onClick={() => setActiveTab('workout')}>
              <i className="fa-solid fa-plus"></i>
            </button>
          </div>
          <div className="workout-summary-content">
            {workouts.length === 0 ? (
              <div className="empty-state">
                <i className="fa-solid fa-circle-info"></i>
                <p>今日の筋トレはまだ記録されていません。</p>
                <button className="btn btn-secondary btn-sm nav-trigger-btn" onClick={() => setActiveTab('workout')}>筋トレを記録する</button>
              </div>
            ) : (
              <div className="workout-summary-dashboard-view">
                <div className="dashboard-workout-stats">
                    <div className="stat-box">
                        <span className="stat-label">総ボリューム</span>
                        <span className="stat-val text-accent">{totalVolume.toLocaleString()} <span className="unit">kg</span></span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-label">実施部位数</span>
                        <span className="stat-val">{Object.keys(summaryMap).length}</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-label">総セット数</span>
                        <span className="stat-val">{totalSets} <span className="unit">sets</span></span>
                    </div>
                </div>
                <div className="dashboard-workout-details-list">
                  {Object.entries(summaryMap).map(([cat, ws]) => {
                    let categoryClass = 'other';
                    switch (cat) {
                        case '胸': categoryClass = 'chest'; break;
                        case '背中': categoryClass = 'back'; break;
                        case '脚': categoryClass = 'legs'; break;
                        case '肩': categoryClass = 'shoulders'; break;
                        case '腕': categoryClass = 'arms'; break;
                        case '腹筋': categoryClass = 'abs'; break;
                    }
                    const exercisesStr = ws.map(w => `${w.exercise}(${w.sets}set)`).join(', ');
                    return (
                      <div key={cat} className="dashboard-workout-detail-row">
                          <span className={`history-category-badge ${categoryClass}`}>{cat}</span>
                          <span className="ex-detail-text">{exercisesStr}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
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
            <button onClick={handleRecordWeight} style={{ background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '20px', padding: '8px 16px', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(26,115,232,0.2)' }}>記録する</button>
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
      </div>
    </section>
  );
}
