'use client';
import React, { useState, useEffect, useRef } from 'react';
import { AiExercise } from './AiMenuModal';
import { getExerciseDetails } from '@/lib/exerciseDictionary';
interface WorkoutPlayerProps {
  exercises: AiExercise[];
  onComplete: () => void;
  onCancel: (currentIndex: number) => void;
  initialIndex?: number;
}

type Phase = 'ready' | 'work' | 'rest' | 'done';

const parseDuration = (dur?: string): number | null => {
  if (!dur) return null;
  const parts = dur.split(':');
  if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }
  if (dur.startsWith('x')) {
    const reps = parseInt(dur.replace('x', ''));
    return reps * 3; // 1 rep = 3 seconds
  }
  return parseInt(dur) || null;
};



export default function WorkoutPlayer({ exercises, onComplete, onCancel, initialIndex = 0 }: WorkoutPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [phase, setPhase] = useState<Phase>('ready');
  const [timeLeft, setTimeLeft] = useState<number | null>(3);
  const [isPaused, setIsPaused] = useState(false);
  const [animFrame, setAnimFrame] = useState(0);

  useEffect(() => {
    // Animation frame toggle
    const interval = setInterval(() => {
      setAnimFrame(prev => prev === 0 ? 1 : 0);
    }, 600); // 0.6s per frame looks natural for jumping jacks
    return () => clearInterval(interval);
  }, []);

  const currentEx = exercises[currentIndex];
  const isTimeBased = currentEx && parseDuration(currentEx.duration) !== null;

  // Sound effects
  const playBeep = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = 800;
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.05);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      console.log('Audio not supported or disabled');
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (!isPaused && phase !== 'done' && timeLeft !== null && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev !== null ? prev - 1 : null);
      }, 1000);
    } else if (timeLeft === 0) {
      // Transition phase
      playBeep();
      if (phase === 'ready') {
        setPhase('work');
        setTimeLeft(parseDuration(exercises[currentIndex].duration));
      } else if (phase === 'work') {
        if (currentIndex < exercises.length - 1) {
          setPhase('rest');
          setTimeLeft(10); // 10 seconds rest
        } else {
          setPhase('done');
          setTimeLeft(null);
        }
      } else if (phase === 'rest') {
        setCurrentIndex(prev => prev + 1);
        setPhase('work');
        setTimeLeft(parseDuration(exercises[currentIndex + 1].duration));
      }
    }

    return () => clearInterval(timer);
  }, [timeLeft, isPaused, phase, currentIndex, exercises]);

  const handleNext = () => {
    playBeep();
    if (currentIndex < exercises.length - 1) {
      setPhase('rest');
      setTimeLeft(10);
    } else {
      setPhase('done');
      setTimeLeft(null);
    }
  };

  const handleSkipRest = () => {
    playBeep();
    setCurrentIndex(prev => prev + 1);
    setPhase('work');
    setTimeLeft(parseDuration(exercises[currentIndex + 1].duration));
  };

  if (phase === 'done') {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000, background: '#fff', color: '#212529', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <i className="fa-solid fa-trophy" style={{ fontSize: '5rem', color: '#ffd700', marginBottom: '20px' }}></i>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1a73e8', marginBottom: '10px' }}>お疲れ様でした！</h1>
        <p style={{ fontSize: '1.2rem', color: '#495057', marginBottom: '40px', textAlign: 'center' }}>{exercises.length}種類のエクササイズを完了しました。<br/>今日の頑張りを記録に残しましょう！</p>
        <button 
          onClick={onComplete}
          style={{ padding: '18px 40px', background: '#1a73e8', color: '#fff', borderRadius: '30px', fontSize: '1.2rem', fontWeight: 'bold', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(26, 115, 232, 0.3)' }}
        >
          完了して記録する
        </button>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Progress Bar
  const progressPercent = ((currentIndex + (phase === 'rest' ? 1 : 0)) / exercises.length) * 100;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: '68px', zIndex: 10000, background: '#fff', display: 'flex', flexDirection: 'column' }}>

      {/* Header / Progress */}
      {phase !== 'rest' && (
        <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', borderBottom: '1px solid #f1f3f5', flexShrink: 0 }}>
          <button onClick={() => onCancel(currentIndex)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: '#495057', cursor: 'pointer', padding: '4px' }}>
            <i className="fa-solid fa-xmark"></i>
          </button>
          <div style={{ flex: 1, height: '5px', background: '#e9ecef', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', background: '#1a73e8', transition: 'width 0.4s ease' }}></div>
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#868e96', whiteSpace: 'nowrap' }}>
            {currentIndex + 1} / {exercises.length}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div style={{
        flex: '1 1 auto',
        height: 0, /* flexコンテナ内で正確に高さを100%にするためのCSS定石 */
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'hidden', /* スクロールを完全に防ぐ */
        position: 'relative',
        /* ready phase: center everything vertically */
        justifyContent: phase === 'ready' ? 'center' : 'flex-start',
        gap: phase === 'ready' ? '6px' : 0,
        textAlign: phase === 'ready' ? 'center' : 'left',
        padding: phase === 'ready' ? '8px 16px 12px' : 0,
      }}>

        {/* ── READY phase: content rendered directly in outer container ── */}
        {phase === 'ready' && currentEx && (
          <>
            {(getExerciseDetails(currentEx.exercise).gifUrl || getExerciseDetails(currentEx.exercise).image) && (
              <img
                src={getExerciseDetails(currentEx.exercise).gifUrl || getExerciseDetails(currentEx.exercise).image}
                alt={currentEx.exercise}
                style={{ maxWidth: '140px', maxHeight: '20vh', objectFit: 'contain', marginBottom: '4px' }}
              />
            )}
            <h2 style={{ fontSize: '0.85rem', color: '#adb5bd', margin: 0 }}>準備してください</h2>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#212529', margin: '0 0 2px' }}>{currentEx.exercise}</h3>
            <div style={{ fontSize: '4rem', fontWeight: 'bold', color: '#1a73e8', lineHeight: 1 }}>{timeLeft}</div>
          </>
        )}

        {/* ── REST phase ── */}
        {phase === 'rest' && (
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', justifyContent: 'space-between', padding: '0' }}>
            {/* Next exercise preview — compact */}
            <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 16px 2px', background: '#fff' }}>
              <h2 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1a73e8', margin: '0 0 2px' }}>次の種目</h2>
              {(getExerciseDetails(exercises[currentIndex + 1]?.exercise || '').gifUrl || getExerciseDetails(exercises[currentIndex + 1]?.exercise || '').image) ? (
                <img
                  src={getExerciseDetails(exercises[currentIndex + 1]?.exercise || '').gifUrl || getExerciseDetails(exercises[currentIndex + 1]?.exercise || '').image}
                  alt="Next Exercise"
                  style={{ maxWidth: '110px', maxHeight: '12vh', objectFit: 'contain' }}
                />
              ) : (
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(26,115,232,0.08)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <i className="fa-solid fa-person-running" style={{ fontSize: '1.2rem', color: '#1a73e8' }}></i>
                </div>
              )}
            </div>

            {/* Blue rest panel */}
            <div style={{ flex: '1 1 auto', background: '#0d6efd', color: '#fff', padding: '10px 20px 14px', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Next exercise info */}
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.65rem', opacity: 0.85 }}>次へ {currentIndex + 2}/{exercises.length}</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>{exercises[currentIndex + 1]?.exercise}</div>
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                  {exercises[currentIndex + 1]?.reps ? `x ${exercises[currentIndex + 1].reps}` : exercises[currentIndex + 1]?.duration || ''}
                </div>
              </div>

              {/* Timer */}
              <div style={{ textAlign: 'center', margin: '2px 0' }}>
                <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>休憩</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', lineHeight: 1 }}>
                  {formatTime(timeLeft || 0)}
                </div>
                <button style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', padding: '3px 10px', borderRadius: '20px', fontSize: '0.65rem', cursor: 'pointer', marginTop: '2px' }}>
                  休憩時間を編集
                </button>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '2px' }}>
                <button
                  onClick={() => setTimeLeft((prev) => (prev !== null ? prev + 20 : null))}
                  style={{ flex: 1, padding: '9px', background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', borderRadius: '30px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  +20s
                </button>
                <button
                  onClick={handleSkipRest}
                  style={{ flex: 1, padding: '9px', background: '#fff', color: '#0d6efd', border: 'none', borderRadius: '30px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  スキップ
                </button>
            </div>
          </div>
        )}
        {/* ── WORK phase ── */}
        {phase === 'work' && currentEx && (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', gap: '8px', padding: '8px 16px 12px' }}>
            {/* Exercise image */}
            {getExerciseDetails(currentEx.exercise).gifUrl ? (
              <div style={{ width: '100%', maxWidth: '180px', height: '110px', borderRadius: '16px', overflow: 'hidden', background: '#f8f9fa', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                <img src={getExerciseDetails(currentEx.exercise).gifUrl} alt={currentEx.exercise} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            ) : getExerciseDetails(currentEx.exercise).images && getExerciseDetails(currentEx.exercise).images!.length > 0 ? (
              <div style={{ width: '100%', maxWidth: '160px', height: '100px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', background: '#f8f9fa', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                <img src={getExerciseDetails(currentEx.exercise).images![animFrame % getExerciseDetails(currentEx.exercise).images!.length]} alt={currentEx.exercise} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            ) : getExerciseDetails(currentEx.exercise).image ? (
              <div style={{ width: '100%', maxWidth: '160px', height: '90px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                <img src={getExerciseDetails(currentEx.exercise).image} alt={currentEx.exercise} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ) : (
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(26,115,232,0.08)', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                <i className="fa-solid fa-person-running" style={{ fontSize: '1.4rem', color: '#1a73e8' }}></i>
              </div>
            )}

            {/* Exercise title & details */}
            <div style={{ textAlign: 'center', margin: 0, flexShrink: 0 }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#212529', margin: '0 0 1px' }}>{currentEx.exercise}</h2>
              <p style={{ fontSize: '0.85rem', color: '#868e96', margin: 0 }}>
                {currentEx.weight ? `${currentEx.weight}kg × ` : ''}{currentEx.reps ? `${currentEx.reps}回` : ''} {currentEx.sets ? `× ${currentEx.sets}セット` : ''}
              </p>
            </div>

            {/* Guide point box */}
            <div style={{ background: '#f8f9fa', padding: '6px 10px', borderRadius: '10px', width: '100%', maxWidth: '400px', textAlign: 'left', border: '1px solid #e9ecef', flexShrink: 1, overflowY: 'auto', maxHeight: '12vh' }}>
              <h4 style={{ margin: '0 0 2px', fontSize: '0.72rem', color: '#495057' }}><i className="fa-solid fa-circle-info"></i> やり方・ポイント</h4>
              <ul style={{ margin: 0, paddingLeft: '14px', fontSize: '0.75rem', color: '#495057', lineHeight: '1.3' }}>
                {(currentEx.instructions && currentEx.instructions.length > 0 ? currentEx.instructions : getExerciseDetails(currentEx.exercise).instructions).map((inst, i) => (
                  <li key={i}>{inst}</li>
                ))}
              </ul>
            </div>

            {/* Control action or timer */}
            {isTimeBased ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexShrink: 0, marginTop: '2px' }}>
                <div style={{ position: 'relative', width: '70px', height: '70px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <svg width="70" height="70" viewBox="0 0 160 160" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
                    <circle cx="80" cy="80" r="72" fill="none" stroke="#f1f3f5" strokeWidth="12" />
                    <circle cx="80" cy="80" r="72" fill="none" stroke="#0d6efd" strokeWidth="12" strokeLinecap="round"
                      strokeDasharray="452.39"
                      strokeDashoffset={452.39 * (1 - (timeLeft || 0) / (parseDuration(currentEx.duration) || 1))}
                      style={{ transition: 'stroke-dashoffset 1s linear' }}
                    />
                  </svg>
                  <div style={{ fontSize: '1.7rem', fontWeight: '900', color: '#212529', zIndex: 1 }}>{timeLeft}</div>
                </div>
                <button
                  onClick={handleNext}
                  style={{ width: '36px', height: '36px', background: '#f1f3f5', border: 'none', borderRadius: '50%', color: '#212529', fontSize: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                >
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
                <div style={{ fontSize: '0.78rem', color: '#868e96', textAlign: 'center' }}>
                  自分のペースで完了させてください
                </div>
                <div style={{ width: '100%', padding: '2px 0' }}>
                  <button
                    onClick={handleNext}
                    style={{ width: '100%', padding: '10px', background: '#1a73e8', color: '#fff', borderRadius: '40px', fontSize: '0.9rem', fontWeight: 'bold', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(26,115,232,0.3)' }}
                  >
                    <i className="fa-solid fa-check"></i> 完了して次へ
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
