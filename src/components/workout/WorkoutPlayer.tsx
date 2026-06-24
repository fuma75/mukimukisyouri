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
      {phase !== 'rest' && (
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
      )}

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: phase === 'rest' ? 'flex-start' : 'center', padding: phase === 'rest' ? '0' : '20px', textAlign: 'center', position: 'relative' }}>
        
        {phase === 'ready' && (
          <div style={{ animation: 'pulse 1s infinite' }}>
            <h2 style={{ fontSize: '2rem', color: '#adb5bd', marginBottom: '20px' }}>準備してください</h2>
            <div style={{ fontSize: '6rem', fontWeight: 'bold', color: '#1a73e8' }}>{timeLeft}</div>
          </div>
        )}

        {phase === 'rest' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }}>
            <div style={{ flex: 1, background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', padding: '20px' }}>
              <div style={{ width: '100%', height: '100%', maxHeight: '40vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <img 
                  src={getExerciseDetails(exercises[currentIndex + 1]?.exercise || '').gifUrl || getExerciseDetails(exercises[currentIndex + 1]?.exercise || '').image || 'https://v2.exercisedb.io/image/1'} 
                  alt="Next Exercise" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                />
              </div>
            </div>
            
            <div style={{ flex: 1.2, background: '#0d6efd', color: '#fff', padding: '30px 20px', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                 <div style={{ textAlign: 'left' }}>
                   <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '5px', opacity: 0.9 }}>次へ {currentIndex + 2}/{exercises.length}</div>
                   <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{exercises[currentIndex + 1]?.exercise}</div>
                 </div>
                 <div style={{ fontSize: '1.3rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                   {exercises[currentIndex + 1]?.reps ? `x ${exercises[currentIndex + 1].reps}` : exercises[currentIndex + 1]?.duration ? `${exercises[currentIndex + 1].duration}` : ''}
                 </div>
              </div>
              
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                <div style={{ fontSize: '1.2rem', opacity: 0.9 }}>休憩</div>
                <div style={{ fontSize: '4.5rem', fontWeight: 'bold', lineHeight: 1, margin: '10px 0' }}>
                  {formatTime(timeLeft || 0)}
                </div>
                <button style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '20px', fontSize: '0.9rem', cursor: 'pointer' }}>
                  休憩時間を編集
                </button>
              </div>
              
              <div style={{ display: 'flex', gap: '15px', width: '100%', marginTop: '20px' }}>
                <button 
                  onClick={() => setTimeLeft((prev) => (prev !== null ? prev + 20 : null))}
                  style={{ flex: 1, padding: '16px', background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', borderRadius: '30px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  +20s
                </button>
                <button 
                  onClick={handleSkipRest}
                  style={{ flex: 1, padding: '16px', background: '#fff', color: '#0d6efd', border: 'none', borderRadius: '30px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  スキップ
                </button>
              </div>
            </div>
          </div>
        )}

        {phase === 'work' && currentEx && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {getExerciseDetails(currentEx.exercise).gifUrl ? (
              <div style={{ width: '100%', maxWidth: '350px', height: '250px', borderRadius: '24px', overflow: 'hidden', marginBottom: '20px', background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <img 
                  src={getExerciseDetails(currentEx.exercise).gifUrl} 
                  alt={currentEx.exercise} 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                />
              </div>
            ) : getExerciseDetails(currentEx.exercise).images && getExerciseDetails(currentEx.exercise).images!.length > 0 ? (
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '30px', marginTop: '20px' }}>
                <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <svg width="160" height="160" viewBox="0 0 160 160" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
                    <circle cx="80" cy="80" r="72" fill="none" stroke="#f1f3f5" strokeWidth="12" />
                    <circle 
                      cx="80" cy="80" r="72" fill="none" stroke="#0d6efd" strokeWidth="12" 
                      strokeLinecap="round"
                      strokeDasharray="452.39" 
                      strokeDashoffset={452.39 * (1 - (timeLeft || 0) / (parseDuration(currentEx.duration) || 1))}
                      style={{ transition: 'stroke-dashoffset 1s linear' }}
                    />
                  </svg>
                  <div style={{ fontSize: '4rem', fontWeight: '900', color: '#212529', zIndex: 1 }}>
                    {timeLeft}
                  </div>
                </div>
                <button 
                  onClick={handleNext} 
                  style={{ width: '60px', height: '60px', background: '#fff', border: 'none', color: '#212529', fontSize: '2rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                >
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
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
      {phase === 'work' && !isTimeBased && (
        <div style={{ padding: '30px', display: 'flex', justifyContent: 'center', gap: '20px', background: '#fff' }}>
          <button 
            onClick={handleNext} 
            style={{ width: '100%', maxWidth: '300px', padding: '20px', background: '#1a73e8', color: '#fff', borderRadius: '40px', fontSize: '1.5rem', fontWeight: 'bold', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(26, 115, 232, 0.3)' }}
          >
            <i className="fa-solid fa-check"></i> 完了して次へ
          </button>
        </div>
      )}
    </div>
  );
}
