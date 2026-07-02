'use client';
import React, { useState, useEffect, useRef } from 'react';
import { getMeals, saveMeal, deleteMeal, MealItem } from '@/lib/storage';
import { useAppContext } from '../AppContext';

export default function Meal() {
  const { selectedDate: date, setSelectedDate: setDate } = useAppContext();
  const [meals, setMeals] = useState<MealItem[]>([]);

  const [timing, setTiming] = useState('朝食');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [fat, setFat] = useState('');
  const [carb, setCarb] = useState('');

  const [loadingEstimate, setLoadingEstimate] = useState(false);
  const [loginDates, setLoginDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem('kinnikun_logins');
    const dates = saved ? JSON.parse(saved) : [];
    setLoginDates(new Set(dates));
  }, []);

  useEffect(() => {
    setMeals(getMeals(date));
  }, [date]);

  const shiftDate = (days: number) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return;
    d.setDate(d.getDate() + days);
    setDate(d.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-'));
  };

  const resetForm = () => {
    setName(''); setAmount(''); setCalories(''); setProtein(''); setFat(''); setCarb('');
    setTiming('朝食');
  };

  const handleAddMeal = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name) return alert('食事内容を入力してください');

    let finalName = name;
    let finalAmount = amount ? Number(amount) : undefined;
    let finalCalories = Number(calories) || 0;
    let finalProtein = Number(protein) || 0;
    let finalFat = Number(fat) || 0;
    let finalCarb = Number(carb) || 0;

    // もしカロリーなどが未入力（0）の場合は自動でAI推定を行う
    if (finalCalories === 0 && finalProtein === 0 && finalFat === 0 && finalCarb === 0) {
      setLoadingEstimate(true);
      try {
        const res = await fetch('/api/estimate-meal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description: name, amount })
        });
        const data = await res.json();
        
        if (data.ok && data.result) {
          if (data.result.name) finalName = data.result.name;
          finalCalories = data.result.calories !== undefined ? Math.round(data.result.calories) : 0;
          finalProtein = data.result.protein !== undefined ? Math.round(data.result.protein * 10) / 10 : 0;
          finalFat = data.result.fat !== undefined ? Math.round(data.result.fat * 10) / 10 : 0;
          finalCarb = data.result.carb !== undefined ? Math.round(data.result.carb * 10) / 10 : 0;
          if (data.result.amountGrams !== undefined && data.result.amountGrams > 0) {
            finalAmount = Math.round(data.result.amountGrams);
          }
        } else {
          alert('AI推定失敗: ' + JSON.stringify(data));
          setLoadingEstimate(false);
          return;
        }
      } catch (e) {
        console.error(e);
        alert('エラーが発生しました');
        setLoadingEstimate(false);
        return;
      }
      setLoadingEstimate(false);
    }

    const item: MealItem = {
      date,
      timing,
      name: finalName,
      amount: finalAmount,
      calories: finalCalories,
      protein: finalProtein,
      fat: finalFat,
      carb: finalCarb
    };
    saveMeal(item);
    setMeals(getMeals(date));
    resetForm();
  };

  const handleDelete = (id: string) => {
    deleteMeal(id);
    setMeals(getMeals(date));
  };

  const timingOrder: Record<string, number> = { '朝食': 1, '昼食': 2, '夕食': 3, '間食/プロテイン': 4 };
  const sortedMeals = [...meals].sort((a, b) => (timingOrder[a.timing] || 9) - (timingOrder[b.timing] || 9));
  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);

  // Calendar
  const calendarBase = new Date(date);
  const calendarDays = [];
  let checkedCount = 0;
  for (let i = -3; i <= 3; i++) {
    const d = new Date(calendarBase);
    d.setDate(d.getDate() + i);
    const dStr = d.toISOString().split('T')[0];
    const isChecked = loginDates.has(dStr);
    if (isChecked) checkedCount++;
    calendarDays.push({
      date: d,
      isSelected: i === 0,
      isChecked,
      dayStr: d.getDate(),
      dayName: ['日', '月', '火', '水', '木', '金', '土'][d.getDay()]
    });
  }

  const todayStr = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');

  const timingColors: Record<string, string> = {
    '朝食': '#f59e0b',
    '昼食': '#10b981',
    '夕食': '#6366f1',
    '間食/プロテイン': '#ef4444',
  };

  return (
    <section id="meal" className="content-section active" style={{ paddingBottom: '100px' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '0 16px' }}>

        {/* ── カレンダー（筋トレと同じUI） ── */}
        <div className="workout-goal-calendar" style={{ marginBottom: '16px' }}>
          <div className="workout-goal-header">
            <h3 className="workout-goal-title">食事記録</h3>
            <div className="workout-goal-progress">{checkedCount}/7 <i className="fa-solid fa-fire" style={{ marginLeft: '4px', opacity: 0.5 }} /></div>
          </div>
          <div className="calendar-days-row">
            {calendarDays.map((d, idx) => (
              <div
                key={idx}
                className="calendar-day-col"
                onClick={() => {
                  const ds = d.date.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
                  setDate(ds);
                }}
                style={{ cursor: 'pointer' }}
              >
                <span className="calendar-day-name">{d.dayName}</span>
                <span
                  className={`calendar-day-num ${d.isSelected ? 'active' : ''}`}
                  style={d.isChecked && !d.isSelected ? { color: 'var(--primary)', background: '#e8f0fe', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' } : {}}
                >
                  {d.isChecked ? <i className="fa-solid fa-check" /> : d.dayStr}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── 手動入力フォーム（常時表示） ── */}
        <div style={{
          background: 'var(--card-bg)', borderRadius: '18px', padding: '20px',
          marginBottom: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.07)',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>
              <i className="fa-solid fa-pen" style={{ color: 'var(--primary)', marginRight: '6px' }} />手動入力
            </span>
            <button type="button" onClick={resetForm}
              style={{ background: 'none', border: 'none', fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <i className="fa-solid fa-rotate-left" /> クリア
            </button>
          </div>

          <form onSubmit={handleAddMeal}>
            {/* 食事タイミング */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>食事タイミング</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['朝食', '昼食', '夕食', '間食/プロテイン'].map(t => (
                  <button key={t} type="button" onClick={() => setTiming(t)} style={{
                    padding: '7px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold',
                    border: `2px solid ${timing === t ? timingColors[t] : 'var(--border-color)'}`,
                    background: timing === t ? timingColors[t] + '22' : 'transparent',
                    color: timing === t ? timingColors[t] : 'var(--text-muted)',
                    cursor: 'pointer', transition: 'all 0.15s'
                  }}>{t}</button>
                ))}
              </div>
            </div>

            {/* メニュー */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>メニュー名</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text" placeholder="例: 鳥胸肉とブロッコリー" value={name}
                  onChange={e => setName(e.target.value)}
                  style={{
                    flex: 1, padding: '11px 14px', borderRadius: '10px',
                    border: '1.5px solid var(--border-color)', background: 'var(--bg-secondary)',
                    color: 'var(--text-main)', fontSize: '0.95rem', boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

              {/* 重量 */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>重量 (g)</label>
                <input
                  type="number" placeholder="200" min="0" value={amount}
                  onChange={e => setAmount(e.target.value)}
                  style={{
                    width: '100%', padding: '11px 14px', borderRadius: '10px',
                    border: '1.5px solid var(--border-color)', background: 'var(--bg-secondary)',
                    color: 'var(--text-main)', fontSize: '0.95rem', boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* PFC */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>PFC（栄養素）</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>カロリー (kcal)</label>
                    <input type="number" min="0" placeholder="0" value={calories}
                      onChange={e => setCalories(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-main)', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#ff5224', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>P タンパク質 (g)</label>
                    <input type="number" min="0" step="0.1" placeholder="0" value={protein}
                      onChange={e => setProtein(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #ff5224', background: 'var(--bg-secondary)', color: 'var(--text-main)', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#ffac1c', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>F 脂質 (g)</label>
                    <input type="number" min="0" step="0.1" placeholder="0" value={fat}
                      onChange={e => setFat(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #ffac1c', background: 'var(--bg-secondary)', color: 'var(--text-main)', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#00c853', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>C 炭水化物 (g)</label>
                    <input type="number" min="0" step="0.1" placeholder="0" value={carb}
                      onChange={e => setCarb(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #00c853', background: 'var(--bg-secondary)', color: 'var(--text-main)', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loadingEstimate} style={{
                width: '100%', padding: '14px', borderRadius: '12px',
                background: loadingEstimate ? 'var(--bg-secondary)' : 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                color: loadingEstimate ? 'var(--text-muted)' : '#fff', fontWeight: 'bold', fontSize: '1rem', border: loadingEstimate ? '1px solid var(--border-color)' : 'none',
                cursor: loadingEstimate ? 'default' : 'pointer', boxShadow: loadingEstimate ? 'none' : '0 4px 12px rgba(26,115,232,0.3)'
              }}>
                {loadingEstimate ? (
                  <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }} />AI推定して追加中...</>
                ) : (
                  <><i className="fa-solid fa-check" style={{ marginRight: '8px' }} />食事を追加</>
                )}
              </button>
            </form>
          </div>

          {/* ── 区切り ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>今日の食事一覧</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
        </div>

        {/* ── 合計カロリー ── */}
        {meals.length > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
            borderRadius: '14px', padding: '12px 20px', marginBottom: '14px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>合計カロリー</span>
            <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.3rem' }}>
              {totalCalories.toLocaleString()} <span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>kcal</span>
            </span>
          </div>
        )}

        {/* ── 食事一覧 ── */}
        {sortedMeals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <i className="fa-solid fa-utensils" style={{ fontSize: '2rem', marginBottom: '10px', display: 'block', opacity: 0.3 }} />
            <p style={{ margin: 0 }}>まだ食事が記録されていません</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {sortedMeals.map(m => (
              <div key={m.id} style={{
                background: 'var(--card-bg)', borderRadius: '14px', padding: '14px 16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid var(--border-color)',
                display: 'flex', alignItems: 'center', gap: '12px'
              }}>
                <div style={{
                  width: '6px', alignSelf: 'stretch', borderRadius: '3px', flexShrink: 0,
                  background: timingColors[m.timing] || '#8b8d9a'
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '20px',
                      background: (timingColors[m.timing] || '#8b8d9a') + '22',
                      color: timingColors[m.timing] || '#8b8d9a'
                    }}>{m.timing}</span>
                    <span style={{ fontWeight: 'bold', fontSize: '0.95rem', color: 'var(--text-main)' }}>
                      {m.name}{m.amount ? ` (${m.amount}g)` : ''}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '10px' }}>
                    <span style={{ color: '#ff5224' }}>P {m.protein}g</span>
                    <span style={{ color: '#ffac1c' }}>F {m.fat}g</span>
                    <span style={{ color: '#00c853' }}>C {m.carb}g</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '1rem' }}>{m.calories}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>kcal</div>
                </div>
                <button onClick={() => handleDelete(m.id as string)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px 6px', fontSize: '0.9rem' }}>
                  <i className="fa-solid fa-trash-can" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
