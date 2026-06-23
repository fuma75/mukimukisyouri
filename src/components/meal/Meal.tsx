'use client';
import React, { useState, useEffect } from 'react';
import { getMeals, saveMeal, deleteMeal, MealItem } from '@/lib/storage';

const MEAL_PRESETS: Record<string, Omit<MealItem, 'id' | 'date' | 'timing'>> = {
  'salad-chicken': { name: 'サラダチキン', calories: 120, protein: 25.0, fat: 1.5, carb: 0.0 },
  'protein': { name: 'プロテインシェイク', calories: 120, protein: 24.0, fat: 1.5, carb: 3.0 },
  'rice-egg': { name: '卵かけご飯 (ご飯150g+卵1個)', calories: 330, protein: 10.5, fat: 6.5, carb: 56.0 },
  'beef-don': { name: '牛丼 (並盛)', calories: 730, protein: 20.0, fat: 25.0, carb: 95.0 },
  'salmon-teishoku': { name: '鮭の塩焼き定食 (ご飯普通盛り)', calories: 620, protein: 34.0, fat: 12.0, carb: 82.0 }
};

export default function Meal() {
  const [date, setDate] = useState(() => new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-'));
  const [meals, setMeals] = useState<MealItem[]>([]);

  const [timing, setTiming] = useState('朝食');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [fat, setFat] = useState('');
  const [carb, setCarb] = useState('');

  const [loadingEstimate, setLoadingEstimate] = useState(false);
  const [loadingImageEstimate, setLoadingImageEstimate] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMeals(getMeals(date));
  }, [date]);

  const shiftDate = (days: number) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return;
    d.setDate(d.getDate() + days);
    setDate(d.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-'));
  };

  const handleApplyPreset = (presetKey: string) => {
    const data = MEAL_PRESETS[presetKey];
    if (data) {
      setName(data.name);
      setCalories(data.calories.toString());
      setProtein(data.protein.toString());
      setFat(data.fat.toString());
      setCarb(data.carb.toString());
    }
  };

  const handleAddMeal = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name) return alert('食事内容を入力してください');

    const item: MealItem = {
      date,
      timing,
      name,
      amount: amount ? Number(amount) : undefined,
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      fat: Number(fat) || 0,
      carb: Number(carb) || 0
    };
    saveMeal(item);
    setMeals(getMeals(date));
    setName(''); setAmount(''); setCalories(''); setProtein(''); setFat(''); setCarb('');
  };

  const handleDelete = (id: string) => {
    deleteMeal(id);
    setMeals(getMeals(date));
  };

  const handleEstimateMeal = async () => {
    if (!name) return alert('食事内容を入力してください。');
    setLoadingEstimate(true);
    try {
      const res = await fetch('/api/estimate-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: name, amount: Number(amount) || undefined })
      });
      const data = await res.json();
      if (data.ok && data.result) {
        if (data.result.calories !== undefined) setCalories(Math.round(data.result.calories).toString());
        if (data.result.protein !== undefined) setProtein((Math.round(data.result.protein * 10) / 10).toString());
        if (data.result.fat !== undefined) setFat((Math.round(data.result.fat * 10) / 10).toString());
        if (data.result.carb !== undefined) setCarb((Math.round(data.result.carb * 10) / 10).toString());
        if (!amount && data.result.amountGrams !== undefined) setAmount(Math.round(data.result.amountGrams).toString());
        // Do not alert, it's disruptive. Just finish smoothly.
      } else {
        alert('AI推定失敗: ' + JSON.stringify(data));
      }
    } catch (e) {
      console.error(e);
      alert('エラーが発生しました');
    } finally {
      setLoadingEstimate(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingImageEstimate(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const res = await fetch('/api/estimate-meal-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64Data, mimeType: file.type })
        });
        const data = await res.json();
        
        if (data.ok && data.result) {
          if (data.result.name) setName(data.result.name);
          if (data.result.calories !== undefined) setCalories(Math.round(data.result.calories).toString());
          if (data.result.protein !== undefined) setProtein((Math.round(data.result.protein * 10) / 10).toString());
          if (data.result.fat !== undefined) setFat((Math.round(data.result.fat * 10) / 10).toString());
          if (data.result.carb !== undefined) setCarb((Math.round(data.result.carb * 10) / 10).toString());
          if (data.result.amountGrams !== undefined) setAmount(Math.round(data.result.amountGrams).toString());
        } else {
          alert('写真からのAI推定失敗: ' + JSON.stringify(data));
        }
        setLoadingImageEstimate(false);
        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsDataURL(file);
    } catch (e) {
      console.error(e);
      alert('エラーが発生しました');
      setLoadingImageEstimate(false);
    }
  };

  const timingOrder: Record<string, number> = { '朝食': 1, '昼食': 2, '夕食': 3, '間食/プロテイン': 4 };
  const sortedMeals = [...meals].sort((a, b) => (timingOrder[a.timing] || 9) - (timingOrder[b.timing] || 9));

  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);

  return (
    <section id="meal" className="content-section active">
      <div className="section-layout">
        <div className="form-container glass-panel">
          <div className="panel-header">
            <h2><i className="fa-solid fa-plus-circle icon-blue"></i> 食事を記録する</h2>
            <div className="date-picker-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button type="button" className="btn btn-icon btn-sm" onClick={() => shiftDate(-1)}><i className="fa-solid fa-chevron-left"></i></button>
              <label><i className="fa-regular fa-calendar"></i></label>
              <input type="date" className="date-input" value={date} onChange={e => setDate(e.target.value)} />
              <button type="button" className="btn btn-icon btn-sm" onClick={() => shiftDate(1)}><i className="fa-solid fa-chevron-right"></i></button>
            </div>
          </div>
          
          <div className="preset-section">
            <label className="section-sub-label">クイック登録（よくあるメニュー）</label>
            <div className="preset-buttons">
              <button type="button" className="btn btn-preset" onClick={() => handleApplyPreset('salad-chicken')}>サラダチキン</button>
              <button type="button" className="btn btn-preset" onClick={() => handleApplyPreset('protein')}>プロテイン</button>
              <button type="button" className="btn btn-preset" onClick={() => handleApplyPreset('rice-egg')}>卵かけご飯</button>
              <button type="button" className="btn btn-preset" onClick={() => handleApplyPreset('beef-don')}>牛丼</button>
              <button type="button" className="btn btn-preset" onClick={() => handleApplyPreset('salmon-teishoku')}>鮭の塩焼き定食</button>
            </div>
          </div>

          <form className="app-form" onSubmit={handleAddMeal}>
            <div className="form-group">
              <label>食事のタイミング</label>
              <select value={timing} onChange={e => setTiming(e.target.value)}>
                <option value="朝食">朝食</option>
                <option value="昼食">昼食</option>
                <option value="夕食">夕食</option>
                <option value="間食/プロテイン">間食/プロテイン</option>
              </select>
            </div>
            <div className="form-group">
              <label>食事内容・メニュー名</label>
              <input type="text" placeholder="例: 鳥胸肉とブロッコリーのソテー" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>量 (g)</label>
              <input type="number" placeholder="例: 200" min="0" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>エネルギー (kcal)</label>
                <input type="number" min="0" placeholder="0" value={calories} onChange={e => setCalories(e.target.value)} />
              </div>
              <div className="form-group">
                <label>タンパク質 (g)</label>
                <input type="number" min="0" step="0.1" placeholder="P" value={protein} onChange={e => setProtein(e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>脂質 (g)</label>
                <input type="number" min="0" step="0.1" placeholder="F" value={fat} onChange={e => setFat(e.target.value)} />
              </div>
              <div className="form-group">
                <label>炭水化物 (g)</label>
                <input type="number" min="0" step="0.1" placeholder="C" value={carb} onChange={e => setCarb(e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px', flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-outline" onClick={handleEstimateMeal} disabled={loadingEstimate || loadingImageEstimate}>
                {loadingEstimate ? '推定中...' : 'テキストからAI栄養推定'}
              </button>
              
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleImageUpload} 
              />
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => fileInputRef.current?.click()} 
                disabled={loadingEstimate || loadingImageEstimate}
                style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
              >
                <i className="fa-solid fa-camera"></i> {loadingImageEstimate ? '写真分析中...' : '写真からAI栄養推定'}
              </button>

              <button type="submit" className="btn btn-primary btn-block" style={{ flex: '1 1 100%' }}>
                <i className="fa-solid fa-utensils"></i> 食事を追加
              </button>
            </div>
          </form>
        </div>

        <div className="list-container glass-panel">
          <div className="panel-header">
            <h2><i className="fa-solid fa-history icon-blue"></i> 食事履歴 (<span id="selected-meal-date-str">{date === new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-') ? '今日' : date}</span>)</h2>
            <span className="total-volume-badge">合計カロリー: <span>{totalCalories.toLocaleString()}</span> kcal</span>
          </div>
          <div className="scroll-list">
            {sortedMeals.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>この日の食事記録はありません。</div>
            ) : (
              sortedMeals.map(m => {
                let timingClass = 'other';
                if (m.timing === '朝食') timingClass = 'chest';
                else if (m.timing === '昼食') timingClass = 'legs';
                else if (m.timing === '夕食') timingClass = 'back';
                else if (m.timing === '間食/プロテイン') timingClass = 'arms';

                return (
                  <div key={m.id} className="history-item animate-fade-in">
                      <div className="history-details">
                          <span className={`history-category-badge ${timingClass}`}>{m.timing}</span>
                          <span className="history-title">{m.name}{m.amount ? ` (${m.amount}g)` : ''}</span>
                          <span className="history-sub">P: {m.protein}g / F: {m.fat}g / C: {m.carb}g</span>
                      </div>
                      <div className="history-actions">
                          <span className="detail-val text-primary">{m.calories} kcal</span>
                          <button className="btn-danger btn-delete-meal" onClick={() => handleDelete(m.id as string)} title="削除">
                              <i className="fa-solid fa-trash-can"></i>
                          </button>
                      </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
