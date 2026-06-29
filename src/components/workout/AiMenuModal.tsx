'use client';
import React, { useState } from 'react';
import { getExerciseDetails } from '@/lib/exerciseDictionary';
import WorkoutPlayer from './WorkoutPlayer';
import ExerciseDetailModal from './ExerciseDetailModal';

export type AiMenuSection = 'warmup' | 'training' | 'cooldown';

export interface AiExercise {
  exercise: string;
  duration?: string;
  weight?: number;
  reps?: number;
  sets?: number;
  calories?: number;
  instructions?: string[];
}

export interface AiMenuData {
  warmup?: AiExercise[];
  training?: AiExercise[];
  cooldown?: AiExercise[];
  estimatedMinutes?: number;
  exerciseCount?: number;
  title?: string;
  [key: string]: any;
}

interface AiMenuModalProps {
  data: AiMenuData;
  onClose: () => void;
  onApply: (exercises: AiExercise[], percentage: number, title: string, isPartial?: boolean) => void;
}

const ExerciseItem = ({ item, onClick, id }: { item: AiExercise, onClick: () => void, id?: string }) => {
  const details = getExerciseDetails(item.exercise);

  return (
    <div 
      id={id}
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #f1f3f5', cursor: 'pointer', transition: 'background 0.2s' }}
      onMouseOver={(e) => e.currentTarget.style.background = '#f8f9fa'}
      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
    >
      <i className="fa-solid fa-bars" style={{ color: '#ced4da', marginRight: '15px', cursor: 'grab' }} onClick={(e) => e.stopPropagation()}></i>
      <div style={{ width: '50px', height: '50px', background: '#f8f9fa', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: '15px', overflow: 'hidden' }}>
        <img src={details.gifUrl || details.icon} alt={item.exercise} style={{ width: '120%', height: '120%', objectFit: 'cover' }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 'bold', fontSize: '1rem', color: '#212529', marginBottom: '4px' }}>{item.exercise}</div>
        <div style={{ fontSize: '0.85rem', color: '#868e96' }}>
          {item.duration ? item.duration : `${item.weight ? item.weight+'kg × ' : ''}${item.reps ? 'x'+item.reps : ''}`}
        </div>
      </div>
      <button style={{ background: 'none', border: 'none', color: '#adb5bd', padding: '5px' }}>
        <i className="fa-solid fa-right-left"></i>
      </button>
    </div>
  );
};

