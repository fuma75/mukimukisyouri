'use client';
import React, { useState, useEffect, useRef } from 'react';
import { AiExercise } from './AiMenuModal';
import { getExerciseDetails } from '@/lib/exerciseDictionary';
interface WorkoutPlayerProps {
  exercises: AiExercise[];
  onComplete: () => void;
  onCancel: () => void;
}

type Phase = 'ready' | 'work' | 'rest' | 'done';

const parseDuration = (dur?: string): number | null => {
  if (!dur) return null;
  const parts = dur.split(':');
  if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }
  return null;
};



export default function WorkoutPlayer({ exercises, onComplete, onCancel }: WorkoutPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
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
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000, background: '#fff', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header / Progress */}
      <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px', background: '#fff', borderBottom: '1px solid #f1f3f5' }}>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#495057', cursor: 'pointer' }}>
          <i className="fa-solid fa-xmark"></i>
        </button>
        <div style={{ flex: 1, height: '8px', background: '#e9ecef', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${progressPercent}%`, height: '100%', background: '#1a73e8', transition: 'width 0.3s ease' }}></div>
        </div>
        <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#868e96' }}>
          {currentIndex + 1} / {exercises.length}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
        
        {phase === 'ready' && (
          <div style={{ animation: 'pulse 1s infinite' }}>
            <h2 style={{ fontSize: '2rem', color: '#adb5bd', marginBottom: '20px' }}>準備してください</h2>
            <div style={{ fontSize: '6rem', fontWeight: 'bold', color: '#1a73e8' }}>{timeLeft}</div>
          </div>
        )}

        {phase === 'rest' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', color: '#20c997', marginBottom: '10px' }}>休憩 (インターバル)</h2>
            <div style={{ fontSize: '5rem', fontWeight: 'bold', color: '#20c997', marginBottom: '30px' }}>{formatTime(timeLeft || 0)}</div>
            
            <div style={{ background: '#f8f9fa', padding: '15px 30px', borderRadius: '16px', marginBottom: '30px' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#868e96' }}>次は...</p>
              <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#212529' }}>{exercises[currentIndex + 1]?.exercise}</h3>
            </div>

            <button onClick={handleSkipRest} style={{ padding: '12px 30px', background: '#e9ecef', color: '#495057', border: 'none', borderRadius: '24px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>
              休憩をスキップ <i className="fa-solid fa-forward-step"></i>
            </button>
          </div>
        )}

        {phase === 'work' && currentEx && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {getExerciseDetails(currentEx.exercise).images && getExerciseDetails(currentEx.exercise).images!.length > 0 ? (
              <div style={{ width: '100%', maxWidth: '300px', height: '220px', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <img 
                  src={getExerciseDetails(currentEx.exercise).images![animFrame % getExerciseDetails(currentEx.exercise).images!.length]} 
                  alt={currentEx.exercise} 
                  style={{ width: '100%', height: '100%', objectFit: 'contain', animation: 'fadeIn 0.1s ease-in-out' }} 
                />
              </div>
            ) : getExerciseDetails(currentEx.exercise).image ? (
              <div style={{ width: '100%', maxWidth: '300px', height: '200px', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                <img src={getExerciseDetails(currentEx.exercise).image} alt={currentEx.exercise} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ) : (
              <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(26, 115, 232, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
                <i className="fa-solid fa-person-running" style={{ fontSize: '4rem', color: '#1a73e8', animation: 'workout-bob 1.5s infinite ease-in-out' }}></i>
              </div>
            )}
            
            <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#212529', marginBottom: '10px' }}>{currentEx.exercise}</h2>
            <p style={{ fontSize: '1.2rem', color: '#868e96', marginBottom: '15px' }}>
              {currentEx.weight ? `${currentEx.weight}kg × ` : ''}{currentEx.reps ? `${currentEx.reps}回` : ''} {currentEx.sets ? `× ${currentEx.sets}セット` : ''}
            </p>

            <div style={{ background: '#f8f9fa', padding: '15px 20px', borderRadius: '12px', width: '100%', maxWidth: '400px', textAlign: 'left', marginBottom: '25px', border: '1px solid #e9ecef' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#495057' }}><i className="fa-solid fa-circle-info"></i> やり方・ポイント</h4>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.95rem', color: '#495057', lineHeight: '1.6' }}>
                {(currentEx.instructions && currentEx.instructions.length > 0 ? currentEx.instructions : getExerciseDetails(currentEx.exercise).instructions).map((inst, i) => (
                  <li key={i}>{inst}</li>
                ))}
              </ul>
            </div>

            {isTimeBased ? (
              <div style={{ fontSize: '4.5rem', fontWeight: 'bold', color: isPaused ? '#adb5bd' : '#1a73e8', fontFamily: 'monospace' }}>
                {formatTime(timeLeft || 0)}
              </div>
            ) : (
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1a73e8', marginBottom: '20px' }}>
                自分のペースで完了させてください
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      {phase === 'work' && (
        <div style={{ padding: '30px', display: 'flex', justifyContent: 'center', gap: '20px', background: '#fff' }}>
          {isTimeBased ? (
            <>
              <button 
                onClick={() => setIsPaused(!isPaused)} 
                style={{ width: '80px', height: '80px', borderRadius: '50%', background: isPaused ? '#20c997' : '#ffc107', color: '#fff', fontSize: '1.5rem', border: 'none', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
              >
                <i className={`fa-solid ${isPaused ? 'fa-play' : 'fa-pause'}`}></i>
              </button>
              <button 
                onClick={handleNext} 
                style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#e9ecef', color: '#495057', fontSize: '1.5rem', border: 'none', cursor: 'pointer' }}
              >
                <i className="fa-solid fa-forward-step"></i>
              </button>
            </>
          ) : (
            <button 
              onClick={handleNext} 
              style={{ width: '100%', maxWidth: '300px', padding: '20px', background: '#1a73e8', color: '#fff', borderRadius: '40px', fontSize: '1.5rem', fontWeight: 'bold', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(26, 115, 232, 0.3)' }}
            >
              <i className="fa-solid fa-check"></i> 完了して次へ
            </button>
          )}
        </div>
      )}
    </div>
  );
}
