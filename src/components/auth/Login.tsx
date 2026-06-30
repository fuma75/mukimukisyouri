'use client';
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../AppContext';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import RulerPicker from '../ui/RulerPicker';
import DateWheelPicker from '../ui/DateWheelPicker';
import ActivityLevelSlider from '../ui/ActivityLevelSlider';

const TOTAL_WIZARD_STEPS = 14;

export default function Login() {
  const { setUserProfile, setActiveTab } = useAppContext();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [estimatedResult, setEstimatedResult] = useState<any>(null);

  // Form State
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [gender, setGender] = useState<'male'|'female'|'other'|''>('male');
  const [goal, setGoal] = useState('減量');
  const [targetAreas, setTargetAreas] = useState<string[]>(['全身']);
  
  const [dob, setDob] = useState('2000-01-01');
  const [height, setHeight] = useState('150');
  const [weight, setWeight] = useState('50');
  const [targetWeight, setTargetWeight] = useState('50');
  
  const [environment, setEnvironment] = useState('家');
  const [exerciseTypes, setExerciseTypes] = useState<string[]>(['なし']);
  const [workoutLevel, setWorkoutLevel] = useState('簡単に始められる');
  const [physicalIssues, setPhysicalIssues] = useState<string[]>(['なし']);
  const [activityLevel, setActivityLevel] = useState('座学メイン');
  const [frequency, setFrequency] = useState('週3回');

  // Toggles
  const [heightUnit, setHeightUnit] = useState('cm');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [showPassword, setShowPassword] = useState(false);

  // Handle auth state and redirect result for mobile login
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          handleLoginSuccess(result.user);
        }
      } catch (error: any) {
        console.error("Redirect login error:", error);
        if (error.code !== 'auth/redirect-cancelled-by-user') {
          alert("Googleログインエラー: " + error.message);
        }
      }
    };
    handleRedirect();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        handleLoginSuccess(user);
      }
    });

    return () => unsubscribe();
  }, []);

  // Constants
  useEffect(() => {
    window.scrollTo(0, 0);
    const container = document.querySelector('.form-container');
    if (container) {
      container.scrollTop = 0;
    }
  }, [step]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (step === 6) {
        const selectedHeight = document.getElementById('selected-height-option');
        if (selectedHeight) {
          selectedHeight.scrollIntoView({ block: 'center' });
          return;
        }
      }

      const selectedCard = document.querySelector('.option-card[style*="rgba(26, 115, 232, 0.05)"]');
      if (selectedCard instanceof HTMLElement) {
        selectedCard.focus();
        return;
      }
      
      const firstCard = document.querySelector('.option-card');
      if (firstCard instanceof HTMLElement) {
        firstCard.focus();
        return;
      }

      const firstWheel = document.querySelector('.wheel-col');
      if (firstWheel instanceof HTMLElement) {
        firstWheel.focus();
        return;
      }

      const firstRuler = document.querySelector('.ruler-col');
      if (firstRuler instanceof HTMLElement) {
        firstRuler.focus();
        return;
      }
    }, 50);
    return () => clearTimeout(timeout);
  }, [step]);

  const handleLoginSuccess = (user: any) => {
    const savedStr = localStorage.getItem('kinnikun_profile');
    if (savedStr) {
      try {
        const savedProfile = JSON.parse(savedStr);
        if (savedProfile && (savedProfile.id === user.uid || savedProfile.id === 'guest')) {
          savedProfile.id = user.uid;
          setUserProfile(savedProfile);
          localStorage.setItem('kinnikun_profile', JSON.stringify(savedProfile));
          setActiveTab('dashboard');
          return;
        }
      } catch (e) {
        console.error("Failed to parse saved profile", e);
      }
    }
    setStep(2);
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!email || !password) return alert("メールアドレスとパスワードを入力してください");
      if (!isLoginMode && !name) return alert("お名前を入力してください");
      setLoading(true);
      try {
        let userCred;
        if (isLoginMode) {
          userCred = await signInWithEmailAndPassword(auth, email, password);
        } else {
          userCred = await createUserWithEmailAndPassword(auth, email, password);
        }
        handleLoginSuccess(userCred.user);
      } catch (e: any) {
        console.error(e);
        if (e.code === 'auth/invalid-credential' || e.code === 'auth/wrong-password' || e.code === 'auth/user-not-found') {
          alert("メールアドレスまたはパスワードが間違っています。未登録の場合は「新規登録」からやり直してください。");
        } else if (e.code === 'auth/email-already-in-use') {
          alert("このメールアドレスは既に登録されています。「ログイン」をお試しください。");
        } else if (e.code === 'auth/weak-password') {
          alert("パスワードは6文字以上で入力してください。");
        } else {
          alert("認証エラー: " + e.message);
        }
      } finally {
        setLoading(false);
      }
      return;
    }
    
    if (step === 14) {
      handleCalculateAI();
      return;
    }
    
    setStep(step + 1);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      // スマホの場合はリダイレクト、PCの場合はポップアップを使用する
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        await signInWithRedirect(auth, provider);
        // リダイレクトされるためここは実行されません
      } else {
        const userCred = await signInWithPopup(auth, provider);
        handleLoginSuccess(userCred.user);
        setLoading(false);
      }
    } catch (e: any) {
      console.error(e);
      if (e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request') {
        alert("Googleログインエラー: " + e.message);
      }
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleAreaToggle = (area: string) => {
    if (area === '全身') {
      if (targetAreas.includes('全身')) {
        setTargetAreas([]);
      } else {
        setTargetAreas(['全身', '腕', '胸部', '背筋', '腹筋', '脚']);
      }
      return;
    }

    let newAreas = [...targetAreas];
    if (newAreas.includes(area)) {
      newAreas = newAreas.filter(a => a !== area && a !== '全身');
    } else {
      newAreas.push(area);
      if (newAreas.includes('腕') && newAreas.includes('胸部') && newAreas.includes('背筋') && newAreas.includes('腹筋') && newAreas.includes('脚')) {
        newAreas.push('全身');
      }
    }
    setTargetAreas(newAreas);
  };

  const handleExerciseTypeToggle = (type: string) => {
    if (type === 'なし') {
      if (exerciseTypes.includes('なし')) {
        setExerciseTypes([]);
      } else {
        setExerciseTypes(['なし']);
      }
      return;
    }

    let newTypes = [...exerciseTypes];
    newTypes = newTypes.filter(t => t !== 'なし');

    if (newTypes.includes(type)) {
      newTypes = newTypes.filter(t => t !== type);
    } else {
      newTypes.push(type);
    }
    setExerciseTypes(newTypes);
  };

  const handleIssueToggle = (issue: string) => {
    if (issue === 'なし') {
      if (physicalIssues.includes('なし')) {
        setPhysicalIssues([]);
      } else {
        setPhysicalIssues(['なし']);
      }
      return;
    }

    let newIssues = [...physicalIssues];
    newIssues = newIssues.filter(i => i !== 'なし');

    if (newIssues.includes(issue)) {
      newIssues = newIssues.filter(i => i !== issue);
    } else {
      newIssues.push(issue);
    }
    setPhysicalIssues(newIssues);
  };

  const handleCalculateAI = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/estimate-goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          gender,
          dob,
          height: Number(height),
          weight: Number(weight), 
          targetWeight: Number(targetWeight), 
          goal: goal || '減量', 
          targetAreas,
          environment,
          exerciseTypes,
          workoutLevel,
          physicalIssues,
          frequency: frequency || '週3回', 
          activityLevel: activityLevel || '座学メイン'
        })
      });
      const data = await res.json();
      if (data.ok) {
        setEstimatedResult(data.result);
        setStep(15);
      } else {
        alert("計算に失敗しました。" + (data.error || "") + "\n" + (data.raw || "") + "\n" + (data.detail || ""));
        setStep(15);
      }
    } catch (e) {
      console.error(e);
      setStep(15);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    let age = 20; 
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
      }
    }

    let finalHeight = heightUnit === 'ft' ? (Number(height) * 30.48) : Number(height);
    let finalWeight = weightUnit === 'lbs' ? (Number(weight) * 0.453592) : Number(weight);
    let finalTargetWeight = weightUnit === 'lbs' ? (Number(targetWeight) * 0.453592) : Number(targetWeight);

    let tCal = estimatedResult?.calories || (finalTargetWeight * 30);
    let tPro = estimatedResult?.protein || (finalWeight * 2);
    let tFat = estimatedResult?.fat || (tCal * 0.25 / 9);
    let tCarb = estimatedResult?.carb || ((tCal - (tPro*4) - (tFat*9))/4);

    const newProfile = {
      id: auth.currentUser?.uid || 'guest',
      email,
      name: name || auth.currentUser?.displayName || 'マッスル太郎',
      gender: gender || 'male',
      goal: goal || '減量',
      dob,
      age,
      height: Math.round(finalHeight),
      weight: Number(finalWeight.toFixed(1)),
      targetWeight: Number(finalTargetWeight.toFixed(1)),
      targetAreas,
      environment: environment || '家',
      exerciseTypes: exerciseTypes.length > 0 ? exerciseTypes : ['なし'],
      workoutLevel: workoutLevel || '簡単に始められる',
      physicalIssues,
      activityLevel: activityLevel || '座学メイン',
      activity: 'normal' as const, 
      frequency: frequency || '週3回',
      estimatedDays: estimatedResult?.estimatedDays,
      targetCalories: Math.round(tCal),
      targetProtein: Math.round(tPro),
      targetFat: Math.round(tFat),
      targetCarb: Math.round(tCarb),
      trainerName: '筋にくん'
    };

    setUserProfile(newProfile);
    localStorage.setItem('kinnikun_profile', JSON.stringify(newProfile));
    sessionStorage.setItem('open_welcome_workout', 'true');
    setActiveTab('workout');
  };

  const handleCardKeyDown = (e: React.KeyboardEvent<HTMLElement>, onClick: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      const next = e.currentTarget.nextElementSibling;
      if (next instanceof HTMLElement) next.focus();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = e.currentTarget.previousElementSibling;
      if (prev instanceof HTMLElement) prev.focus();
    }
  };

  const renderWizardHeader = (title: string, currentStep: number) => {
    const normalizedStep = currentStep - 1;
    
    return (
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', position: 'relative', paddingTop: '5px' }}>
        <button onClick={handleBack} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', padding: '10px', color: '#1e1e24' }}>
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '0.85rem', color: '#1a73e8', fontWeight: 'bold', marginBottom: '8px' }}>
            {title}
          </div>
          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', width: '200px', margin: '0 auto' }}>
            {[...Array(TOTAL_WIZARD_STEPS)].map((_, i) => (
              <div key={i} style={{ flex: 1, height: '3px', background: i < normalizedStep ? '#1a73e8' : '#e9ecef', borderRadius: '3px' }}></div>
            ))}
          </div>
        </div>
        <div style={{ width: '40px' }}></div>
      </div>
    );
  };

  const renderOptionCard = (label: string, icon: string, selected: boolean, onClick: () => void) => (
    <div 
      className="option-card"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => handleCardKeyDown(e, onClick)}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '14px 20px',
        background: selected ? 'rgba(26, 115, 232, 0.05)' : '#ffffff',
        border: `2px solid ${selected ? '#1a73e8' : '#f4f6fb'}`,
        borderRadius: '16px',
        cursor: 'pointer',
        boxShadow: selected ? '0 4px 12px rgba(26, 115, 232, 0.1)' : '0 4px 12px rgba(0,0,0,0.03)',
        transition: 'all 0.2s ease',
        boxSizing: 'border-box',
        marginBottom: '10px'
      }}
    >
      <div style={{ width: '35px', height: '35px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: '15px', overflow: 'hidden' }}>
        {icon.startsWith('/') ? (
          <img src={icon} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.5)', filter: selected ? 'none' : 'grayscale(100%)', opacity: selected ? 1 : 0.6 }} />
        ) : (
          <i className={icon} style={{ fontSize: '1.5rem', color: selected ? '#1a73e8' : '#adb5bd' }}></i>
        )}
      </div>
      <div style={{ flex: 1, fontSize: '1.1rem', fontWeight: selected ? 'bold' : 'normal', color: selected ? '#1a73e8' : '#1e1e24', display: 'flex', alignItems: 'center' }}>
        {label}
      </div>
    </div>
  );

  return (
    <div className="login-overlay light-theme" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, overflowY: 'auto', padding: '0', background: '#fcfcfd', color: '#212529', display: 'flex', flexDirection: 'column' }}>
      
      {/* STEP 1: Firebase Auth */}
      {step === 1 && (
        <div className="login-container" style={{ maxWidth: '400px', margin: 'auto', padding: '40px 20px', width: '100%' }}>
          <div className="login-logo" style={{ marginBottom: '30px', textAlign: 'center' }}>
            <i className="fa-solid fa-dumbbell" style={{ fontSize: '3rem', color: '#1a73e8', marginBottom: '10px' }}></i>
            <h1 style={{ fontSize: '2.2rem', margin: '0', fontWeight: 'bold' }}>筋にくん</h1>
            <p style={{ color: '#495057', fontSize: '0.9rem', marginTop: '5px' }}>あなた専用のAIパーソナルトレーナー</p>
          </div>

          <div className="animate-fade-in">
            <button type="button" className="btn btn-block" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '12px', marginBottom: '20px', background: '#ffffff', color: '#333', border: '1px solid #ddd', borderRadius: '24px', fontWeight: 'bold' }} onClick={handleGoogleLogin} disabled={loading}>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '20px' }} />
              Googleで{isLoginMode ? 'ログイン' : '登録'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: '#adb5bd', fontSize: '0.9rem' }}>
              <div style={{ flex: 1, height: '1px', background: '#e9ecef' }}></div>
              <div style={{ padding: '0 10px' }}>または</div>
              <div style={{ flex: 1, height: '1px', background: '#e9ecef' }}></div>
            </div>

            <div className="form-group" style={{ marginBottom: '15px' }}>
              <input type="email" placeholder="メールアドレス" value={email} onChange={e => setEmail(e.target.value)} style={{ background: '#f8f9fa', border: '1px solid #ced4da', borderRadius: '12px', padding: '14px', width: '100%' }} />
            </div>
            
            <div className="form-group" style={{ position: 'relative', marginBottom: '15px' }}>
              <input type={showPassword ? "text" : "password"} placeholder="パスワード (6文字以上)" value={password} onChange={e => setPassword(e.target.value)} style={{ background: '#f8f9fa', border: '1px solid #ced4da', borderRadius: '12px', padding: '14px', width: '100%' }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#adb5bd', cursor: 'pointer' }}>
                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>

            {!isLoginMode && (
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <input type="text" placeholder="お名前（ニックネーム）" value={name} onChange={e => setName(e.target.value)} style={{ background: '#f8f9fa', border: '1px solid #ced4da', borderRadius: '12px', padding: '14px', width: '100%' }} />
              </div>
            )}
            
            <button type="button" className="btn btn-block" style={{ marginTop: '10px', padding: '14px', background: '#1a73e8', color: '#fff', borderRadius: '24px', fontWeight: 'bold', border: 'none' }} onClick={handleNext} disabled={loading}>
              {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : (isLoginMode ? 'ログイン' : '次へ')}
            </button>

            <div style={{ textAlign: 'center', marginTop: '25px', fontSize: '0.9rem', color: '#495057' }}>
              {isLoginMode ? (
                <span>アカウントをお持ちでない方は <a href="#" onClick={(e) => { e.preventDefault(); setIsLoginMode(false); }} style={{ color: '#1a73e8', fontWeight: 'bold', textDecoration: 'none' }}>新規登録</a></span>
              ) : (
                <span>既にアカウントをお持ちの方は <a href="#" onClick={(e) => { e.preventDefault(); setIsLoginMode(true); }} style={{ color: '#1a73e8', fontWeight: 'bold', textDecoration: 'none' }}>ログイン</a></span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Gender */}
      {step === 2 && (
        <div style={{ flex: '1 0 auto', maxWidth: '600px', margin: '0 auto', padding: '10px 20px 20px', width: '100%', display: 'flex', flexDirection: 'column' }}>
          {renderWizardHeader("01 目標とターゲット部位", 2)}
          
          <div style={{ flex: 1 }}>
            <h2 style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '5px' }}>あなたの性別は？</h2>
            <p style={{ textAlign: 'center', color: '#495057', marginBottom: '30px' }}>あなたについて教えてください</p>
            
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
              {['male', 'female'].map((g) => {
                const isSelected = gender === g;
                return (
                  <div key={g} 
                    className="option-card"
                    tabIndex={0}
                    onClick={() => setGender(g as 'male'|'female')}
                    onKeyDown={(e) => handleCardKeyDown(e, () => setGender(g as 'male'|'female'))}
                    style={{ 
                      flex: 1, 
                      maxWidth: '220px', 
                      height: 'min(350px, 40vh)', 
                      borderRadius: '20px', 
                      background: isSelected ? 'rgba(26, 115, 232, 0.05)' : '#fff', 
                      border: `2px solid ${isSelected ? '#1a73e8' : '#e9ecef'}`, 
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      transition: 'all 0.2s',
                      transform: isSelected ? 'scale(1.02)' : 'scale(1)'
                    }}>
                    
                    <div style={{ flex: 1, background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#adb5bd' }}>
                      <i className={`fa-solid ${g === 'male' ? 'fa-person' : 'fa-person-dress'}`} style={{ fontSize: '4rem' }}></i>
                    </div>
                    
                    <div style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: isSelected ? '#1a73e8' : '#495057' }}>
                        {g === 'male' ? '男性' : '女性'}
                      </span>
                      {isSelected && <i className="fa-solid fa-circle-check" style={{ color: '#1a73e8', fontSize: '1.2rem' }}></i>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ textAlign: 'center', marginTop: '30px' }}>
              <button 
                type="button" 
                onClick={() => setGender('other')}
                style={{ background: gender === 'other' ? '#1a73e8' : '#f8f9fa', border: 'none', padding: '12px 30px', borderRadius: '24px', color: gender === 'other' ? '#fff' : '#495057', fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                その他 / 言いたくない
              </button>
            </div>
          </div>

          <div style={{ padding: '10px 0' }}>
            <button onClick={handleNext} disabled={!gender} style={{ width: '100%', padding: '14px', background: gender ? '#1a73e8' : '#dee2e6', color: gender ? '#fff' : '#adb5bd', borderRadius: '30px', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
              次へ
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Goal */}
      {step === 3 && (
        <div style={{ flex: '1 0 auto', maxWidth: '600px', margin: '0 auto', padding: '10px 20px 20px', width: '100%', display: 'flex', flexDirection: 'column' }}>
          {renderWizardHeader("01 目標とターゲット部位", 3)}
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '30px' }}>主な目標は何ですか？</h2>
            
            <div className="options-grid" style={{ flex: 1, justifyContent: 'flex-start', paddingTop: '10px', paddingBottom: '20px' }}>
              {renderOptionCard('体重を減らす', 'fa-solid fa-weight-scale', goal === '減量', () => setGoal('減量'))}
              {renderOptionCard('筋肉増強', 'fa-solid fa-dumbbell', goal === '増量', () => setGoal('増量'))}
              {renderOptionCard('健康維持', 'fa-solid fa-heart-pulse', goal === '現状維持', () => setGoal('現状維持'))}
            </div>
          </div>

          <div style={{ padding: '10px 0' }}>
            <button onClick={handleNext} disabled={!goal} style={{ width: '100%', padding: '14px', background: goal ? '#1a73e8' : '#dee2e6', color: goal ? '#fff' : '#adb5bd', borderRadius: '30px', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
              次へ
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Target Area */}
      {step === 4 && (
        <div style={{ flex: '1 0 auto', maxWidth: '600px', margin: '0 auto', padding: '10px 20px 20px', width: '100%', display: 'flex', flexDirection: 'column' }}>
          {renderWizardHeader("01 目標とターゲット部位", 4)}
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '30px' }}>ターゲットの部位はどこですか？</h2>
            
            <div className="options-grid" style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingTop: '10px', paddingBottom: '20px' }}>
              {renderOptionCard('全身', 'fa-solid fa-child', targetAreas.includes('全身'), () => handleAreaToggle('全身'))}
              {renderOptionCard('腕', 'fa-solid fa-hand-fist', targetAreas.includes('腕'), () => handleAreaToggle('腕'))}
              {renderOptionCard('胸部', 'fa-solid fa-child-reaching', targetAreas.includes('胸部'), () => handleAreaToggle('胸部'))}
              {renderOptionCard('背筋', '/images/tiger-back.png', targetAreas.includes('背筋'), () => handleAreaToggle('背筋'))}
              {renderOptionCard('腹筋', '/images/tiger-abs.png', targetAreas.includes('腹筋'), () => handleAreaToggle('腹筋'))}
              {renderOptionCard('脚', '/images/tiger-legs.png', targetAreas.includes('脚'), () => handleAreaToggle('脚'))}
            </div>
          </div>

          <div style={{ padding: '10px 0', marginTop: '10px' }}>
            <button onClick={handleNext} disabled={targetAreas.length === 0} style={{ width: '100%', padding: '14px', background: targetAreas.length > 0 ? '#1a73e8' : '#dee2e6', color: targetAreas.length > 0 ? '#fff' : '#adb5bd', borderRadius: '30px', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
              次へ
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Date of Birth */}
      {step === 5 && (
        <div style={{ flex: '1 0 auto', maxWidth: '600px', margin: '0 auto', padding: '10px 20px 20px', width: '100%', display: 'flex', flexDirection: 'column' }}>
          {renderWizardHeader("02 身体情報の設定", 5)}
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h2 style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '20px' }}>生まれた年は？</h2>
            <div style={{ background: '#f4f6fb', padding: '15px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '50px', width: '100%', maxWidth: '400px' }}>
              <span style={{ fontSize: '1.5rem' }}>📋</span>
              <p style={{ margin: 0, color: '#495057', fontSize: '0.95rem', lineHeight: 1.5 }}>あなたの年齢グループに最も適したワークアウトに調整しやすくなります。</p>
            </div>
            
            <div style={{ width: '100%', maxWidth: '400px' }}>
              <DateWheelPicker value={dob} onChange={setDob} mode="year" />
            </div>
          </div>

          <div style={{ padding: '10px 0' }}>
            <button onClick={handleNext} disabled={!dob} style={{ width: '100%', padding: '14px', background: dob ? '#1a73e8' : '#dee2e6', color: dob ? '#fff' : '#adb5bd', borderRadius: '30px', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
              次へ
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: Height */}
      {step === 6 && (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0', width: '100%', display: 'flex', flexDirection: 'column', height: '100dvh', background: '#fcfcfd' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', position: 'relative', borderBottom: '1px solid #e9ecef', flexShrink: 0 }}>
            <button onClick={handleBack} style={{ position: 'absolute', left: '20px', background: 'none', border: 'none', fontSize: '1.2rem', color: '#adb5bd', cursor: 'pointer' }}>
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0, color: '#495057' }}>身長を選択してください</h2>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}>
            {['130cm以下', ...Array.from({length: 69}, (_, i) => `${131 + i}cm`), '200cm以上'].map(h => {
              const numVal = h.replace(/[^0-9]/g, '');
              const isSelected = height === numVal;
              return (
                <div 
                  key={h}
                  id={isSelected ? "selected-height-option" : undefined}
                  onClick={() => { setHeight(numVal); setHeightUnit('cm'); }}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0', borderBottom: '1px solid #f1f3f5', cursor: 'pointer' }}
                >
                  <span style={{ fontSize: '1.1rem', color: '#495057' }}>{h}</span>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: isSelected ? '6px solid #1a73e8' : '2px solid #dee2e6', background: '#fff', transition: 'all 0.2s' }}></div>
                </div>
              );
            })}
          </div>

          <div style={{ padding: '20px', background: '#fff', borderTop: '1px solid #e9ecef', flexShrink: 0 }}>
            <button onClick={handleNext} disabled={!height} style={{ width: '100%', padding: '16px', background: height ? '#1a73e8' : '#dee2e6', color: height ? '#fff' : '#adb5bd', borderRadius: '30px', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>決定</button>
          </div>
        </div>
      )}

      {/* STEP 7: Current Weight */}
      {step === 7 && (
        <div style={{ flex: '1 0 auto', maxWidth: '600px', margin: '0 auto', padding: '10px 20px 20px', width: '100%', display: 'flex', flexDirection: 'column' }}>
          {renderWizardHeader("02 身体情報の設定", 7)}
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 style={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: 'bold', marginBottom: '10px' }}>現在の体重を入力してください。</h2>
            
            <div style={{ display: 'flex', border: '1px solid #1a73e8', borderRadius: '30px', overflow: 'hidden', marginBottom: '10px' }}>
              <div 
                onClick={() => setWeightUnit('kg')}
                style={{ padding: '8px 24px', fontWeight: 'bold', cursor: 'pointer', background: weightUnit === 'kg' ? '#1a73e8' : '#fff', color: weightUnit === 'kg' ? '#fff' : '#1e1e24' }}>
                kg
              </div>
              <div 
                onClick={() => setWeightUnit('lbs')}
                style={{ padding: '8px 24px', fontWeight: 'bold', cursor: 'pointer', background: weightUnit === 'lbs' ? '#1a73e8' : '#fff', color: weightUnit === 'lbs' ? '#fff' : '#1e1e24' }}>
                lbs
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '4rem', fontWeight: 'bold', color: '#1e1e24' }}>{weight}</span>
              <span style={{ fontSize: '1.1rem', color: '#495057', marginLeft: '5px' }}>{weightUnit}</span>
            </div>
            
            <div style={{ width: '100%', marginTop: '10px' }}>
              <RulerPicker 
                min={weightUnit === 'kg' ? 30 : 60} 
                max={weightUnit === 'kg' ? 150 : 330} 
                step={0.1}
                value={Number(weight)} 
                onChange={val => setWeight(String(val))} 
                orientation="horizontal"
              />
            </div>

            {/* BMI Display */}
            {height && (() => {
              const weightKg = weightUnit === 'lbs' ? Number(weight) * 0.453592 : Number(weight);
              const heightM = Number(height) / 100;
              const bmi = heightM > 0 ? (weightKg / (heightM * heightM)) : 0;
              const bmiFixed = bmi.toFixed(1);
              const bmiLabel = bmi < 18.5 ? '低体重' : bmi < 25 ? '標準' : bmi < 30 ? '過体重' : '肥満';
              const bmiColor = bmi < 18.5 ? '#3b82f6' : bmi < 25 ? '#22c55e' : bmi < 30 ? '#f59e0b' : '#ef4444';
              const bmiPercent = Math.min(Math.max(((bmi - 10) / (40 - 10)) * 100, 0), 100);
              return (
                <div style={{ width: '100%', marginTop: '16px', padding: '12px 16px', background: '#f8f9fa', borderRadius: '16px', border: '1px solid #e9ecef' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#8b8d9a' }}>あなたのBMI</span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: bmiColor }}>{bmiFixed}</span>
                      <span style={{ fontSize: '1rem', fontWeight: 'bold', color: bmiColor, background: bmiColor + '20', padding: '2px 10px', borderRadius: '20px' }}>{bmiLabel}</span>
                    </div>
                  </div>
                  <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: 'linear-gradient(to right, #3b82f6 0%, #22c55e 40%, #f59e0b 65%, #ef4444 100%)', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '-4px', left: `calc(${bmiPercent}% - 8px)`, width: '16px', height: '16px', borderRadius: '50%', background: '#fff', border: `3px solid ${bmiColor}`, boxShadow: '0 2px 6px rgba(0,0,0,0.2)', transition: 'left 0.3s' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.75rem', color: '#adb5bd' }}>
                    <span>低体重 〜18.5</span>
                    <span>標準 18.5〜24.9</span>
                    <span>肥満 25〜</span>
                  </div>
                </div>
              );
            })()}
          </div>

          <div style={{ padding: '10px 0' }}>
            <button onClick={handleNext} style={{ width: '100%', padding: '14px', background: '#1a73e8', color: '#fff', borderRadius: '30px', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
              次へ
            </button>
          </div>
        </div>
      )}

      {/* STEP 8: Target Weight */}
      {step === 8 && (
        <div style={{ flex: '1 0 auto', maxWidth: '600px', margin: '0 auto', padding: '10px 20px 20px', width: '100%', display: 'flex', flexDirection: 'column' }}>
          {renderWizardHeader("02 身体情報の設定", 8)}
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 style={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: 'bold', marginBottom: '15px' }}>目標体重を入力してください。</h2>
            
            <div style={{ display: 'flex', border: '1px solid #1a73e8', borderRadius: '30px', overflow: 'hidden', marginBottom: '15px' }}>
              <div 
                onClick={() => setWeightUnit('kg')}
                style={{ padding: '8px 24px', fontWeight: 'bold', cursor: 'pointer', background: weightUnit === 'kg' ? '#1a73e8' : '#fff', color: weightUnit === 'kg' ? '#fff' : '#1e1e24' }}>
                kg
              </div>
              <div 
                onClick={() => setWeightUnit('lbs')}
                style={{ padding: '8px 24px', fontWeight: 'bold', cursor: 'pointer', background: weightUnit === 'lbs' ? '#1a73e8' : '#fff', color: weightUnit === 'lbs' ? '#fff' : '#1e1e24' }}>
                lbs
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
              <span style={{ fontSize: '4rem', fontWeight: 'bold', color: '#1e1e24' }}>{targetWeight}</span>
              <span style={{ fontSize: '1.1rem', color: '#495057', marginLeft: '5px' }}>{weightUnit}</span>
            </div>
            
            <div style={{ width: '100%', marginTop: '15px' }}>
              <RulerPicker 
                min={weightUnit === 'kg' ? 30 : 60} 
                max={weightUnit === 'kg' ? 150 : 330} 
                step={0.1}
                value={Number(targetWeight)} 
                onChange={val => setTargetWeight(String(val))} 
                orientation="horizontal"
              />
            </div>
          </div>

          <div style={{ padding: '10px 0' }}>
            <button onClick={handleNext} style={{ width: '100%', padding: '14px', background: '#1a73e8', color: '#fff', borderRadius: '30px', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
              次へ
            </button>
          </div>
        </div>
      )}

      {/* STEP 9: Environment */}
      {step === 9 && (
        <div style={{ flex: '1 0 auto', maxWidth: '600px', margin: '0 auto', padding: '10px 20px 20px', width: '100%', display: 'flex', flexDirection: 'column' }}>
          {renderWizardHeader("03 トレーニング環境", 9)}
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: 'bold', marginBottom: '30px' }}>どこでトレーニングしますか？</h2>
            
            <div className="options-grid" style={{ flex: 1, justifyContent: 'flex-start', paddingTop: '10px', paddingBottom: '20px' }}>
              {renderOptionCard('家', 'fa-solid fa-house', environment === '家', () => setEnvironment('家'))}
              {renderOptionCard('ジム', 'fa-solid fa-dumbbell', environment === 'ジム', () => setEnvironment('ジム'))}
              {renderOptionCard('どの場所でもOK', 'fa-solid fa-earth-americas', environment === 'どの場所でもOK', () => setEnvironment('どの場所でもOK'))}
            </div>
          </div>

          <div style={{ padding: '10px 0' }}>
            <button onClick={handleNext} disabled={!environment} style={{ width: '100%', padding: '14px', background: environment ? '#1a73e8' : '#dee2e6', color: environment ? '#fff' : '#adb5bd', borderRadius: '30px', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
              次へ
            </button>
          </div>
        </div>
      )}

      {/* STEP 10: Exercise Limitations */}
      {step === 10 && (
        <div style={{ flex: '1 0 auto', maxWidth: '600px', margin: '0 auto', padding: '10px 20px 20px', width: '100%', display: 'flex', flexDirection: 'column' }}>
          {renderWizardHeader("03 トレーニング環境", 10)}
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: 'bold', marginBottom: '30px' }}>運動の種類の制限はありますか？</h2>
            
            <div className="options-grid" style={{ flex: 1, justifyContent: 'flex-start', paddingTop: '10px', paddingBottom: '20px' }}>
              {renderOptionCard('なし（何でもできる）', 'fa-solid fa-check-double', exerciseTypes.includes('なし'), () => handleExerciseTypeToggle('なし'))}
              {renderOptionCard('器具無し（自重のみ）', 'fa-solid fa-hand-fist', exerciseTypes.includes('器具無し'), () => handleExerciseTypeToggle('器具無し'))}
              {renderOptionCard('ジャンプ無し（騒音配慮）', 'fa-solid fa-shoe-prints', exerciseTypes.includes('ジャンプ無し'), () => handleExerciseTypeToggle('ジャンプ無し'))}
              {renderOptionCard('寝たままの運動（負担軽減）', 'fa-solid fa-bed', exerciseTypes.includes('寝たままの運動'), () => handleExerciseTypeToggle('寝たままの運動'))}
            </div>
          </div>

          <div style={{ padding: '10px 0' }}>
            <button onClick={handleNext} disabled={exerciseTypes.length === 0} style={{ width: '100%', padding: '14px', background: exerciseTypes.length > 0 ? '#1a73e8' : '#dee2e6', color: exerciseTypes.length > 0 ? '#fff' : '#adb5bd', borderRadius: '30px', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
              次へ
            </button>
          </div>
        </div>
      )}

      {/* STEP 11: Workout Level */}
      {step === 11 && (
        <div style={{ flex: '1 0 auto', maxWidth: '600px', margin: '0 auto', padding: '10px 20px 20px', width: '100%', display: 'flex', flexDirection: 'column' }}>
          {renderWizardHeader("03 フィットネスレベル評価", 11)}
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: 'bold', marginBottom: '30px' }}>ご希望のワークアウトレベルを選択してください</h2>
            
            <div className="options-grid" style={{ flex: 1, justifyContent: 'flex-start', paddingTop: '10px', paddingBottom: '20px' }}>
              {renderOptionCard('簡単に始められる', 'fa-solid fa-hand-peace', workoutLevel === '簡単に始められる', () => setWorkoutLevel('簡単に始められる'))}
              {renderOptionCard('軽い汗をかく', 'fa-solid fa-droplet', workoutLevel === '軽い汗をかく', () => setWorkoutLevel('軽い汗をかく'))}
              {renderOptionCard('少しやりごたえがある', 'fa-solid fa-fire', workoutLevel === '少しやりごたえがある', () => setWorkoutLevel('少しやりごたえがある'))}
            </div>
          </div>

          <div style={{ padding: '10px 0' }}>
            <button onClick={handleNext} disabled={!workoutLevel} style={{ width: '100%', padding: '14px', background: workoutLevel ? '#1a73e8' : '#dee2e6', color: workoutLevel ? '#fff' : '#adb5bd', borderRadius: '30px', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
              次へ
            </button>
          </div>
        </div>
      )}

      {/* STEP 12: Physical Issues */}
      {step === 12 && (
        <div style={{ flex: '1 0 auto', maxWidth: '600px', margin: '0 auto', padding: '10px 20px 20px', width: '100%', display: 'flex', flexDirection: 'column' }}>
          {renderWizardHeader("04 ライフスタイル", 12)}
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: 'bold', marginBottom: '30px' }}>体に不快感や懸念はありますか？</h2>
            <div style={{ background: '#f4f6fb', padding: '15px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px', width: '100%' }}>
              <span style={{ fontSize: '1.5rem' }}>🧰</span>
              <p style={{ margin: 0, color: '#495057', fontSize: '0.95rem', lineHeight: 1.5 }}>これにより、特別な注意が必要な部位に焦点を当て、あなたのフィットネスの旅をカスタマイズします。</p>
            </div>
            
            <div className="options-grid" style={{ flex: 1, justifyContent: 'flex-start', paddingTop: '10px', paddingBottom: '20px' }}>
              {['なし', '膝', '腰', '手首', '首', '肩'].map(issue => (
                <div 
                  key={issue}
                  className="option-card"
                  tabIndex={0}
                  onClick={() => handleIssueToggle(issue)}
                  onKeyDown={(e) => handleCardKeyDown(e, () => handleIssueToggle(issue))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '20px 25px',
                    background: physicalIssues.includes(issue) ? (issue === 'なし' ? '#1a73e8' : 'rgba(224, 68, 32, 0.05)') : '#ffffff',
                    border: `2px solid ${physicalIssues.includes(issue) ? (issue === 'なし' ? '#1a73e8' : '#e04420') : '#f4f6fb'}`,
                    borderRadius: '16px',
                    cursor: 'pointer',
                    boxShadow: physicalIssues.includes(issue) ? (issue === 'なし' ? '0 4px 12px rgba(26, 115, 232, 0.2)' : '0 4px 12px rgba(224, 68, 32, 0.1)') : '0 4px 12px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <i className={issue === 'なし' ? 'fa-solid fa-ban' : 'fa-solid fa-notes-medical'} style={{ fontSize: '1.5rem', color: physicalIssues.includes(issue) ? (issue === 'なし' ? '#ffffff' : '#e04420') : '#adb5bd', width: '40px' }}></i>
                  <div style={{ fontSize: '1.1rem', fontWeight: physicalIssues.includes(issue) ? 'bold' : 'normal', color: physicalIssues.includes(issue) ? (issue === 'なし' ? '#ffffff' : '#e04420') : '#1e1e24' }}>
                    {issue}
                  </div>
                  {physicalIssues.includes(issue) && issue === 'なし' && (
                     <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: '50%', width: '24px', height: '24px' }}>
                       <i className="fa-solid fa-check" style={{ color: '#1a73e8', fontSize: '1rem' }}></i>
                     </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: '10px 0' }}>
            <button onClick={handleNext} disabled={physicalIssues.length === 0} style={{ width: '100%', padding: '14px', background: physicalIssues.length > 0 ? '#1a73e8' : '#dee2e6', color: physicalIssues.length > 0 ? '#fff' : '#adb5bd', borderRadius: '30px', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
              次へ
            </button>
          </div>
        </div>
      )}

      {/* STEP 13: Activity Level */}
      {step === 13 && (
        <div style={{ flex: '1 0 auto', maxWidth: '600px', margin: '0 auto', padding: '10px 20px 20px', width: '100%', display: 'flex', flexDirection: 'column' }}>
          {renderWizardHeader("04 ライフスタイル", 13)}
          
          <div style={{ flex: 1 }}>
            <h2 style={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: 'bold', marginBottom: '15px' }}>あなたの身体活動レベルは？</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <ActivityLevelSlider value={activityLevel} onChange={setActivityLevel} />
            </div>
          </div>

          <div style={{ padding: '10px 0' }}>
            <button onClick={handleNext} disabled={!activityLevel} style={{ width: '100%', padding: '14px', background: activityLevel ? '#1a73e8' : '#dee2e6', color: activityLevel ? '#fff' : '#adb5bd', borderRadius: '30px', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
              次へ
            </button>
          </div>
        </div>
      )}

      {/* STEP 14: Frequency */}
      {step === 14 && (
        <div style={{ flex: '1 0 auto', maxWidth: '600px', margin: '0 auto', padding: '10px 20px 20px', width: '100%', display: 'flex', flexDirection: 'column' }}>
          {renderWizardHeader("04 ライフスタイル", 14)}
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: 'bold', marginBottom: '30px' }}>目標とする運動頻度（1週間）</h2>
            
            <div className="options-grid" style={{ flex: 1, justifyContent: 'flex-start', paddingTop: '10px', paddingBottom: '20px' }}>
              {renderOptionCard('週1回 (無理なく)', 'fa-solid fa-calendar-day', frequency === '週1回', () => setFrequency('週1回'))}
              {renderOptionCard('週2〜3回 (おすすめ！)', 'fa-solid fa-calendar-days', frequency === '週3回', () => setFrequency('週3回'))}
              {renderOptionCard('週4〜5回', 'fa-solid fa-calendar-week', frequency === '週5回', () => setFrequency('週5回'))}
              {renderOptionCard('週6〜7回 (毎日！)', 'fa-solid fa-calendar-check', frequency === '週7回', () => setFrequency('週7回'))}
            </div>
          </div>

          <div style={{ padding: '10px 0' }}>
            <button type="button" onClick={handleCalculateAI} disabled={!frequency || loading} style={{ width: '100%', padding: '14px', background: frequency ? '#1a73e8' : '#dee2e6', color: frequency ? '#fff' : '#adb5bd', borderRadius: '30px', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-robot"></i>}
              {loading ? 'AIで目標を計算中...' : 'AIで目標を計算して完了'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 15: AI Calculation Result & Finish */}
      {step === 15 && (
        <div style={{ flex: '1 0 auto', maxWidth: '600px', margin: '0 auto', padding: '20px', width: '100%', display: 'flex', flexDirection: 'column', minHeight: '100%', justifyContent: 'center' }}>
          <div className="animate-fade-in" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', color: '#1a73e8', marginBottom: '10px' }}>
              <i className="fa-solid fa-bullseye"></i>
            </div>
            <h2 style={{ marginBottom: '10px', fontSize: '1.4rem', fontWeight: 'bold' }}>AI分析完了！</h2>
            
            <div style={{ background: '#f8f9fa', padding: '15px 20px', borderRadius: '24px', border: '1px solid #e9ecef', marginBottom: '15px' }}>
              <p style={{ color: '#495057', marginBottom: '5px', fontSize: '1rem' }}>目標（{targetWeight}{weightUnit}）到達までの予測日数</p>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#1a73e8', marginBottom: '15px' }}>
                約 {estimatedResult?.estimatedDays || '?'} 日
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                <div style={{ background: '#fff', padding: '15px', borderRadius: '16px', minWidth: '120px', border: '1px solid #e9ecef', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
                  <div style={{ fontSize: '0.9rem', color: '#8b8d9a', marginBottom: '5px' }}>目標カロリー</div>
                  <div style={{ fontWeight: 'bold', color: '#1e1e24', fontSize: '1.2rem' }}>{estimatedResult?.calories || '?'} kcal</div>
                </div>
                <div style={{ background: '#fff', padding: '15px', borderRadius: '16px', minWidth: '120px', border: '1px solid #e9ecef', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
                  <div style={{ fontSize: '0.9rem', color: '#8b8d9a', marginBottom: '5px' }}>タンパク質</div>
                  <div style={{ fontWeight: 'bold', color: '#1e1e24', fontSize: '1.2rem' }}>{estimatedResult?.protein || '?'} g</div>
                </div>
              </div>
            </div>

            {estimatedResult?.samplePlan && (() => {
              const levelStr = (workoutLevel || '').toLowerCase();
              let levelVal = '中級';
              let timeVal = '約8分';
              let bgVal = 'linear-gradient(135deg, #8d6e63 0%, #5d4037 100%)';
              
              if (levelStr.includes('簡単') || levelStr.includes('初級') || levelStr.includes('簡単に始められる')) {
                levelVal = '初級';
                timeVal = '約6分';
                bgVal = 'linear-gradient(135deg, #1a73e8 0%, #0052cc 100%)';
              } else if (levelStr.includes('やりごたえ') || levelStr.includes('上級') || levelStr.includes('少しやりごたえがある')) {
                levelVal = '上級';
                timeVal = '約12分';
                bgVal = 'linear-gradient(135deg, #9c27b0 0%, #6a1b9a 100%)';
              }
              
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', marginBottom: '15px', width: '100%', textAlign: 'left' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1a73e8', alignSelf: 'flex-start' }}>
                    <i className="fa-solid fa-bolt"></i> おすすめプラン
                  </h3>
                  <div className="challenge-card animate-fade-in" style={{ background: bgVal, width: '100%', margin: 0, padding: '16px', borderRadius: '24px', color: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                    <span className="challenge-badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', display: 'inline-block', marginBottom: '10px' }}>あなたにおすすめ</span>
                    <h4 className="challenge-title" style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: '0 0 15px 0' }}>全身脂肪燃焼 ({levelVal})</h4>
                    
                    <div className="challenge-stats" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                      <div className="challenge-stat" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="challenge-stat-icon" style={{ fontSize: '1.4rem', opacity: 0.8 }}><i className="fa-solid fa-calendar-days"></i></div>
                        <div className="challenge-stat-text">
                          <span className="challenge-stat-val" style={{ display: 'block', fontWeight: 'bold', fontSize: '1rem' }}>{timeVal}</span>
                          <span className="challenge-stat-label" style={{ display: 'block', fontSize: '0.75rem', opacity: 0.7 }}>毎日の時間</span>
                        </div>
                      </div>
                      
                      <div className="challenge-stat" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="challenge-stat-icon" style={{ fontSize: '1.4rem', opacity: 0.8 }}><i className="fa-solid fa-chart-simple"></i></div>
                        <div className="challenge-stat-text">
                          <span className="challenge-stat-val" style={{ display: 'block', fontWeight: 'bold', fontSize: '1rem' }}>{levelVal}</span>
                          <span className="challenge-stat-label" style={{ display: 'block', fontSize: '0.75rem', opacity: 0.7 }}>難易度</span>
                        </div>
                      </div>
                      
                      <div className="challenge-stat" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="challenge-stat-icon" style={{ fontSize: '1.4rem', opacity: 0.8 }}><i className="fa-solid fa-bullseye"></i></div>
                        <div className="challenge-stat-text">
                          <span className="challenge-stat-val" style={{ display: 'block', fontWeight: 'bold', fontSize: '1rem' }}>全身</span>
                          <span className="challenge-stat-label" style={{ display: 'block', fontSize: '0.75rem', opacity: 0.7 }}>ターゲット部位</span>
                        </div>
                      </div>
                      
                      <div className="challenge-stat" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="challenge-stat-icon" style={{ fontSize: '1.4rem', opacity: 0.8 }}><i className="fa-solid fa-check"></i></div>
                        <div className="challenge-stat-text">
                          <span className="challenge-stat-val" style={{ display: 'block', fontWeight: 'bold', fontSize: '1rem' }}>器具なし</span>
                          <span className="challenge-stat-label" style={{ display: 'block', fontSize: '0.75rem', opacity: 0.7 }}>器具</span>
                        </div>
                      </div>
                    </div>
                    
                    <button className="challenge-btn" onClick={handleComplete} style={{ width: '100%', padding: '14px', background: '#fff', color: '#1a73e8', border: 'none', borderRadius: '30px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
                      トレーニングを開始する <i className="fa-solid fa-arrow-right"></i>
                    </button>
                  </div>
                </div>
              );
            })()}

            <p style={{ fontSize: '0.85rem', color: '#5a5d72', marginBottom: '15px', lineHeight: '1.5' }}>
              入力されたデータに基づいて、最適な推奨値を設定しました。<br/>
              後から変更することも可能です！
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
