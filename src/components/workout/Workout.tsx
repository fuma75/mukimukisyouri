'use client';
import React, { useState, useEffect, useRef } from 'react';
import { getWorkouts, saveWorkout, deleteWorkout, getProfile, WorkoutItem, calculateCurrentStreak } from '@/lib/storage';
import AiMenuModal, { AiMenuData, AiExercise } from './AiMenuModal';
import { WORKOUT_PROGRAMS, WorkoutProgram } from './programs';
import WorkoutHistory from './WorkoutHistory';

export default function Workout() {
  const [showManualForm, setShowManualForm] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [activeTargetArea, setActiveTargetArea] = useState('腹筋');
  const [streak, setStreak] = useState(0);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const [date, setDate] = useState(() => new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-'));
  const [workouts, setWorkouts] = useState<WorkoutItem[]>([]);
  
  const [category, setCategory] = useState('');
  const [exercise, setExercise] = useState('');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [sets, setSets] = useState('');
  const [time, setTime] = useState('');
  const [calories, setCalories] = useState('');

  const [loadingEstimate, setLoadingEstimate] = useState(false);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [suggestion, setSuggestion] = useState<any>(null);
  const [aiMenuData, setAiMenuData] = useState<AiMenuData | null>(null);
  
  const [showAiMenuPanel, setShowAiMenuPanel] = useState(false);
  const [aiGoal, setAiGoal] = useState('ダイエット・減量');
  const [aiEnvironment, setAiEnvironment] = useState('家トレ');
  const [aiCategory, setAiCategory] = useState('全身');

  useEffect(() => {
    setWorkouts(getWorkouts(date));
    setStreak(calculateCurrentStreak());
    const profile = getProfile();
    if (profile?.goal) {
      setAiGoal(profile.goal);
    }
  }, [date]);

  const shiftDate = (days: number) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return;
    d.setDate(d.getDate() + days);
    setDate(d.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-'));
  };

  const handleAddWorkout = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!category || !exercise) {
        alert("部位と種目を選択してください");
        return;
    }
    const item: WorkoutItem = {
      date,
      category,
      exercise,
      weight: Number(weight) || 0,
      reps: Number(reps) || 0,
      sets: Number(sets) || 0,
      duration: time ? Number(time) : undefined,
      calories: calories ? Number(calories) : undefined
    };
    saveWorkout(item);
    setWorkouts(getWorkouts(date));
    setExercise(''); setWeight(''); setReps(''); setSets(''); setTime(''); setCalories('');
  };

  const handleDelete = (id: string) => {
    deleteWorkout(id);
    setWorkouts(getWorkouts(date));
  };

  const handleEstimateCalories = async () => {
    if (!exercise) return alert('種目名を入力してください。');
    setLoadingEstimate(true);
    try {
      const profile = getProfile();
      const res = await fetch('/api/estimate-workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exercise, weight: Number(weight)||undefined, reps: Number(reps)||undefined, sets: Number(sets)||undefined, durationMinutes: Number(time)||undefined, userWeight: profile?.weight })
      });
      const data = await res.json();
      if (data.calories) {
        setCalories(Math.round(data.calories).toString());
        alert(`推定消費カロリー: ${Math.round(data.calories)} kcal`);
      }
    } catch (e) {
      console.error(e);
      alert('エラーが発生しました');
    } finally {
      setLoadingEstimate(false);
    }
  };

  const handleSuggestWeight = async () => {
    if (!exercise) return alert('種目名を入力してください。');
    setLoadingSuggest(true);
    try {
      const profile = getProfile();
      const history = getWorkouts().filter(w => w.exercise === exercise);
      const res = await fetch('/api/analyze-progression', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exercise, goal: profile?.goal || 'maintain', history })
      });
      const data = await res.json();
      if (data.recommendedWeight !== undefined) {
        setSuggestion(data);
      }
    } catch (e) {
      console.error(e);
      alert('エラーが発生しました');
    } finally {
      setLoadingSuggest(false);
    }
  };

  const applySuggestion = () => {
    if (!suggestion) return;
    if (suggestion.recommendedWeight !== undefined) setWeight(suggestion.recommendedWeight.toString());
    if (suggestion.recommendedReps !== undefined) setReps(suggestion.recommendedReps.toString());
    if (suggestion.recommendedSets !== undefined) setSets(suggestion.recommendedSets.toString());
    setSuggestion(null);
  };

  const handleGenerateMenu = async () => {
    setLoadingMenu(true);
    try {
      const profile = getProfile();
      const res = await fetch('/api/recommend-today-workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: aiCategory, goal: aiGoal, environment: aiEnvironment, profile })
      });
      const data = await res.json();
      if (data.result) {
        setAiMenuData(data.result);
      } else {
        alert('メニューの生成に失敗しました\\n' + (data.error || '不明なエラー') + '\\n' + (data.detail || data.raw || ''));
      }
    } catch (e) {
      console.error(e);
      alert('エラーが発生しました');
    } finally {
      setLoadingMenu(false);
    }
  };

  const handleApplyAiMenu = (exercises: AiExercise[]) => {
    exercises.forEach(item => {
      saveWorkout({
        date,
        category: aiCategory === '全身' ? 'その他' : aiCategory,
        exercise: item.exercise,
        weight: Number(item.weight) || 0,
        reps: Number(item.reps) || 0,
        sets: Number(item.sets) || 0,
        calories: Number(item.calories) || undefined
      });
    });
    setWorkouts(getWorkouts(date));
    setAiMenuData(null);
    setShowAiMenuPanel(false);
    alert('今日の記録に追加しました！💪');
  };

  const totalVolume = workouts.reduce((sum, w) => sum + (w.volume || 0), 0);

  if (!showManualForm) {
    const selectedDate = new Date(date);
    const calendarDays = [];
    for (let i = -3; i <= 3; i++) {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + i);
        calendarDays.push({
            date: d,
            isToday: i === 0,
            dayStr: d.getDate(),
            dayName: ['日', '月', '火', '水', '木', '金', '土'][d.getDay()]
        });
    }

    const TARGET_AREAS = ['腹筋', '腕', '胸部', '脚', '肩と背中'];
    const activePrograms = WORKOUT_PROGRAMS[activeTargetArea] || [];

    const startProgram = (prog: WorkoutProgram) => {
        setAiGoal('ダイエット・減量');
        setAiEnvironment('家トレ');
        setAiCategory(prog.targetArea);
        
        let exercisesToUse: any[] = [];
        if (prog.exercises && prog.exercises.length > 0) {
            exercisesToUse = prog.exercises.map(ex => ({
                exercise: ex.exercise,
                duration: ex.duration || ex.reps, // AiMenuModal supports duration as string (like "x16" or "00:20")
            }));
        } else {
            const exCount = prog.exerciseCount;
            for (let i=0; i<exCount; i++) {
                exercisesToUse.push({
                    exercise: `${prog.targetArea}トレーニング ${i+1}`,
                    duration: '01:00',
                    tips: '無理のない範囲で行いましょう'
                });
            }
        }
        
        setAiMenuData({
            title: prog.title,
            goal: 'ダイエット・減量',
            environment: '家トレ',
            category: prog.targetArea,
            estimatedCalories: prog.durationMin * 8,
            estimatedMinutes: prog.durationMin,
            exerciseCount: prog.exerciseCount,
            training: exercisesToUse, // Put it in 'training' so AiMenuModal renders it properly
            message: `${prog.title}のプログラムです。無理せず頑張りましょう！`
        });
    };

    const prof = getProfile() || {} as any;
    let challengeLevel = 2; 
    let challengeTitle = '全身脂肪燃焼';
    let challengeLevelText = '中級';
    let challengeTime = '12〜25分';

    if (prof.workoutLevel === '初級' || prof.frequency?.includes('1') || prof.frequency?.includes('たまに')) {
        challengeLevel = 1;
        challengeTitle = '全身脂肪燃焼 (初級向け)';
        challengeLevelText = '初級';
        challengeTime = '8〜15分';
    } else if (prof.workoutLevel === '上級' || prof.frequency?.includes('毎日') || prof.frequency?.includes('5')) {
        challengeLevel = 3;
        challengeTitle = '全身脂肪燃焼 (上級向け)';
        challengeLevelText = '上級';
        challengeTime = '25〜40分';
    }

    const handleChallengeClick = () => {
        let warmup = [
            { exercise: 'ジャンピングジャック', duration: '00:30' },
            { exercise: 'ハイニーズ', duration: '00:30' },
        ];
        let training = [
            { exercise: 'スクワット', duration: '00:30' },
            { exercise: 'プッシュアップ', duration: '00:30' },
            { exercise: 'シザーズ', duration: '00:35' },
            { exercise: 'ヒップブリッジ', duration: '00:30' },
            { exercise: 'ランジ', duration: '00:30' },
            { exercise: 'マウンテンクライマー', duration: '00:30' },
            { exercise: 'プランク', duration: '00:30' },
        ];
        let cooldown = [
            { exercise: 'ストレッチ', duration: '00:30' },
            { exercise: 'ストレッチ', duration: '00:30' },
            { exercise: 'ストレッチ', duration: '00:30' },
        ];

        // Jump and injury adjustments
        const noJumps = prof.exerciseTypes?.includes('ジャンプ禁止') || prof.exerciseTypes?.includes('ジャンプなし') || prof.physicalIssues?.some((i: string) => i.includes('膝') || i.includes('足首'));
        const upperInjury = prof.physicalIssues?.some((i: string) => i.includes('肩') || i.includes('手首') || i.includes('腕'));
        
        if (noJumps) {
            warmup[0] = { exercise: 'スクワット', duration: '00:30' }; 
            training = training.map(t => {
                if (t.exercise === 'ジャンピングジャック') return { exercise: 'スクワット', duration: '00:30' };
                return t;
            });
        }
        
        if (upperInjury) {
            training = training.map(t => {
                if (t.exercise === 'プッシュアップ') return { exercise: 'プランク', duration: '00:30' };
                if (t.exercise === 'マウンテンクライマー') return { exercise: 'クランチ', duration: '00:30' };
                return t;
            });
        }

        // Frequency & Level adjustments
        if (challengeLevel === 1) {
            training = training.map(t => ({...t, duration: t.duration.replace('00:35', '00:20').replace('00:30', '00:20')}));
            warmup = warmup.map(t => ({...t, duration: t.duration.replace('00:30', '00:20')}));
            training = training.filter(t => t.exercise !== 'スパイダーマンプランク'); 
        } else if (challengeLevel === 3) {
            training = training.map(t => ({...t, duration: t.duration.replace('00:30', '00:45').replace('00:35', '00:45')}));
            training.push({ exercise: 'バーピージャンプ', duration: '00:45' });
        }
        
        if (noJumps) {
            training = training.map(t => t.exercise === 'バーピージャンプ' ? { exercise: 'スクワットホールド', duration: '00:45' } : t);
        }

        const totalEx = warmup.length + training.length + cooldown.length;
        const totalMinutes = Math.ceil((totalEx * (challengeLevel === 3 ? 45 : challengeLevel === 1 ? 20 : 30)) / 60) + 2; 

        setAiMenuData({
            title: challengeTitle,
            goal: '全身の脂肪燃焼',
            environment: prof.environment || '家トレ',
            category: '全身',
            estimatedCalories: totalMinutes * 8,
            estimatedMinutes: totalMinutes,
            exerciseCount: totalEx,
            warmup,
            training,
            cooldown,
            message: `あなたに合わせた${challengeTitle}プログラムです！無理せず頑張りましょう。`
        });
    };

    const handleCalendarClick = () => {
        setShowHistoryModal(true);
    };

    return (
        <section id="workout" className="content-section active" style={{ paddingBottom: '100px' }}>
            <div className="workout-dashboard-header">
                <h1 className="workout-dashboard-title">自宅トレーニング</h1>
                <div className="workout-header-badges">
                </div>
            </div>

            <div className="workout-goal-calendar">
                <div className="workout-goal-header">
                    <h3 className="workout-goal-title">一週間の目標</h3>
                    <div className="workout-goal-progress">{streak > 0 ? `${Math.min(streak, 7)}/7` : '0/7'} <i className="fa-solid fa-pen" style={{marginLeft: '4px', opacity: 0.5}}></i></div>
                </div>
                <div style={{ position: 'relative' }} onClick={handleCalendarClick}>
                    <div className="calendar-days-row" style={{ cursor: 'pointer' }}>
                        {calendarDays.map((d, idx) => (
                            <div key={idx} className="calendar-day-col">
                                <span className="calendar-day-name">{d.dayName}</span>
                                <span className={`calendar-day-num ${d.isToday ? 'active' : ''}`}>{d.dayStr}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="workout-motivational-msg">
                    <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="Trainer" />
                    <p>今日は本当に頑張りましたね！大きな進歩が見られますよ。</p>
                </div>
            </div>

            <h3 className="challenge-section-title">チャレンジ</h3>
            <div className="challenge-card-banner">
                <div className="challenge-badge">あなたに合わせて</div>
                <h2 className="challenge-title">{challengeTitle}</h2>
                <div className="challenge-grid">
                    <div className="challenge-stat">
                        <div className="challenge-stat-icon"><i className="fa-regular fa-calendar-days"></i></div>
                        <div className="challenge-stat-text">
                            <span className="challenge-stat-val">{challengeTime}</span>
                            <span className="challenge-stat-label">毎日の時間</span>
                        </div>
                    </div>
                    <div className="challenge-stat">
                        <div className="challenge-stat-icon"><i className="fa-solid fa-chart-simple"></i></div>
                        <div className="challenge-stat-text">
                            <span className="challenge-stat-val">{challengeLevelText}</span>
                            <span className="challenge-stat-label">難易度</span>
                        </div>
                    </div>
                    <div className="challenge-stat">
                        <div className="challenge-stat-icon"><i className="fa-solid fa-bullseye"></i></div>
                        <div className="challenge-stat-text">
                            <span className="challenge-stat-val">全身</span>
                            <span className="challenge-stat-label">ターゲット部位</span>
                        </div>
                    </div>
                    <div className="challenge-stat">
                        <div className="challenge-stat-icon"><i className="fa-solid fa-check"></i></div>
                        <div className="challenge-stat-text">
                            <span className="challenge-stat-val">器具なし</span>
                            <span className="challenge-stat-label">器具</span>
                        </div>
                    </div>
                </div>
                <button className="challenge-btn" onClick={handleChallengeClick}>
                    トレーニングを開始する <i className="fa-solid fa-arrow-right"></i>
                </button>
            </div>

            <h3 className="challenge-section-title">ターゲット部位</h3>
            <div className="target-area-section">
                <div className="target-area-tabs-container">
                    {TARGET_AREAS.map(area => (
                        <div 
                            key={area} 
                            className={`pill-tab ${activeTargetArea === area ? 'active' : ''}`}
                            onClick={() => setActiveTargetArea(area)}
                        >
                            {area}
                        </div>
                    ))}
                </div>
                
                <div className="program-list">
                    {activePrograms.map(prog => {
                        // Custom image based on area
                        let imgUrl = 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80';
                        if (prog.targetArea === '胸') imgUrl = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80';
                        if (prog.targetArea === '腹筋') imgUrl = 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80';
                        if (prog.targetArea === '腕') imgUrl = 'https://images.unsplash.com/photo-1581009137042-c552e485697a?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80';
                        if (prog.targetArea === '脚') imgUrl = 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80';

                        const getSmileyIcon = (diff: number) => {
                            if (diff === 1) return 'fa-face-smile';
                            if (diff === 2) return 'fa-face-meh';
                            return 'fa-face-dizzy';
                        };
                        const smileyClass = getSmileyIcon(prog.difficulty);

                        return (
                            <div key={prog.id} className="program-card" onClick={() => startProgram(prog)}>
                                <div className="program-thumb" style={{ background: `url('${imgUrl}') center/cover` }}></div>
                                <div className="program-info">
                                    <h4 className="program-title">{prog.title}</h4>
                                    <span className="program-meta">{prog.durationMin} 分・{prog.exerciseCount} エクササイズ</span>
                                    <div className="program-difficulty">
                                        {[1,2,3].map(lvl => (
                                            <i key={lvl} className={`fa-solid ${smileyClass} ${lvl <= prog.difficulty ? 'active-bolt' : ''}`} style={{ marginRight: '4px' }}></i>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <button className="fab-manual-record" onClick={() => setShowManualForm(true)} title="手動で記録する">
                <i className="fa-solid fa-plus"></i>
            </button>

            {aiMenuData && (
                <AiMenuModal 
                    data={aiMenuData} 
                    onClose={() => setAiMenuData(null)} 
                    onApply={handleApplyAiMenu} 
                />
            )}

            {showHistoryModal && (
                <WorkoutHistory 
                    initialDate={date} 
                    onClose={() => setShowHistoryModal(false)}
                    onSelectDate={(newDate) => {
                        setDate(newDate);
                        setShowHistoryModal(false);
                    }}
                />
            )}
        </section>
    );
  }

  return (
    <section id="workout" className="content-section active">
      <div style={{ marginBottom: '20px' }}>
          <button className="btn btn-outline" onClick={() => setShowManualForm(false)}>
              <i className="fa-solid fa-arrow-left"></i> ダッシュボードに戻る
          </button>
      </div>
      <div className="section-layout" style={{ alignItems: 'stretch' }}>
        <div className="left-column" style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', height: '100%' }}>
          <div className="form-container glass-panel" style={{ flex: 1 }}>
            <div className="panel-header">
              <h2><i className="fa-solid fa-plus-circle icon-blue"></i> 筋トレを記録する</h2>
              <div className="date-picker-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button type="button" className="btn btn-icon btn-sm" onClick={() => shiftDate(-1)}><i className="fa-solid fa-chevron-left"></i></button>
                <label><i className="fa-regular fa-calendar"></i></label>
                <input type="date" className="date-input" value={date} onChange={e => setDate(e.target.value)} />
                <button type="button" className="btn btn-icon btn-sm" onClick={() => shiftDate(1)}><i className="fa-solid fa-chevron-right"></i></button>
              </div>
            </div>
            
            <div style={{ marginBottom: '20px', padding: '15px', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setShowAiMenuPanel(!showAiMenuPanel)}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-robot"></i> ✨ AIにおまかせメニュー作成
                </h3>
                <i className={`fa-solid fa-chevron-${showAiMenuPanel ? 'up' : 'down'}`} style={{ color: 'var(--text-muted)' }}></i>
              </div>
              
              {showAiMenuPanel && (
                <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '12px', animation: 'fadeIn 0.3s' }}>
                  <div className="form-row">
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>目標</label>
                      <select value={aiGoal} onChange={e => setAiGoal(e.target.value)}>
                        <option value="ダイエット・減量">痩せたい (ダイエット)</option>
                        <option value="筋肥大・バルクアップ">筋肥大したい (バルクアップ)</option>
                        <option value="健康維持">維持・健康</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>環境</label>
                      <select value={aiEnvironment} onChange={e => setAiEnvironment(e.target.value)}>
                        <option value="家トレ">家トレ (自重・自宅用器具)</option>
                        <option value="ジムトレ">ジムトレ (マシン・フリーウェイト)</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>ターゲット部位</label>
                    <select value={aiCategory} onChange={e => setAiCategory(e.target.value)}>
                      <option value="全身">全身</option>
                      <option value="胸">胸</option>
                      <option value="背中">背中</option>
                      <option value="脚">脚</option>
                      <option value="肩">肩</option>
                      <option value="腕">腕</option>
                      <option value="腹筋">腹筋</option>
                    </select>
                  </div>
                  <button type="button" className="btn btn-primary" onClick={handleGenerateMenu} disabled={loadingMenu} style={{ width: '100%', fontWeight: 'bold' }}>
                    {loadingMenu ? <><i className="fa-solid fa-spinner fa-spin"></i> メニュー作成中...</> : <><i className="fa-solid fa-wand-magic-sparkles"></i> AI最適メニューを生成</>}
                  </button>
                  
                  {aiMenuData && (
                    <AiMenuModal 
                      data={aiMenuData} 
                      onClose={() => setAiMenuData(null)} 
                      onApply={handleApplyAiMenu} 
                    />
                  )}
                </div>
              )}
            </div>

            <form className="app-form" onSubmit={handleAddWorkout}>
              <div className="form-group">
                <label>部位</label>
                <select value={category} onChange={e => {setCategory(e.target.value); setExercise('');}}>
                  <option value="" disabled>選択してください</option>
                  <option value="胸">胸 (Chest)</option>
                  <option value="背中">背中 (Back)</option>
                  <option value="脚">脚 (Legs)</option>
                  <option value="肩">肩 (Shoulders)</option>
                  <option value="腕">腕 (Arms)</option>
                  <option value="腹筋">腹筋 (Abs)</option>
                  <option value="その他">その他 (Other)</option>
                </select>
              </div>
              <div className="form-group">
                <label>種目名</label>
                <div className="exercise-input-wrapper" style={{ display: 'flex', flexDirection: 'column' }}>
                  <input type="text" placeholder="種目名を入力 (例: ベンチプレス)" value={exercise} onChange={e => setExercise(e.target.value)} />
                </div>
              </div>

              {suggestion && (
                <div style={{ background: 'rgba(76,175,80,0.05)', border: '1px solid rgba(76,175,80,0.2)', padding: '15px', borderRadius: '12px', marginBottom: '15px' }}>
                  <h4 style={{ color: 'var(--success)', margin: '0 0 10px 0', fontSize: '0.9rem' }}>AI推奨重量</h4>
                  <p style={{ fontSize: '0.85rem', marginBottom: '10px' }}>{suggestion.recommendedWeight}kg × {suggestion.recommendedReps}回 × {suggestion.recommendedSets}セット</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>{suggestion.message}</p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="button" className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => setSuggestion(null)}>閉じる</button>
                    <button type="button" className="btn btn-success btn-sm" style={{ flex: 1 }} onClick={applySuggestion}>反映する</button>
                  </div>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>重量 (kg)</label>
                  <input type="number" min="0" step="0.5" placeholder="0 (自重)" value={weight} onChange={e => setWeight(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>回数 (Reps)</label>
                  <input type="number" min="1" step="1" placeholder="0" value={reps} onChange={e => setReps(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>セット数</label>
                  <input type="number" min="1" step="1" placeholder="0" value={sets} onChange={e => setSets(e.target.value)} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>運動時間 (分)</label>
                  <input type="number" min="1" placeholder="例: 30" value={time} onChange={e => setTime(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>消費カロリー (kcal)</label>
                  <input type="number" min="0" placeholder="空欄で自動計算" value={calories} onChange={e => setCalories(e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px', flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1, minWidth: '100px' }} onClick={handleEstimateCalories} disabled={loadingEstimate}>{loadingEstimate ? '計算中...' : 'AI消費推定'}</button>
                <button type="button" className="btn btn-outline" style={{ flex: 1, minWidth: '100px' }} onClick={handleSuggestWeight} disabled={loadingSuggest}><i className="fa-solid fa-wand-magic-sparkles"></i> {loadingSuggest ? '分析中...' : 'AI重量提案'}</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2, minWidth: '140px' }}>
                  <i className="fa-solid fa-dumbbell"></i> 記録を追加
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="right-column" style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', height: '100%' }}>
          <div className="list-container glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="panel-header">
              <h2><i className="fa-solid fa-history icon-orange"></i> 筋トレ履歴 (<span id="selected-workout-date-str">{date === new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-') ? '今日' : date}</span>)</h2>
              <span className="total-volume-badge">総ボリューム: <span>{totalVolume.toLocaleString()}</span> kg</span>
            </div>
            <div className="scroll-list" style={{ flex: 1 }}>
              {workouts.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>この日の筋トレ記録はありません。</div>
              ) : (
                workouts.map((w) => {
                  let categoryClass = 'other';
                  switch (w.category) {
                      case '胸': categoryClass = 'chest'; break;
                      case '背中': categoryClass = 'back'; break;
                      case '脚': categoryClass = 'legs'; break;
                      case '肩': categoryClass = 'shoulders'; break;
                      case '腕': categoryClass = 'arms'; break;
                      case '腹筋': categoryClass = 'abs'; break;
                  }
                  return (
                    <div key={w.id} className="history-item animate-fade-in">
                      <div className="history-details">
                          <span className={`history-category-badge ${categoryClass}`}>{w.category}</span>
                          <span className="history-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {w.exercise}
                              {/* TODO: Implement Guide modal */}
                          </span>
                          <span className="history-sub">{w.weight} kg × {w.reps} reps × {w.sets} sets {w.duration ? `(${w.duration}分)` : ''}</span>
                      </div>
                      <div className="history-actions">
                          {w.calories && <span className="detail-val text-accent" style={{ marginRight: '8px' }}>{w.calories} kcal</span>}
                          <span className="detail-val text-primary" style={{ marginRight: '8px' }}>{(w.volume||0).toLocaleString()} kg</span>
                          <button className="btn-danger btn-delete-workout" onClick={() => handleDelete(w.id as string)} title="削除">
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
      </div>
    </section>
  );
}
