'use client';
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../AppContext';
import { calculateGoals } from '@/lib/storage';
import HeightSelectModal from '../ui/HeightSelectModal';

export default function Profile() {
  const { userProfile, setUserProfile, setActiveTab } = useAppContext();
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    gender: userProfile?.gender || 'male',
    age: userProfile?.age || 28,
    trainerName: userProfile?.trainerName || '筋虎',
    height: userProfile?.height || 172,
    weight: userProfile?.weight || 65,
    targetWeight: userProfile?.targetWeight || 60,
    goal: userProfile?.goal || '筋肥大・バルクアップ',
    activityLevel: userProfile?.activityLevel || '1.55',
    bmr: userProfile?.bmr || 0,
    tdee: userProfile?.tdee || 0,
    targetCal: userProfile?.targetCal || 0,
    targetP: userProfile?.targetP || 0,
    targetF: userProfile?.targetF || 0,
    targetC: userProfile?.targetC || 0,
    exerciseTime: userProfile?.exerciseTime || 30,
  });

  const [isHeightModalOpen, setIsHeightModalOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        name: userProfile.name || prev.name,
        gender: userProfile.gender || prev.gender,
        age: userProfile.age || prev.age,
        trainerName: userProfile.trainerName || prev.trainerName,
        height: userProfile.height || prev.height,
        weight: userProfile.weight || prev.weight,
        targetWeight: userProfile.targetWeight || prev.targetWeight,
        goal: userProfile.goal || prev.goal,
        activityLevel: userProfile.activityLevel || prev.activityLevel,
        exerciseTime: userProfile.exerciseTime || prev.exerciseTime,
      }));
    }
  }, [userProfile]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert activityLevel to 'low', 'normal', 'high' format if needed, or directly use it for calculation
    const calculated = calculateGoals({
      ...formData,
      activity: formData.activityLevel === '座学メイン' ? 'low' : 
                formData.activityLevel === '３０分' ? 'normal' : 
                formData.activityLevel === '１時間' ? 'normal' : 'high'
    } as any);
    
    const updatedProfile = { ...formData, ...calculated };
    
    setUserProfile(updatedProfile);
    localStorage.setItem('kinnikun_profile', JSON.stringify(updatedProfile));
    setActiveTab('dashboard');
  };

  return (
    <section id="profile" className="content-section active">
      <div className="section-layout single-column">
        <div className="form-container glass-panel profile-panel">
          <h2><i className="fa-solid fa-user-circle icon-orange"></i> プロフィール & 目標設定</h2>
          <p className="section-desc">あなたの体型データと目的に基づき、最適な目標摂取カロリーとPFCバランスを自動計算します。</p>

          <form className="app-form" onSubmit={handleSave}>
            <div className="form-grid-2col">
              <div className="form-group">
                <label>ニックネーム</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="ゲストユーザー" />
              </div>
              <div className="form-group">
                <label>性別</label>
                <select name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="male">男性</option>
                  <option value="female">女性</option>
                </select>
              </div>
              <div className="form-group">
                <label>年齢 (歳)</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} min="15" max="100" />
              </div>
              <div className="form-group">
                <label>AIトレーナーの名前</label>
                <input type="text" name="trainerName" value={formData.trainerName} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>身長 (cm)</label>
                <div 
                  onClick={() => setIsHeightModalOpen(true)}
                  style={{
                    padding: '12px 16px',
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: '8px',
                    backgroundColor: '#f8f9fa',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: '#212529'
                  }}
                >
                  <span>{formData.height === 130 ? '130cm以下' : `${formData.height}cm`}</span>
                  <i className="fa-solid fa-chevron-down" style={{color: '#888'}}></i>
                </div>
              </div>
              <div className="form-group">
                <label>体重 (kg)</label>
                <input type="number" name="weight" value={formData.weight} onChange={handleChange} min="30" max="200" />
              </div>
              <div className="form-group">
                <label>目標体重 (kg)</label>
                <input type="number" name="targetWeight" value={formData.targetWeight} onChange={handleChange} min="30" max="200" />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '15px' }}>
              <label>主な目標</label>
              <select name="goal" value={formData.goal} onChange={handleChange}>
                <option value="増量">💪 筋肉増強 (増量)</option>
                <option value="減量">🔥 体重を減らす (減量)</option>
                <option value="現状維持">🏃‍♂️ 健康維持 (現状維持)</option>
              </select>
            </div>
            
            <div className="form-group" style={{ marginTop: '15px' }}>
              <label>日常の活動レベル</label>
              <select name="activityLevel" value={formData.activityLevel} onChange={handleChange}>
                <option value="座学メイン">座学メイン (デスクワーク等)</option>
                <option value="３０分">1日30分程度歩く/動く</option>
                <option value="１時間">1日1時間程度歩く/動く</option>
                <option value="運動大好き">肉体労働・運動大好き</option>
              </select>
            </div>

            <div className="form-group" style={{ marginTop: '15px' }}>
              <label>1回あたりの目標運動時間 (分)</label>
              <input type="number" name="exerciseTime" value={formData.exerciseTime} onChange={handleChange} min="5" max="300" step="5" />
            </div>

            <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '25px' }}>
              <i className="fa-solid fa-floppy-disk"></i> 保存して目標を計算する
            </button>
          </form>

          <HeightSelectModal 
            isOpen={isHeightModalOpen}
            onClose={() => setIsHeightModalOpen(false)}
            initialHeight={formData.height}
            onConfirm={(height) => setFormData(prev => ({ ...prev, height }))}
          />
        </div>
      </div>
    </section>
  );
}
