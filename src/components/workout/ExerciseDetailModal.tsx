import React, { useState, useEffect, useRef } from 'react';
import Model from 'react-body-highlighter';
import { AiExercise } from './AiMenuModal';
import { getExerciseDetails } from '@/lib/exerciseDictionary';

interface ExerciseDetailModalProps {
  exercise: AiExercise;
  index: number;
  total: number;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  onReplace?: () => void;
  onUpdateDuration?: (newDuration: string) => void;
}

export default function ExerciseDetailModal({ 
  exercise, index, total, onClose, onNext, onPrev, onReplace, onUpdateDuration 
}: ExerciseDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'video' | 'muscle' | 'tutorial'>('video');
  const details = getExerciseDetails(exercise.exercise);
  
  const muscleData = [
    { name: 'Target Muscles', muscles: details.targetMuscles || [] }
  ];

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [exercise, index]);

  const handleAdjustDuration = (delta: number) => {
    if (!exercise.duration && !exercise.reps) return;
    
    if (exercise.duration) {
      const parts = exercise.duration.split(':');
      if (parts.length === 2) {
        let secs = parseInt(parts[0]) * 60 + parseInt(parts[1]);
        secs += delta;
        if (secs < 5) secs = 5;
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        if (onUpdateDuration) onUpdateDuration(`${m}:${s}`);
      }
    } else if (exercise.reps) {
      let r = exercise.reps + delta;
      if (r < 1) r = 1;
      if (onUpdateDuration) onUpdateDuration(`x${r}`);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={onClose}>
      
      <div style={{ width: '100%', maxWidth: '380px', height: '570px', background: '#fff', borderRadius: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 12px 30px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '18px 24px 8px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>{exercise.exercise}</h2>
        </div>

        {/* Main Scrollable Content */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '0 24px 15px 24px' }}>
          
          {/* Big GIF */}
          <div style={{ width: '100%', height: '130px', background: '#f8f9fa', borderRadius: '16px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '15px' }}>
            <img src={details.gifUrl || details.icon} alt={exercise.exercise} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', background: '#f1f3f5', borderRadius: '30px', padding: '4px', marginBottom: '15px' }}>
            <button 
              onClick={() => setActiveTab('video')}
              style={{ flex: 1, padding: '9px 0', borderRadius: '30px', border: 'none', fontWeight: 'bold', cursor: 'pointer', background: activeTab === 'video' ? '#0066ff' : 'transparent', color: activeTab === 'video' ? '#fff' : '#6c757d', transition: 'all 0.2s', fontSize: '0.85rem' }}
            >
              動画
            </button>
            <button 
              onClick={() => setActiveTab('muscle')}
              style={{ flex: 1, padding: '9px 0', borderRadius: '30px', border: 'none', fontWeight: 'bold', cursor: 'pointer', background: activeTab === 'muscle' ? '#0066ff' : 'transparent', color: activeTab === 'muscle' ? '#fff' : '#6c757d', transition: 'all 0.2s', fontSize: '0.85rem' }}
            >
              筋肉
            </button>
            <button 
              onClick={() => setActiveTab('tutorial')}
              style={{ flex: 1, padding: '9px 0', borderRadius: '30px', border: 'none', fontWeight: 'bold', cursor: 'pointer', background: activeTab === 'tutorial' ? '#0066ff' : 'transparent', color: activeTab === 'tutorial' ? '#fff' : '#6c757d', transition: 'all 0.2s', fontSize: '0.85rem' }}
            >
              チュートリアル
            </button>
          </div>

          {/* Tab Content: Video */}
          {activeTab === 'video' && (
            <div className="animate-fade-in">
              {/* Duration/Reps Adjuster */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#0066ff', fontWeight: 'bold' }}>
                  {exercise.duration ? '期間' : '回数'}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <button onClick={() => handleAdjustDuration(exercise.duration ? -5 : -1)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #dee2e6', background: '#fff', fontSize: '1rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}>-</button>
                  <span style={{ fontSize: '1.1rem', fontWeight: 'bold', minWidth: '60px', textAlign: 'center' }}>
                    {exercise.duration || (exercise.reps ? `x${exercise.reps}` : '-')}
                  </span>
                  <button onClick={() => handleAdjustDuration(exercise.duration ? 5 : 1)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #dee2e6', background: '#fff', fontSize: '1rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}>+</button>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '15px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', color: '#0066ff', fontWeight: 'bold' }}>説明</h3>
                <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: '1.45', color: '#495057', whiteSpace: 'pre-wrap' }}>
                  {details.description || 'このトレーニングの詳しい説明はありません。正しいフォームを意識して行いましょう。'}
                </p>
              </div>

              {/* Target Area Tags */}
              <div style={{ marginBottom: '5px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', color: '#0066ff', fontWeight: 'bold' }}>ターゲット部位</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(details.targetTags || ['全身']).map((tag, idx) => (
                    <span key={idx} style={{ padding: '6px 12px', background: '#f8f9fa', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', color: '#495057', display: 'flex', alignItems: 'center' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0066ff', marginRight: '6px' }}></div>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: Muscle Map */}
          {activeTab === 'muscle' && (
            <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'flex-start', paddingTop: '0px', paddingBottom: '0px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <h4 style={{ fontSize: '0.8rem', color: '#6c757d', marginBottom: '4px', marginTop: '0' }}>前面</h4>
                <div style={{ width: '100%', maxWidth: '85px' }}>
                  <Model data={muscleData} style={{ width: '100%', height: 'auto' }} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <h4 style={{ fontSize: '0.8rem', color: '#6c757d', marginBottom: '4px', marginTop: '0' }}>背面</h4>
                <div style={{ width: '100%', maxWidth: '85px' }}>
                  <Model type="posterior" data={muscleData} style={{ width: '100%', height: 'auto' }} />
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: Tutorial */}
          {activeTab === 'tutorial' && (
            <div className="animate-fade-in" style={{ paddingBottom: '10px' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: '#0066ff', fontWeight: 'bold' }}>やり方・ポイント</h3>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#495057', lineHeight: '1.6', fontSize: '0.9rem' }}>
                {details.instructions.map((inst, idx) => (
                  <li key={idx} style={{ marginBottom: '6px' }}>{inst}</li>
                ))}
              </ul>
            </div>
          )}

        </div>

        {/* Footer Navigation */}
        <div style={{ padding: '15px 24px', background: '#fff', borderTop: '1px solid #f1f3f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              onClick={onPrev} 
              disabled={index === 0}
              style={{ background: '#e9ecef', border: 'none', width: '32px', height: '32px', borderRadius: '50%', color: index === 0 ? '#ced4da' : '#495057', cursor: index === 0 ? 'default' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.9rem' }}
            >
              <i className="fa-solid fa-backward-step"></i>
            </button>
            
            <span style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#495057', width: '40px', textAlign: 'center' }}>
              {index + 1}/{total}
            </span>
            
            <button 
              onClick={onNext}
              disabled={index === total - 1}
              style={{ background: '#e9ecef', border: 'none', width: '32px', height: '32px', borderRadius: '50%', color: index === total - 1 ? '#ced4da' : '#495057', cursor: index === total - 1 ? 'default' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.9rem' }}
            >
              <i className="fa-solid fa-forward-step"></i>
            </button>
          </div>

          <button 
            onClick={onClose}
            style={{ padding: '10px 30px', background: '#0066ff', color: '#fff', borderRadius: '30px', fontSize: '1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0, 102, 255, 0.3)' }}
          >
            閉じる
          </button>

        </div>

      </div>
    </div>
  );
}
