'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AiExercise } from './AiMenuModal';
import { getExerciseDetails } from '@/lib/exerciseDictionary';
import ExerciseDetailModal from './ExerciseDetailModal';

interface WorkoutPlayerProps {
  exercises: AiExercise[];
  onComplete: () => void;
  onCancel: (currentIndex: number) => void;
  initialIndex?: number;
}

type Phase = 'ready' | 'countdown' | 'work' | 'rest' | 'done';

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
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [phase, setPhase] = useState<Phase>('ready');
  const [timeLeft, setTimeLeft] = useState<number | null>(15); // 準備時間は15秒
  const [isPaused, setIsPaused] = useState(false);
  const [animFrame, setAnimFrame] = useState(0);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    // Animation frame toggle
    const interval = setInterval(() => {
      setAnimFrame(prev => prev === 0 ? 1 : 0);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  const currentEx = exercises[currentIndex];
  const isTimeBased = currentEx && parseDuration(currentEx.duration) !== null;

  // Sound effects
  const playBeep = (freq = 800, dur = 0.3) => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.05);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + dur);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + dur);
      }
    } catch (e) {
      console.log('Audio not supported or disabled');
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (!isPaused && phase !== 'done' && timeLeft !== null && timeLeft > 0) {
      timer = setTimeout(() => {
        const nextTime = timeLeft - 1;
        setTimeLeft(nextTime);
        if (phase === 'countdown' && nextTime > 0) {
          playBeep(800, 0.15); // short beep for 3, 2, 1
        }
      }, 1000);
    } else if (timeLeft === 0) {
      if (phase === 'ready') {
        setPhase('countdown');
        setTimeLeft(3);
        playBeep(800, 0.15);
      } else if (phase === 'countdown') {
        playBeep(1200, 0.5); // long beep for go
        setPhase('work');
        setTimeLeft(parseDuration(exercises[currentIndex].duration) || 30);
      } else if (phase === 'work') {
        playBeep();
        if (currentIndex < exercises.length - 1) {
          setPhase('rest');
          setTimeLeft(10); // 休憩時間10秒
        } else {
          setPhase('done');
          setTimeLeft(null);
        }
      } else if (phase === 'rest') {
        setCurrentIndex(prev => prev + 1);
        setPhase('countdown');
        setTimeLeft(3);
        playBeep(800, 0.15);
      }
    }

    return () => clearTimeout(timer);
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

  const handlePrev = () => {
    playBeep();
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setPhase('ready');
      setTimeLeft(15);
    }
  };

  const handleSkipRest = () => {
    playBeep(800, 0.15);
    setCurrentIndex(prev => prev + 1);
    setPhase('countdown');
    setTimeLeft(3);
  };

  useEffect(() => {
    document.body.classList.add('workout-player-active');
    return () => {
      document.body.classList.remove('workout-player-active');
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (phase === 'done') {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '100dvh', zIndex: 10000, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '560px', height: '100%', background: '#fff', color: '#212529', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', position: 'relative' }}>
          <i className="fa-solid fa-trophy" style={{ fontSize: '4rem', color: '#ffd700', marginBottom: '15px' }}></i>
          <h1 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--primary)', marginBottom: '10px' }}>お疲れ様でした！</h1>
          <p style={{ fontSize: '1rem', color: '#495057', marginBottom: '30px', textAlign: 'center' }}>{exercises.length}種類のエクササイズを完了しました。<br/>今日の頑張りを記録に残しましょう！</p>
          <button 
            onClick={onComplete}
            style={{ padding: '14px 35px', background: 'var(--primary)', color: '#fff', borderRadius: '30px', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)' }}
          >
            完了して記録する
          </button>
        </div>
      </div>
    );
  }

  const progressPercent = ((currentIndex + (phase === 'rest' ? 1 : 0)) / exercises.length) * 100;

  if (!mounted) return null;

  return createPortal(
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '100dvh', zIndex: 10000, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '560px', height: '100%', background: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      
      {/* Detail Modal Popup */}
      {showDetailModal && currentEx && (
        <ExerciseDetailModal
          exercise={currentEx}
          index={currentIndex}
          total={exercises.length}
          onClose={() => setShowDetailModal(false)}
          onNext={() => {}}
          onPrev={() => {}}
          onUpdateDuration={() => {}}
        />
      )}

      {/* Header / Progress (Hidden in REST phase top, because rest phase has its own header card) */}
      {phase !== 'rest' && (
        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', borderBottom: '1px solid #f1f3f5', flexShrink: 0 }}>
          <button onClick={() => onCancel(currentIndex)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: '#495057', cursor: 'pointer', padding: '4px' }}>
            <i className="fa-solid fa-xmark"></i>
          </button>
          <div style={{ flex: 1, height: '6px', background: '#e9ecef', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.4s ease' }}></div>
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#868e96', whiteSpace: 'nowrap' }}>
            {currentIndex + 1} / {exercises.length}
          </div>
        </div>
      )}

      {/* Main content viewport */}
      <div style={{ flex: '1 1 auto', height: 0, width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        
        {/* ── READY phase ── */}
        {phase === 'ready' && currentEx && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', width: '100%', justifyContent: 'flex-start', gap: '15px', paddingBottom: '10px' }}>
            {/* Top Illustration container */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', flex: '1 1 auto', minHeight: '100px', maxHeight: '280px', background: '#f8f9fa' }}>
              {(getExerciseDetails(currentEx.exercise).gifUrl || getExerciseDetails(currentEx.exercise).image) && (
                <img
                  src={getExerciseDetails(currentEx.exercise).gifUrl || getExerciseDetails(currentEx.exercise).image}
                  alt={currentEx.exercise}
                  style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }}
                />
              )}
            </div>

            {/* Info text */}
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '6px' }}>用意スタート</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#212529' }}>{currentEx.exercise}</span>
                <i 
                  className="fa-regular fa-circle-question" 
                  onClick={() => setShowDetailModal(true)}
                  style={{ fontSize: '1.2rem', color: '#adb5bd', cursor: 'pointer' }}
                ></i>
              </div>
            </div>

            {/* Bottom Circle Progress Timer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
              <div style={{ position: 'relative', width: '110px', height: '110px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <svg width="110" height="110" viewBox="0 0 160 160" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
                  <circle cx="80" cy="80" r="70" fill="none" stroke="#f1f3f5" strokeWidth="10" />
                  <circle cx="80" cy="80" r="70" fill="none" stroke="#ff9f0a" strokeWidth="10" strokeLinecap="round"
                    strokeDasharray="439.82"
                    strokeDashoffset={439.82 * (1 - (timeLeft || 0) / 15)}
                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                  />
                </svg>
                <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#212529', zIndex: 1 }}>{timeLeft}</div>
              </div>
              <button
                onClick={() => setTimeLeft(0)}
                style={{ width: '46px', height: '46px', background: '#f1f3f5', border: 'none', borderRadius: '50%', color: '#212529', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>
        )}

        {/* ── COUNTDOWN phase ── */}
        {phase === 'countdown' && currentEx && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', background: 'var(--primary)', color: '#fff', position: 'absolute', top: 0, left: 0, zIndex: 10 }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '15px', opacity: 0.9 }}>
              次の種目: {currentEx.exercise}
            </div>
            <div style={{ fontSize: '8rem', fontWeight: '900', fontFamily: 'Outfit, monospace', lineHeight: 1, textShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
              {timeLeft}
            </div>
          </div>
        )}

        {/* ── WORK phase ── */}
        {phase === 'work' && currentEx && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', width: '100%', justifyContent: 'flex-start', gap: '15px', paddingBottom: '10px' }}>
            {/* Top Illustration container */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', flex: '1 1 auto', minHeight: '100px', maxHeight: '280px', background: '#f8f9fa' }}>
              {getExerciseDetails(currentEx.exercise).gifUrl ? (
                <img src={getExerciseDetails(currentEx.exercise).gifUrl} alt={currentEx.exercise} style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} />
              ) : getExerciseDetails(currentEx.exercise).images && getExerciseDetails(currentEx.exercise).images!.length > 0 ? (
                <img src={getExerciseDetails(currentEx.exercise).images![animFrame % getExerciseDetails(currentEx.exercise).images!.length]} alt={currentEx.exercise} style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} />
              ) : (
                <img src={getExerciseDetails(currentEx.exercise).image || getExerciseDetails(currentEx.exercise).icon} alt={currentEx.exercise} style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} />
              )}
            </div>

            {/* Info text */}
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#212529' }}>{currentEx.exercise}</span>
                <i 
                  className="fa-regular fa-circle-question" 
                  onClick={() => setShowDetailModal(true)}
                  style={{ fontSize: '1.2rem', color: '#adb5bd', cursor: 'pointer' }}
                ></i>
              </div>
            </div>

            {/* Big Timer / Counter */}
            <div style={{ fontSize: '4.2rem', fontWeight: 'bold', color: '#000', fontFamily: 'Outfit, monospace', letterSpacing: '-0.02em', margin: '10px 0' }}>
              {isTimeBased ? formatTime(timeLeft || 0) : `x ${currentEx.reps || 0}`}
            </div>

            {/* Bottom Controls Bar */}
            <div style={{ display: 'flex', background: '#f1f3f5', padding: '10px 24px', borderRadius: '40px', gap: '20px', alignItems: 'center', width: '90%', maxWidth: '340px', justifyContent: 'space-between', marginBottom: '10px' }}>
              <button 
                onClick={handlePrev} 
                disabled={currentIndex === 0}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: currentIndex === 0 ? '#adb5bd' : '#495057', cursor: 'pointer', padding: '8px' }}
              >
                <i className="fa-solid fa-backward-step"></i>
              </button>
              <button 
                onClick={() => setIsPaused(!isPaused)} 
                style={{ background: '#fff', border: 'none', width: '56px', height: '56px', borderRadius: '50%', fontSize: '1.4rem', color: '#212529', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              >
                <i className={isPaused ? "fa-solid fa-play" : "fa-solid fa-pause"}></i>
              </button>
              <button 
                onClick={handleNext} 
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: '#495057', cursor: 'pointer', padding: '8px' }}
              >
                <i className="fa-solid fa-forward-step"></i>
              </button>
            </div>
          </div>
        )}

        {/* ── REST phase ── */}
        {phase === 'rest' && (
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
            
            {/* Top: Next exercise preview card */}
            <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 16px', background: '#fff' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '8px' }}>次の種目</div>
              <div style={{ width: '100%', height: '180px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f8f9fa', borderRadius: '12px', overflow: 'hidden' }}>
                {(getExerciseDetails(exercises[currentIndex + 1]?.exercise || '').gifUrl || getExerciseDetails(exercises[currentIndex + 1]?.exercise || '').image) ? (
                  <img
                    src={getExerciseDetails(exercises[currentIndex + 1]?.exercise || '').gifUrl || getExerciseDetails(exercises[currentIndex + 1]?.exercise || '').image}
                    alt="Next Exercise"
                    style={{ maxHeight: '95%', maxWidth: '95%', objectFit: 'contain' }}
                  />
                ) : (
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(26,115,232,0.08)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <i className="fa-solid fa-person-running" style={{ fontSize: '1.4rem', color: 'var(--primary)' }}></i>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom: Blue rest panel */}
            <div style={{ flex: '1 1 auto', background: '#ff9f0a', color: '#fff', padding: '24px 24px 30px', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', gap: '15px' }}>
              {/* Header inside blue area */}
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '2px' }}>次へ {currentIndex + 2}/{exercises.length}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{exercises[currentIndex + 1]?.exercise}</span>
                    <i 
                      className="fa-regular fa-circle-question" 
                      onClick={() => setShowDetailModal(true)}
                      style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}
                    ></i>
                  </div>
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>
                  {exercises[currentIndex + 1]?.reps ? `x ${exercises[currentIndex + 1].reps}` : exercises[currentIndex + 1]?.duration || ''}
                </div>
              </div>

              {/* Timer */}
              <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: '1rem', opacity: 0.9 }}>休憩</div>
                <div style={{ fontSize: '5rem', fontWeight: 'bold', fontFamily: 'Outfit, monospace', lineHeight: 1, margin: '15px 0' }}>
                  {formatTime(timeLeft || 0)}
                </div>
                <div>
                  <button style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '20px', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 'bold' }}>
                    休憩時間を編集
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '15px', width: '100%', marginTop: 'auto' }}>
                <button
                  onClick={() => setTimeLeft((prev) => (prev !== null ? prev + 20 : null))}
                  style={{ flex: 1, padding: '16px', background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: '30px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', backdropFilter: 'blur(4px)' }}
                >
                  +20s
                </button>
                <button
                  onClick={handleSkipRest}
                  style={{ flex: 1, padding: '16px', background: '#fff', color: '#ff9f0a', border: 'none', borderRadius: '30px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                >
                  スキップ
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
      </div>
    </div>,
    document.body
  );
}
