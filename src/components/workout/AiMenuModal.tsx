'use client';
import React, { useState } from 'react';
import { getExerciseDetails } from '@/lib/exerciseDictionary';
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
  onApply: (exercises: AiExercise[]) => void;
}

const ExerciseItem = ({ item, type }: { item: AiExercise, type: string }) => {
  const details = getExerciseDetails(item.exercise);

  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #f1f3f5' }}>
      <i className="fa-solid fa-bars" style={{ color: '#ced4da', marginRight: '15px', cursor: 'grab' }}></i>
      <div style={{ width: '50px', height: '50px', background: '#f8f9fa', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: '15px', overflow: 'hidden' }}>
        <img src={details.icon} alt={item.exercise} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 'bold', fontSize: '1rem', color: '#212529', marginBottom: '4px' }}>{item.exercise}</div>
        <div style={{ fontSize: '0.85rem', color: '#868e96' }}>
          {item.duration ? item.duration : `${item.weight ? item.weight+'kg × ' : ''}${item.reps}回 × ${item.sets}セット`}
        </div>
      </div>
      <button style={{ background: 'none', border: 'none', color: '#adb5bd', cursor: 'pointer', padding: '5px' }}>
        <i className="fa-solid fa-right-left"></i>
      </button>
    </div>
  );
};

import WorkoutPlayer from './WorkoutPlayer';

export default function AiMenuModal({ data, onClose, onApply }: AiMenuModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const allExercises = [
    ...(data.warmup || []),
    ...(data.training || []),
    ...(data.cooldown || [])
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

  const totalTime = data.estimatedMinutes || calculateTotalTime();
  const totalExercises = data.exerciseCount || allExercises.length;

  const handleStart = () => {
    setIsPlaying(true);
  };

  if (isPlaying) {
    return (
      <WorkoutPlayer 
        exercises={allExercises} 
        onComplete={() => onApply(allExercises)} 
        onCancel={() => setIsPlaying(false)} 
      />
    );
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: '#fff', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
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
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0, color: '#000' }}>{data.title || '1日目'}</h1>
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

        <button 
          onClick={handleStart}
          style={{ width: '100%', padding: '18px', background: '#0066ff', color: '#fff', borderRadius: '30px', fontSize: '1.2rem', fontWeight: 'bold', border: 'none', cursor: 'pointer', marginBottom: '30px', boxShadow: '0 4px 14px rgba(0, 102, 255, 0.3)' }}
        >
          スタート
        </button>

        {/* Exercises List */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0, color: '#212529' }}>エクササイズ</h2>
          <span style={{ color: '#0066ff', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer' }}>編集 <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.8rem' }}></i></span>
        </div>

        {data.warmup && data.warmup.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#212529', marginBottom: '10px' }}>ウォームアップ</h3>
            {data.warmup.map((ex, i) => <ExerciseItem key={`w-${i}`} item={ex} type="warmup" />)}
          </div>
        )}

        {data.training && data.training.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#212529', marginBottom: '10px' }}>トレーニング</h3>
            {data.training.map((ex, i) => <ExerciseItem key={`t-${i}`} item={ex} type="training" />)}
          </div>
        )}

        {data.cooldown && data.cooldown.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#212529', marginBottom: '10px' }}>クールダウン</h3>
            {data.cooldown.map((ex, i) => <ExerciseItem key={`c-${i}`} item={ex} type="cooldown" />)}
          </div>
        )}

      </div>
    </div>
  );
}
