import React, { useState } from 'react';
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
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000, background: '#fff', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 'bold' }}>{exercise.exercise}</h2>
      </div>

      {/* Main Scrollable Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 100px 24px' }}>
        
        {/* Big GIF */}
        <div style={{ width: '100%', height: '300px', background: '#f8f9fa', borderRadius: '16px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '24px' }}>
          <img src={details.gifUrl || details.icon} alt={exercise.exercise} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: '#f1f3f5', borderRadius: '30px', padding: '4px', marginBottom: '30px' }}>
          <button 
            onClick={() => setActiveTab('video')}
            style={{ flex: 1, padding: '12px 0', borderRadius: '30px', border: 'none', fontWeight: 'bold', cursor: 'pointer', background: activeTab === 'video' ? '#0066ff' : 'transparent', color: activeTab === 'video' ? '#fff' : '#6c757d', transition: 'all 0.2s' }}
          >
            動画
          </button>
          <button 
            onClick={() => setActiveTab('muscle')}
            style={{ flex: 1, padding: '12px 0', borderRadius: '30px', border: 'none', fontWeight: 'bold', cursor: 'pointer', background: activeTab === 'muscle' ? '#0066ff' : 'transparent', color: activeTab === 'muscle' ? '#fff' : '#6c757d', transition: 'all 0.2s' }}
          >
            筋肉
          </button>
          <button 
            onClick={() => setActiveTab('tutorial')}
            style={{ flex: 1, padding: '12px 0', borderRadius: '30px', border: 'none', fontWeight: 'bold', cursor: 'pointer', background: activeTab === 'tutorial' ? '#0066ff' : 'transparent', color: activeTab === 'tutorial' ? '#fff' : '#6c757d', transition: 'all 0.2s' }}
          >
            チュートリアル
          </button>
        </div>

        {/* Tab Content: Video */}
        {activeTab === 'video' && (
          <div className="animate-fade-in">
            {/* Duration/Reps Adjuster */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0066ff', fontWeight: 'bold' }}>
                {exercise.duration ? '期間' : '回数'}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button onClick={() => handleAdjustDuration(exercise.duration ? -5 : -1)} style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #dee2e6', background: '#fff', fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}>-</button>
                <span style={{ fontSize: '1.4rem', fontWeight: 'bold', minWidth: '80px', textAlign: 'center' }}>
                  {exercise.duration || (exercise.reps ? `x${exercise.reps}` : '-')}
                </span>
                <button onClick={() => handleAdjustDuration(exercise.duration ? 5 : 1)} style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #dee2e6', background: '#fff', fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}>+</button>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#0066ff', fontWeight: 'bold' }}>説明</h3>
              <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.6', color: '#495057', whiteSpace: 'pre-wrap' }}>
                {details.description || 'このトレーニングの詳しい説明はありません。正しいフォームを意識して行いましょう。'}
              </p>
            </div>

            {/* Target Area Tags */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#0066ff', fontWeight: 'bold' }}>ターゲット部位</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {(details.targetTags || ['全身']).map((tag, idx) => (
                  <span key={idx} style={{ padding: '8px 16px', background: '#f8f9fa', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold', color: '#495057', display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0066ff', marginRight: '8px' }}></div>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Muscle Map */}
        {activeTab === 'muscle' && (
          <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'flex-start', paddingTop: '10px', paddingBottom: '30px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <h4 style={{ fontSize: '0.9rem', color: '#6c757d', marginBottom: '10px' }}>前面</h4>
              <div style={{ width: '100%', maxWidth: '140px' }}>
                <Model data={muscleData} style={{ width: '100%', height: 'auto' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <h4 style={{ fontSize: '0.9rem', color: '#6c757d', marginBottom: '10px' }}>背面</h4>
              <div style={{ width: '100%', maxWidth: '140px' }}>
                <Model type="posterior" data={muscleData} style={{ width: '100%', height: 'auto' }} />
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Tutorial */}
        {activeTab === 'tutorial' && (
          <div className="animate-fade-in">
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#0066ff', fontWeight: 'bold' }}>やり方・ポイント</h3>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#495057', lineHeight: '1.8' }}>
              {details.instructions.map((inst, idx) => (
                <li key={idx} style={{ marginBottom: '8px' }}>{inst}</li>
              ))}
            </ul>
          </div>
        )}

      </div>

      {/* Footer Navigation */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 24px', background: '#fff', borderTop: '1px solid #f1f3f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button 
            onClick={onPrev} 
            disabled={index === 0}
            style={{ background: '#e9ecef', border: 'none', width: '40px', height: '40px', borderRadius: '50%', color: index === 0 ? '#ced4da' : '#495057', cursor: index === 0 ? 'default' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <i className="fa-solid fa-backward-step"></i>
          </button>
          
          <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#495057', width: '50px', textAlign: 'center' }}>
            {index + 1}/{total}
          </span>
          
          <button 
            onClick={onNext}
            disabled={index === total - 1}
            style={{ background: '#e9ecef', border: 'none', width: '40px', height: '40px', borderRadius: '50%', color: index === total - 1 ? '#ced4da' : '#495057', cursor: index === total - 1 ? 'default' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <i className="fa-solid fa-forward-step"></i>
          </button>
        </div>

        <button 
          onClick={onClose}
          style={{ padding: '14px 40px', background: '#0066ff', color: '#fff', borderRadius: '30px', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0, 102, 255, 0.3)' }}
        >
          閉じる
        </button>

      </div>

    </div>
  );
}