export default function AiMenuModal({ data, onClose, onApply }: AiMenuModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [resumeIndex, setResumeIndex] = useState(0);

  React.useEffect(() => {
    if (data.title) {
      const saved = localStorage.getItem(`workout_progress_${data.title}`);
      if (saved) {
        setResumeIndex(parseInt(saved, 10) || 0);
      }
    }
  }, [data.title]);

  React.useEffect(() => {
    if (selectedIndex !== null) {
      const el = document.getElementById(`exercise-item-${selectedIndex}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedIndex]);
  
  // Clone the data to allow duration/reps updates
  const [currentData, setCurrentData] = useState<AiMenuData>(data);

  const allExercises: AiExercise[] = [
    ...(currentData.warmup || []),
    ...(currentData.training || []),
    ...(currentData.cooldown || [])
  ];

  const calculateTotalTime = () => {
    let totalSeconds = 0;
    allExercises.forEach(ex => {
      if (ex.duration) {
        const parts = ex.duration.split(':');
        if (parts.length === 2) {
          totalSeconds += parseInt(parts[0]) * 60 + parseInt(parts[1]);
        }
      } else if (ex.reps && ex.sets) {
        totalSeconds += ex.reps * 3 * ex.sets; // 1回約3秒
        totalSeconds += (ex.sets - 1) * 30;    // セット間休憩30秒
      } else if (ex.reps) {
        totalSeconds += ex.reps * 3;
      }
      totalSeconds += 10; // 種目間休憩10秒
    });
    return Math.max(1, Math.round(totalSeconds / 60));
  };

  const totalTime = currentData.estimatedMinutes || calculateTotalTime();
  const totalExercises = currentData.exerciseCount || allExercises.length;

  const handleStart = (startIdx: number = 0) => {
    setResumeIndex(startIdx);
    setIsPlaying(true);
  };

  const handleCancelWorkout = (idx: number) => {
    setIsPlaying(false);
    if (idx > 0 && idx < allExercises.length) {
      localStorage.setItem(`workout_progress_${currentData.title}`, idx.toString());
      setResumeIndex(idx);
      const percentage = Math.round((idx / totalExercises) * 100);
      onApply(allExercises, percentage, currentData.title || 'トレーニング', true);
    } else {
      localStorage.removeItem(`workout_progress_${currentData.title}`);
      setResumeIndex(0);
    }
  };

  const handleCompleteWorkout = () => {
    localStorage.removeItem(`workout_progress_${currentData.title}`);
    onApply(allExercises, 100, currentData.title || 'トレーニング');
  };

  const handleUpdateDuration = (index: number, newDuration: string) => {
    // Find which array this index belongs to
    let wLen = (currentData.warmup || []).length;
    let tLen = (currentData.training || []).length;
    let cLen = (currentData.cooldown || []).length;
    
    const newData = { ...currentData };
    if (index < wLen) {
      if (!newData.warmup) newData.warmup = [];
      const ex = {...newData.warmup[index]};
      if (newDuration.startsWith('x')) ex.reps = parseInt(newDuration.substring(1));
      else ex.duration = newDuration;
      newData.warmup[index] = ex;
    } else if (index < wLen + tLen) {
      if (!newData.training) newData.training = [];
      const tIdx = index - wLen;
      const ex = {...newData.training[tIdx]};
      if (newDuration.startsWith('x')) ex.reps = parseInt(newDuration.substring(1));
      else ex.duration = newDuration;
      newData.training[tIdx] = ex;
    } else {
      if (!newData.cooldown) newData.cooldown = [];
      const cIdx = index - wLen - tLen;
      const ex = {...newData.cooldown[cIdx]};
      if (newDuration.startsWith('x')) ex.reps = parseInt(newDuration.substring(1));
      else ex.duration = newDuration;
      newData.cooldown[cIdx] = ex;
    }
    setCurrentData(newData);
  };



  if (isPlaying) {
    return (
      <WorkoutPlayer 
        exercises={allExercises} 
        onComplete={handleCompleteWorkout} 
        onCancel={handleCancelWorkout} 
        initialIndex={resumeIndex}
      />
    );
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '100dvh', zIndex: 9999, background: 'rgba(0,0,0,0.5)', overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '600px', background: '#fff', minHeight: '100dvh', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 0 20px rgba(0,0,0,0.1)' }}>
      {selectedIndex !== null && (
        <ExerciseDetailModal
          exercise={allExercises[selectedIndex]}
          index={selectedIndex}
          total={allExercises.length}
          onClose={() => setSelectedIndex(null)}
          onNext={() => setSelectedIndex(Math.min(allExercises.length - 1, selectedIndex + 1))}
          onPrev={() => setSelectedIndex(Math.max(0, selectedIndex - 1))}
          onUpdateDuration={(newDur) => handleUpdateDuration(selectedIndex, newDur)}
        />
      )}

      {/* Header Image */}
      <div style={{ position: 'relative', height: '300px', flexShrink: 0, background: '#e9ecef', overflow: 'hidden' }}>
        <img 
          src="/trainer-hero.png" 
          alt="Trainer" 
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
        />
        <div style={{ position: 'absolute', top: '20px', left: '20px', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', color: '#fff' }} onClick={onClose}>
          <i className="fa-solid fa-arrow-left"></i>
        </div>
        <div style={{ position: 'absolute', top: '20px', right: '20px', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', color: '#fff' }}>
          <i className="fa-solid fa-ellipsis-vertical"></i>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '24px', background: '#fff', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', marginTop: '-24px', position: 'relative', zIndex: 10 }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0, color: '#000' }}>{currentData.title || '1日目'}</h1>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', color: '#000' }}>
            <i className="fa-solid fa-bars-staggered" style={{ position: 'relative' }}>
              <i className="fa-solid fa-gear" style={{ position: 'absolute', bottom: '-4px', right: '-6px', fontSize: '0.6rem', background: '#fff', borderRadius: '50%' }}></i>
            </i>
          </button>
        </div>

        <div style={{ display: 'flex', gap: '20px', fontSize: '0.95rem', color: '#6c757d', fontWeight: 'bold', marginBottom: '24px' }}>
          <span><i className="fa-regular fa-clock" style={{ color: '#adb5bd', marginRight: '4px' }}></i> {totalTime} 分</span>
          <span><i className="fa-solid fa-fire" style={{ color: '#adb5bd', marginRight: '4px' }}></i> {totalExercises} エクササイズ</span>
        </div>

        {resumeIndex > 0 ? (
          <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
            <button 
              onClick={() => handleStart(0)}
              style={{ flex: 1, padding: '18px 0', background: '#343a40', color: '#fff', borderRadius: '30px', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}
            >
              もう一度最初から
            </button>
            <button 
              onClick={() => handleStart(resumeIndex)}
              style={{ flex: 1, padding: '12px 0', background: '#0066ff', color: '#fff', borderRadius: '30px', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0, 102, 255, 0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
            >
              <span style={{ fontSize: '1.1rem', marginBottom: '2px' }}>続行</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 'normal' }}>{Math.round((resumeIndex / totalExercises) * 100)}% 完了</span>
            </button>
          </div>
        ) : (
          <button 
            onClick={() => handleStart(0)}
            style={{ width: '100%', padding: '18px', background: '#0066ff', color: '#fff', borderRadius: '30px', fontSize: '1.2rem', fontWeight: 'bold', border: 'none', cursor: 'pointer', marginBottom: '30px', boxShadow: '0 4px 14px rgba(0, 102, 255, 0.3)' }}
          >
            スタート
          </button>
        )}

        {/* Exercises List */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0, color: '#212529' }}>エクササイズ</h2>
        </div>

        {currentData.warmup && currentData.warmup.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#212529', marginBottom: '10px' }}>ウォームアップ</h3>
            {currentData.warmup.map((ex, i) => <ExerciseItem key={`w-${i}`} id={`exercise-item-${i}`} item={ex} onClick={() => setSelectedIndex(i)} />)}
          </div>
        )}

        {currentData.training && currentData.training.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#212529', marginBottom: '10px' }}>トレーニング</h3>
            {currentData.training.map((ex, i) => {
              const offset = (currentData.warmup || []).length;
              return <ExerciseItem key={`t-${i}`} id={`exercise-item-${offset + i}`} item={ex} onClick={() => setSelectedIndex(offset + i)} />;
            })}
          </div>
        )}

        {currentData.cooldown && currentData.cooldown.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#212529', marginBottom: '10px' }}>クールダウン</h3>
            {currentData.cooldown.map((ex, i) => {
              const offset = (currentData.warmup || []).length + (currentData.training || []).length;
              return <ExerciseItem key={`c-${i}`} id={`exercise-item-${offset + i}`} item={ex} onClick={() => setSelectedIndex(offset + i)} />;
            })}
          </div>
        )}

      </div>
      </div>
    </div>
  );
}
