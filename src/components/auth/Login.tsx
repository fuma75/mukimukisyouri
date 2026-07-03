'use client';
// アンチグラビティでのコミットテスト用コメントです
// コミットテスト用に追加したコメントです（ユーザー操作用）
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
  const [targetAreas, setTargetAreas] = useState<string[]>(['全身', '腕', '胸部', '背筋', '腹筋', '脚']);
  
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

      const selectedCard = document.querySelector('.option-card[style*="rgba(245, 158, 11, 0.05)"]');
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
        const cleanEmail = email.trim();
        if (isLoginMode) {
          userCred = await signInWithEmailAndPassword(auth, cleanEmail, password);
        } else {
          userCred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
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
      provider.setCustomParameters({ prompt: 'select_account' });
      // まずは全環境で Popup を試す（in-appブラウザのredirect session lossを防ぐため）
      try {
        const userCred = await signInWithPopup(auth, provider);
        handleLoginSuccess(userCred.user);
        setLoading(false);
      } catch (popupError: any) {
        if (popupError.code === 'auth/popup-blocked' || popupError.code === 'auth/popup-closed-by-user' || popupError.code === 'auth/cross-origin-opener-policy-failed') {
          // Popupがブロックされた場合は Redirect にフォールバックする
          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
          if (isMobile) {
            try {
              await signInWithRedirect(auth, provider);
            } catch (redirectError: any) {
              alert("ログインエラー: このブラウザ（LINEやYay!等）では制限によりGoogleログインが失敗する場合があります。右上のメニューから「Safariで開く」または「ブラウザで開く」をお試しください。");
              setLoading(false);
            }
          } else {
            setLoading(false);
          }
        } else {
          throw popupError;
        }
      }
    } catch (e: any) {
      console.error(e);
      if (e.code === 'auth/invalid-email') {
         alert("メールアドレスの形式が正しくありません。");
      } else if (e.code === 'auth/operation-not-supported-in-this-environment') {
         alert("このブラウザではGoogleログインが利用できません。標準のブラウザ（SafariやChrome）でお試しください。");
      } else if (e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request') {
        alert("Googleログインエラー: " + (e.message || e.code));
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

  const handleComplete = (targetTab: string = 'workout') => {
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
      trainerName: '筋虎'
    };

    try {
      localStorage.setItem('kinnikun_profile', JSON.stringify(newProfile));
      if (targetTab === 'workout') {
        sessionStorage.setItem('open_welcome_workout', 'true');
      }
    } catch (e) {
      console.warn("Storage exception", e);
    }
    
    setUserProfile(newProfile);
    setActiveTab(targetTab);
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
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', position: 'relative', paddingTop: '5px' }}>
        <button onClick={handleBack} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', padding: '10px', color: '#DCA038', letterSpacing: '0.05em' }}>
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 'bold', marginBottom: '8px' }}>
            {title}
          </div>
          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', width: '200px', margin: '0 auto' }}>
            {[...Array(TOTAL_WIZARD_STEPS)].map((_, i) => (
              <div key={i} style={{ flex: 1, height: '3px', background: i < normalizedStep ? 'var(--primary)' : '#e9ecef', borderRadius: '3px' }}></div>
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
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 10px',
        background: selected ? 'rgba(245, 158, 11, 0.05)' : '#ffffff',
        border: `2px solid ${selected ? 'var(--primary)' : '#f4f6fb'}`,
        borderRadius: '16px',
        cursor: 'pointer',
        boxShadow: selected ? '0 4px 12px rgba(245, 158, 11, 0.1)' : '0 4px 12px rgba(0,0,0,0.03)',
        transition: 'all 0.2s ease',
        boxSizing: 'border-box',
        marginBottom: '10px',
        gap: '12px'
      }}
    >
      <div style={{ width: '45px', height: '45px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
        {icon.startsWith('/') ? (
          <img src={icon} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.5)', filter: selected ? 'none' : 'grayscale(100%)', opacity: selected ? 1 : 0.6 }} />
        ) : (
          <i className={icon} style={{ fontSize: '2rem', color: selected ? 'var(--primary)' : '#adb5bd' }}></i>
        )}
      </div>
      <div style={{ fontSize: '1.15rem', fontWeight: selected ? 'bold' : 'bold', color: selected ? 'var(--primary)' : '#1e1e24', textAlign: 'center' }}>
        {label}
      </div>
    </div>
  );

  return (
    <div className="login-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, overflowY: 'auto', padding: '0', background: '#08080A', color: '#FDF0A6', display: 'flex', flexDirection: 'column' }}>
      
      {/* STEP 1: Firebase Auth */}
      {step === 1 && (
        <div className="login-container" style={{ maxWidth: '400px', margin: 'auto', padding: '20px', width: '100%' }}>
          <div className="login-logo" style={{ marginBottom: '30px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ padding: '3px', background: 'linear-gradient(180deg, #FDF0A6, #DCA038)', borderRadius: '50%', marginBottom: '15px' }}>
              <img src="/images/logo.png" alt="筋虎" style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #000' }} />
            </div>
            <div className="logo-text-premium" style={{ fontSize: '42px', marginBottom: '10px' }}>筋虎</div>
            <div style={{ color: '#DCA038', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '0.1em' }}>
              <span style={{ fontStyle: 'italic', color: '#9C6615', fontWeight: 'bold' }}>///</span>
              あなた専用の虎コーチ
              <span style={{ fontStyle: 'italic', color: '#9C6615', fontWeight: 'bold' }}>///</span>
            </div>
          </div>

          <div className="animate-fade-in">
            <form autoComplete="off" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#DCA038', letterSpacing: '0.05em', marginBottom: '5px', textAlign: 'left'}}>{isLoginMode ? 'メールアドレス' : 'メールアドレス'}</label>
                <input type="email" name="email" autoComplete="off" placeholder="メールアドレスを入力" value={email} onChange={e => setEmail(e.target.value)} style={{ background: '#0F0F11', border: '1px solid rgba(220, 160, 56, 0.4)', borderRadius: '8px', padding: '14px', width: '100%', color: '#fff', outline: 'none', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)' }} />
              </div>
              
              <div className="form-group" style={{ position: 'relative', marginBottom: '12px' }}>
                <label style={{display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#DCA038', letterSpacing: '0.05em', marginBottom: '5px', textAlign: 'left'}}>パスワード</label>
                <input type={showPassword ? "text" : "password"} name="password" autoComplete="new-password" placeholder="パスワードを入力" value={password} onChange={e => setPassword(e.target.value)} style={{ background: '#0F0F11', border: '1px solid rgba(220, 160, 56, 0.4)', borderRadius: '8px', padding: '14px', width: '100%', color: '#fff', outline: 'none', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '15px', top: '36px', background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
                  {showPassword ? '非表示' : '表示'}
                </button>
              </div>

              {!isLoginMode && (
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label style={{display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#DCA038', letterSpacing: '0.05em', marginBottom: '5px', textAlign: 'left'}}>ユーザー名</label>
                  <input type="text" name="nickname" autoComplete="off" placeholder="ユーザー名を入力" value={name} onChange={e => setName(e.target.value)} style={{ background: '#0F0F11', border: '1px solid rgba(220, 160, 56, 0.4)', borderRadius: '8px', padding: '14px', width: '100%', color: '#fff', outline: 'none', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)' }} />
                </div>
              )}

              {isLoginMode && (
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', fontSize: '0.85rem', color: '#DCA038', letterSpacing: '0.05em', fontWeight: 'bold' }}>
                  <input type="checkbox" id="keepLoggedIn" style={{ marginRight: '8px', width: '16px', height: '16px', accentColor: 'var(--primary)' }} defaultChecked />
                  <label htmlFor="keepLoggedIn">ログイン状態を保持</label>
                </div>
              )}
              
              <button type="submit" className="btn btn-block" style={{ marginTop: '10px', padding: '16px', background: 'linear-gradient(180deg, #FDF0A6 0%, #DCA038 45%, #9C6615 55%, #E8C162 100%)', color: '#000', borderRadius: '8px', fontWeight: 'bold', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', fontSize: '1.1rem', letterSpacing: '0.1em' }} disabled={loading}>
                {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : (isLoginMode ? 'ログイン' : '新規登録')}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', margin: '15px 0', color: '#DCA038', fontSize: '0.85rem' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(220, 160, 56, 0.3)' }}></div>
              <div style={{ padding: '0 10px' }}>または</div>
              <div style={{ flex: 1, height: '1px', background: 'rgba(220, 160, 56, 0.3)' }}></div>
            </div>

            <button type="button" className="btn btn-block" style={{ padding: '14px', marginBottom: '12px', background: 'transparent', color: '#DCA038', border: '1px solid #DCA038', borderRadius: '8px', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', fontSize: '1rem' }} onClick={() => setIsLoginMode(!isLoginMode)}>
              {isLoginMode ? '新規登録' : 'ログイン画面へ戻る'}
            </button>

            <button type="button" className="btn btn-block" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '12px', background: '#ffffff', color: '#000', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.5)', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.9rem' }} onClick={handleGoogleLogin} disabled={loading}>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '18px' }} />
              Googleで{isLoginMode ? 'ログイン' : '登録'}
            </button>
            
          </div>
        </div>
      )}

      {/* STEP 2: Gender */}
      {step === 2 && (
        <div style={{ flex: '1 0 auto', maxWidth: '600px', margin: '0 auto', padding: '10px 15px 15px', width: '100%', display: 'flex', flexDirection: 'column' }}>
          {renderWizardHeader("01 目標とターゲット部位", 2)}
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: '10px' }}>
            <h2 className="logo-text-premium" style={{ textAlign: 'center', fontSize: 'clamp(1.3rem, 5vw, 1.6rem)', marginBottom: '15px' }}>あなたの性別は？</h2>
            <p style={{ textAlign: 'center', color: '#111827', marginBottom: '10px' }}>あなたについて教えてください</p>
            
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
                      height: 'min(240px, 35vh)', 
                      borderRadius: '20px', 
                      background: '#fff', 
                      border: `2px solid ${isSelected ? 'var(--primary)' : '#e9ecef'}`, 
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      transition: 'all 0.2s',
                      transform: isSelected ? 'scale(1.02)' : 'scale(1)'
                    }}>
                    
                    <div style={{ flex: 1, background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DCA038' }}>
                      <i className={`fa-solid ${g === 'male' ? 'fa-person' : 'fa-person-dress'}`} style={{ fontSize: '3rem' }}></i>
                    </div>
                    
                    <div style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: isSelected ? '#111827' : '#6c757d' }}>
                        {g === 'male' ? '男性' : '女性'}
                      </span>
                      {isSelected && <i className="fa-solid fa-circle-check" style={{ color: '#F59E0B', fontSize: '1.2rem' }}></i>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <button 
                type="button" 
                onClick={() => setGender('other')}
                style={{ background: gender === 'other' ? '#111827' : '#fff', border: '1px solid ' + (gender === 'other' ? '#111827' : '#ddd'), padding: '10px 24px', borderRadius: '24px', color: gender === 'other' ? '#fff' : '#111827', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                その他 / 言いたくない
              </button>
            </div>
          </div>

          <div style={{ padding: '10px 0' }}>
            <button onClick={handleNext} disabled={!gender} style={{ width: '100%', padding: '12px', background: gender ? 'linear-gradient(180deg, #FDF0A6 0%, #DCA038 45%, #9C6615 55%, #E8C162 100%)' : '#e9ecef', boxShadow: gender ? '0 4px 15px rgba(0,0,0,0.5)' : 'none', color: gender ? '#000' : '#adb5bd', letterSpacing: gender ? '0.1em' : 'normal', borderRadius: '30px', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
              次へ
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Goal */}
      {step === 3 && (
        <div style={{ flex: '1 0 auto', maxWidth: '600px', margin: '0 auto', padding: '10px 15px 15px', width: '100%', display: 'flex', flexDirection: 'column' }}>
          {renderWizardHeader("01 目標とターゲット部位", 3)}
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: '10px', justifyContent: 'center' }}>
            <h2 className="logo-text-premium" style={{ textAlign: 'center', fontSize: 'clamp(1.3rem, 5vw, 1.6rem)', marginBottom: '15px' }}>主な目標は何ですか？</h2>
            
            <div className="options-grid options-grid-3" style={{ flex: 1, justifyContent: 'flex-start', paddingTop: '10px', paddingBottom: '10px' }}>
              {renderOptionCard('体重を減らす', 'fa-solid fa-weight-scale', goal === '減量', () => setGoal('減量'))}
              {renderOptionCard('筋肉増強', 'fa-solid fa-dumbbell', goal === '増量', () => setGoal('増量'))}
              {renderOptionCard('健康維持', 'fa-solid fa-heart-pulse', goal === '現状維持', () => setGoal('現状維持'))}
            </div>
          </div>

          <div style={{ padding: '10px 0' }}>
            <button onClick={handleNext} disabled={!goal} style={{ width: '100%', padding: '12px', background: goal ? 'linear-gradient(180deg, #FDF0A6 0%, #DCA038 45%, #9C6615 55%, #E8C162 100%)' : '#e9ecef', boxShadow: goal ? '0 4px 15px rgba(0,0,0,0.5)' : 'none', color: goal ? '#000' : '#adb5bd', letterSpacing: goal ? '0.1em' : 'normal', borderRadius: '30px', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
              次へ
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Target Area */}
      {step === 4 && (
        <div style={{ flex: '1 0 auto', maxWidth: '600px', margin: '0 auto', padding: '10px 15px 15px', width: '100%', display: 'flex', flexDirection: 'column' }}>
          {renderWizardHeader("01 目標とターゲット部位", 4)}
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: '10px', justifyContent: 'center' }}>
            <h2 className="logo-text-premium" style={{ textAlign: 'center', fontSize: 'clamp(1.3rem, 5vw, 1.6rem)', marginBottom: '15px' }}>ターゲットの部位はどこですか？</h2>
            
            <div className="options-grid" style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingTop: '10px', paddingBottom: '10px' }}>
              {renderOptionCard('全身', 'fa-solid fa-child', targetAreas.includes('全身'), () => handleAreaToggle('全身'))}
              {renderOptionCard('腕', 'fa-solid fa-hand-fist', targetAreas.includes('腕'), () => handleAreaToggle('腕'))}
              {renderOptionCard('胸部', 'fa-solid fa-child-reaching', targetAreas.includes('胸部'), () => handleAreaToggle('胸部'))}
              {renderOptionCard('背筋', '/images/tiger-back.png', targetAreas.includes('背筋'), () => handleAreaToggle('背筋'))}
              {renderOptionCard('腹筋', '/images/tiger-abs.png', targetAreas.includes('腹筋'), () => handleAreaToggle('腹筋'))}
              {renderOptionCard('脚', '/images/tiger-legs.png', targetAreas.includes('脚'), () => handleAreaToggle('脚'))}
            </div>
          </div>

          <div style={{ padding: '10px 0', marginTop: '10px' }}>
            <button onClick={handleNext} disabled={targetAreas.length === 0} style={{ width: '100%', padding: '12px', background: targetAreas.length > 0 ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' : '#e9ecef', boxShadow: targetAreas.length > 0 ? '0 4px 15px rgba(217, 119, 6, 0.3)' : 'none', color: targetAreas.length > 0 ? '#fff' : '#adb5bd', borderRadius: '30px', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
              次へ
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Date of Birth */}
      {step === 5 && (
        <div style={{ flex: '1 0 auto', maxWidth: '600px', margin: '0 auto', padding: '10px 15px 15px', width: '100%', display: 'flex', flexDirection: 'column' }}>
          {renderWizardHeader("02 身体情報の設定", 5)}
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h2 className="logo-text-premium" style={{ textAlign: 'center', fontSize: 'clamp(1.3rem, 5vw, 1.6rem)', marginBottom: '15px' }}>生まれた年は？</h2>
            <div style={{ background: '#f4f6fb', padding: '15px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', width: '100%', maxWidth: '400px' }}>
              <i className="fa-solid fa-clipboard-list" style={{ fontSize: '1.5rem', color: 'var(--primary)' }}></i>
              <p style={{ margin: 0, color: '#111827', fontSize: '0.9rem', lineHeight: 1.5 }}>あなたの年齢グループに最も適したワークアウトに調整しやすくなります。</p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', marginBottom: '10px' }}>
              <input 
                type="number" 
                value={dob ? new Date(dob).getFullYear() : 2000} 
                onChange={(e) => {
                  const y = Number(e.target.value);
                  if (y > 1900 && y <= new Date().getFullYear()) {
                    setDob(`${y}-01-01`);
                  }
                }} 
                style={{ fontSize: '3.5rem', fontWeight: 'bold', color: '#DCA038', letterSpacing: '0.05em', background: 'transparent', border: 'none', borderBottom: '2px solid var(--primary)', width: '140px', textAlign: 'center', outline: 'none' }} 
              />
              <span style={{ fontSize: '1.5rem', color: '#111827', marginLeft: '5px' }}>年</span>
            </div>

            <div style={{ width: '100%', maxWidth: '400px' }}>
              <DateWheelPicker value={dob} onChange={setDob} mode="year" />
            </div>
          </div>

          <div style={{ padding: '10px 0' }}>
            <button onClick={handleNext} disabled={!dob} style={{ width: '100%', padding: '14px', background: dob ? 'linear-gradient(180deg, #FDF0A6 0%, #DCA038 45%, #9C6615 55%, #E8C162 100%)' : '#e9ecef', boxShadow: dob ? '0 4px 15px rgba(0,0,0,0.5)' : 'none', color: dob ? '#000' : '#adb5bd', letterSpacing: dob ? '0.1em' : 'normal', borderRadius: '30px', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
              次へ
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: Height */}
      {step === 6 && (
        <div style={{ flex: '1 0 auto', maxWidth: '600px', margin: '0 auto', padding: '10px 15px 15px', width: '100%', display: 'flex', flexDirection: 'column' }}>
          {renderWizardHeader("02 身体情報の設定", 6)}
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h2 className="logo-text-premium" style={{ textAlign: 'center', fontSize: 'clamp(1.3rem, 5vw, 1.6rem)', marginBottom: '15px' }}>身長を入力してください。</h2>

            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', marginBottom: '10px' }}>
              <input 
                type="number" 
                value={height} 
                onChange={(e) => { setHeight(e.target.value); setHeightUnit('cm'); }} 
                style={{ fontSize: '3rem', fontWeight: 'bold', color: '#DCA038', letterSpacing: '0.05em', background: 'transparent', border: 'none', borderBottom: '2px solid var(--primary)', width: '180px', textAlign: 'center', outline: 'none' }} 
              />
              <span style={{ fontSize: '1.5rem', color: '#111827', marginLeft: '5px' }}>cm</span>
            </div>
            
            <div style={{ width: '100%', marginTop: '0' }}>
              <RulerPicker 
                min={100} 
                max={220} 
                step={1}
                value={Number(height)} 
                onChange={val => { setHeight(String(val)); setHeightUnit('cm'); }} 
                orientation="horizontal"
              />
            </div>
          </div>

          <div style={{ padding: '10px 0' }}>
            <button onClick={handleNext} disabled={!height} style={{ width: '100%', padding: '14px', background: height ? 'linear-gradient(180deg, #FDF0A6 0%, #DCA038 45%, #9C6615 55%, #E8C162 100%)' : '#e9ecef', boxShadow: height ? '0 4px 15px rgba(0,0,0,0.5)' : 'none', color: height ? '#000' : '#adb5bd', letterSpacing: height ? '0.1em' : 'normal', borderRadius: '30px', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
              次へ
            </button>
          </div>
        </div>
      )}

      {/* STEP 7: Current Weight */}
      {step === 7 && (
        <div style={{ flex: '1 0 auto', maxWidth: '600px', margin: '0 auto', padding: '10px 15px 15px', width: '100%', display: 'flex', flexDirection: 'column' }}>
          {renderWizardHeader("02 身体情報の設定", 7)}
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h2 className="logo-text-premium" style={{ textAlign: 'center', fontSize: 'clamp(1.3rem, 5vw, 1.6rem)', marginBottom: '15px' }}>現在の体重を入力してください。</h2>
            
            <div style={{ display: 'flex', border: '1px solid var(--primary)', borderRadius: '30px', overflow: 'hidden', marginBottom: '10px' }}>
              <div 
                onClick={() => setWeightUnit('kg')}
                style={{ padding: '8px 24px', fontWeight: 'bold', cursor: 'pointer', background: weightUnit === 'kg' ? 'var(--primary)' : '#fff', color: weightUnit === 'kg' ? '#fff' : '#1e1e24' }}>
                kg
              </div>
              <div 
                onClick={() => setWeightUnit('lbs')}
                style={{ padding: '8px 24px', fontWeight: 'bold', cursor: 'pointer', background: weightUnit === 'lbs' ? 'var(--primary)' : '#fff', color: weightUnit === 'lbs' ? '#fff' : '#1e1e24' }}>
                lbs
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', marginBottom: '10px' }}>
              <input 
                type="number" 
                value={weight} 
                onChange={(e) => setWeight(e.target.value)} 
                style={{ fontSize: '3rem', fontWeight: 'bold', color: '#DCA038', letterSpacing: '0.05em', background: 'transparent', border: 'none', borderBottom: '2px solid var(--primary)', width: '180px', textAlign: 'center', outline: 'none' }} 
              />
              <span style={{ fontSize: '1.5rem', color: '#111827', marginLeft: '5px' }}>{weightUnit}</span>
            </div>
            
            <div style={{ width: '100%', marginTop: '0' }}>
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
                      <span style={{ fontSize: 'clamp(1.3rem, 5vw, 1.6rem)', fontWeight: 'bold', color: bmiColor }}>{bmiFixed}</span>
                      <span style={{ fontSize: '1rem', fontWeight: 'bold', color: bmiColor, background: bmiColor + '20', padding: '2px 10px', borderRadius: '20px' }}>{bmiLabel}</span>
                    </div>
                  </div>
                  <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: 'linear-gradient(to right, #3b82f6 0%, #22c55e 40%, #f59e0b 65%, #ef4444 100%)', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '-4px', left: `calc(${bmiPercent}% - 8px)`, width: '16px', height: '16px', borderRadius: '50%', background: '#fff', border: `3px solid ${bmiColor}`, boxShadow: '0 2px 6px rgba(0,0,0,0.2)', transition: 'left 0.3s' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.75rem', color: '#DCA038' }}>
                    <span>低体重 〜18.5</span>
                    <span>標準 18.5〜24.9</span>
                    <span>肥満 25〜</span>
                  </div>
                </div>
              );
            })()}
          </div>

          <div style={{ padding: '10px 0' }}>
            <button onClick={handleNext} style={{ width: '100%', padding: '14px', background: 'var(--primary)', color: '#fff', borderRadius: '30px', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
              次へ
            </button>
          </div>
        </div>
      )}

      {/* STEP 8: Target Weight */}
      {step === 8 && (
        <div style={{ flex: '1 0 auto', maxWidth: '600px', margin: '0 auto', padding: '10px 15px 15px', width: '100%', display: 'flex', flexDirection: 'column' }}>
          {renderWizardHeader("02 身体情報の設定", 8)}
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h2 className="logo-text-premium" style={{ textAlign: 'center', fontSize: 'clamp(1.3rem, 5vw, 1.6rem)', marginBottom: '15px' }}>目標体重を入力してください。</h2>
            
            <div style={{ display: 'flex', border: '1px solid var(--primary)', borderRadius: '30px', overflow: 'hidden', marginBottom: '10px' }}>
              <div 
                onClick={() => setWeightUnit('kg')}
                style={{ padding: '8px 24px', fontWeight: 'bold', cursor: 'pointer', background: weightUnit === 'kg' ? 'var(--primary)' : '#fff', color: weightUnit === 'kg' ? '#fff' : '#1e1e24' }}>
                kg
              </div>
              <div 
                onClick={() => setWeightUnit('lbs')}
                style={{ padding: '8px 24px', fontWeight: 'bold', cursor: 'pointer', background: weightUnit === 'lbs' ? 'var(--primary)' : '#fff', color: weightUnit === 'lbs' ? '#fff' : '#1e1e24' }}>
                lbs
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', marginBottom: '10px' }}>
              <input 
                type="number" 
                value={targetWeight} 
                onChange={(e) => setTargetWeight(e.target.value)} 
                style={{ fontSize: '3rem', fontWeight: 'bold', color: '#DCA038', letterSpacing: '0.05em', background: 'transparent', border: 'none', borderBottom: '2px solid var(--primary)', width: '180px', textAlign: 'center', outline: 'none' }} 
              />
              <span style={{ fontSize: '1.5rem', color: '#111827', marginLeft: '5px' }}>{weightUnit}</span>
            </div>
            
            <div style={{ width: '100%', marginTop: '0' }}>
              <RulerPicker 
                min={weightUnit === 'kg' ? 30 : 60} 
                max={weightUnit === 'kg' ? 150 : 330} 
                step={0.1}
                value={Number(targetWeight)} 
                onChange={val => setTargetWeight(String(val))} 
                orientation="horizontal"
              />
            </div>

            {/* BMI Display for Target Weight */}
            {height && (() => {
              const weightKg = weightUnit === 'lbs' ? Number(targetWeight) * 0.453592 : Number(targetWeight);
              const heightM = Number(height) / 100;
              const bmi = heightM > 0 ? (weightKg / (heightM * heightM)) : 0;
              const bmiFixed = bmi.toFixed(1);
              const bmiLabel = bmi < 18.5 ? '低体重' : bmi < 25 ? '標準' : bmi < 30 ? '過体重' : '肥満';
              const bmiColor = bmi < 18.5 ? '#3b82f6' : bmi < 25 ? '#22c55e' : bmi < 30 ? '#f59e0b' : '#ef4444';
              const bmiPercent = Math.min(Math.max(((bmi - 10) / (40 - 10)) * 100, 0), 100);
              return (
                <div style={{ width: '100%', marginTop: '16px', padding: '12px 16px', background: '#f8f9fa', borderRadius: '16px', border: '1px solid #e9ecef' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#8b8d9a' }}>目標のBMI</span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span style={{ fontSize: 'clamp(1.3rem, 5vw, 1.6rem)', fontWeight: 'bold', color: bmiColor }}>{bmiFixed}</span>
                      <span style={{ fontSize: '1rem', fontWeight: 'bold', color: bmiColor, background: bmiColor + '20', padding: '2px 10px', borderRadius: '20px' }}>{bmiLabel}</span>
                    </div>
                  </div>
                  <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: 'linear-gradient(to right, #3b82f6 0%, #22c55e 40%, #f59e0b 65%, #ef4444 100%)', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '-4px', left: `calc(${bmiPercent}% - 8px)`, width: '16px', height: '16px', borderRadius: '50%', background: '#fff', border: `3px solid ${bmiColor}`, boxShadow: '0 2px 6px rgba(0,0,0,0.2)', transition: 'left 0.3s' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.75rem', color: '#DCA038' }}>
                    <span>低体重 〜18.5</span>
                    <span>標準 18.5〜24.9</span>
                    <span>肥満 25〜</span>
                  </div>
                </div>
              );
            })()}
          </div>

          <div style={{ padding: '10px 0' }}>
            <button onClick={handleNext} style={{ width: '100%', padding: '14px', background: 'var(--primary)', color: '#fff', borderRadius: '30px', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
              次へ
            </button>
          </div>
        </div>
      )}

      {/* STEP 9: Environment */}
      {step === 9 && (
        <div style={{ flex: '1 0 auto', maxWidth: '600px', margin: '0 auto', padding: '10px 15px 15px', width: '100%', display: 'flex', flexDirection: 'column' }}>
          {renderWizardHeader("03 トレーニング環境", 9)}
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: '10px', justifyContent: 'center' }}>
            <h2 className="logo-text-premium" style={{ textAlign: 'center', fontSize: 'clamp(1.3rem, 5vw, 1.6rem)', marginBottom: '15px' }}>どこでトレーニングしますか？</h2>
            
            <div className="options-grid options-grid-3" style={{ flex: 1, justifyContent: 'flex-start', paddingTop: '10px', paddingBottom: '10px' }}>
              {renderOptionCard('家', 'fa-solid fa-house', environment === '家', () => setEnvironment('家'))}
              {renderOptionCard('ジム', 'fa-solid fa-dumbbell', environment === 'ジム', () => setEnvironment('ジム'))}
              {renderOptionCard('どの場所でもOK', 'fa-solid fa-earth-americas', environment === 'どの場所でもOK', () => setEnvironment('どの場所でもOK'))}
            </div>
          </div>

          <div style={{ padding: '10px 0' }}>
            <button onClick={handleNext} disabled={!environment} style={{ width: '100%', padding: '14px', background: environment ? 'linear-gradient(180deg, #FDF0A6 0%, #DCA038 45%, #9C6615 55%, #E8C162 100%)' : '#e9ecef', boxShadow: environment ? '0 4px 15px rgba(0,0,0,0.5)' : 'none', color: environment ? '#000' : '#adb5bd', letterSpacing: environment ? '0.1em' : 'normal', borderRadius: '30px', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
              次へ
            </button>
          </div>
        </div>
      )}

      {/* STEP 10: Exercise Limitations */}
      {step === 10 && (
        <div style={{ flex: '1 0 auto', maxWidth: '600px', margin: '0 auto', padding: '10px 15px 15px', width: '100%', display: 'flex', flexDirection: 'column' }}>
          {renderWizardHeader("03 トレーニング環境", 10)}
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: '10px', justifyContent: 'center' }}>
            <h2 className="logo-text-premium" style={{ textAlign: 'center', fontSize: 'clamp(1.3rem, 5vw, 1.6rem)', marginBottom: '15px' }}>運動の種類の制限はありますか？</h2>
            
            <div className="options-grid" style={{ flex: 1, justifyContent: 'flex-start', paddingTop: '10px', paddingBottom: '10px' }}>
              {renderOptionCard('なし（何でもできる）', 'fa-solid fa-check-double', exerciseTypes.includes('なし'), () => handleExerciseTypeToggle('なし'))}
              {renderOptionCard('器具無し（自重のみ）', 'fa-solid fa-hand-fist', exerciseTypes.includes('器具無し'), () => handleExerciseTypeToggle('器具無し'))}
              {renderOptionCard('ジャンプ無し（騒音配慮）', 'fa-solid fa-shoe-prints', exerciseTypes.includes('ジャンプ無し'), () => handleExerciseTypeToggle('ジャンプ無し'))}
              {renderOptionCard('寝たままの運動（負担軽減）', 'fa-solid fa-bed', exerciseTypes.includes('寝たままの運動'), () => handleExerciseTypeToggle('寝たままの運動'))}
            </div>
          </div>

          <div style={{ padding: '10px 0' }}>
            <button onClick={handleNext} disabled={exerciseTypes.length === 0} style={{ width: '100%', padding: '14px', background: exerciseTypes.length > 0 ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' : '#e9ecef', boxShadow: exerciseTypes.length > 0 ? '0 4px 15px rgba(217, 119, 6, 0.3)' : 'none', color: exerciseTypes.length > 0 ? '#fff' : '#adb5bd', borderRadius: '30px', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
              次へ
            </button>
          </div>
        </div>
      )}

      {/* STEP 11: Workout Level */}
      {step === 11 && (
        <div style={{ flex: '1 0 auto', maxWidth: '600px', margin: '0 auto', padding: '10px 15px 15px', width: '100%', display: 'flex', flexDirection: 'column' }}>
          {renderWizardHeader("03 フィットネスレベル評価", 11)}
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: '10px', justifyContent: 'center' }}>
            <h2 className="logo-text-premium" style={{ textAlign: 'center', fontSize: 'clamp(1.3rem, 5vw, 1.6rem)', marginBottom: '15px' }}>ご希望のワークアウトレベルを選択してください</h2>
            
            <div className="options-grid options-grid-3" style={{ flex: 1, justifyContent: 'flex-start', paddingTop: '10px', paddingBottom: '10px' }}>
              {renderOptionCard('簡単に始められる', 'fa-solid fa-hand-peace', workoutLevel === '簡単に始められる', () => setWorkoutLevel('簡単に始められる'))}
              {renderOptionCard('軽い汗をかく', 'fa-solid fa-droplet', workoutLevel === '軽い汗をかく', () => setWorkoutLevel('軽い汗をかく'))}
              {renderOptionCard('少しやりごたえがある', 'fa-solid fa-fire', workoutLevel === '少しやりごたえがある', () => setWorkoutLevel('少しやりごたえがある'))}
            </div>
          </div>

          <div style={{ padding: '10px 0' }}>
            <button onClick={handleNext} disabled={!workoutLevel} style={{ width: '100%', padding: '14px', background: workoutLevel ? 'linear-gradient(180deg, #FDF0A6 0%, #DCA038 45%, #9C6615 55%, #E8C162 100%)' : '#e9ecef', boxShadow: workoutLevel ? '0 4px 15px rgba(0,0,0,0.5)' : 'none', color: workoutLevel ? '#000' : '#adb5bd', letterSpacing: workoutLevel ? '0.1em' : 'normal', borderRadius: '30px', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
              次へ
            </button>
          </div>
        </div>
      )}

      {/* STEP 12: Physical Issues */}
      {step === 12 && (
        <div style={{ flex: '1 0 auto', maxWidth: '600px', margin: '0 auto', padding: '10px 15px 15px', width: '100%', display: 'flex', flexDirection: 'column' }}>
          {renderWizardHeader("04 ライフスタイル", 12)}
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: '10px', justifyContent: 'center' }}>
            <h2 className="logo-text-premium" style={{ textAlign: 'center', fontSize: 'clamp(1.3rem, 5vw, 1.6rem)', marginBottom: '15px' }}>体に不快感や懸念はありますか？</h2>
            <div style={{ background: '#f4f6fb', padding: '15px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px', width: '100%' }}>
              <i className="fa-solid fa-briefcase-medical" style={{ fontSize: '1.5rem', color: 'var(--primary)' }}></i>
              <p style={{ margin: 0, color: '#111827', fontSize: '0.9rem', lineHeight: 1.5 }}>これにより、特別な注意が必要な部位に焦点を当て、あなたのフィットネスの旅をカスタマイズします。</p>
            </div>
            
            <div className="options-grid" style={{ flex: 1, justifyContent: 'flex-start', paddingTop: '10px', paddingBottom: '10px' }}>
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
                    background: physicalIssues.includes(issue) ? (issue === 'なし' ? 'var(--primary)' : 'rgba(224, 68, 32, 0.05)') : '#ffffff',
                    border: `2px solid ${physicalIssues.includes(issue) ? (issue === 'なし' ? 'var(--primary)' : '#e04420') : '#f4f6fb'}`,
                    borderRadius: '16px',
                    cursor: 'pointer',
                    boxShadow: physicalIssues.includes(issue) ? (issue === 'なし' ? '0 4px 12px rgba(245, 158, 11, 0.2)' : '0 4px 12px rgba(224, 68, 32, 0.1)') : '0 4px 12px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <i className={issue === 'なし' ? 'fa-solid fa-ban' : 'fa-solid fa-notes-medical'} style={{ fontSize: '1.5rem', color: physicalIssues.includes(issue) ? (issue === 'なし' ? '#ffffff' : '#e04420') : '#adb5bd', width: '40px' }}></i>
                  <div style={{ fontSize: '1.1rem', fontWeight: physicalIssues.includes(issue) ? 'bold' : 'normal', color: physicalIssues.includes(issue) ? (issue === 'なし' ? '#ffffff' : '#e04420') : '#1e1e24' }}>
                    {issue}
                  </div>
                  {physicalIssues.includes(issue) && issue === 'なし' && (
                     <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: '50%', width: '24px', height: '24px' }}>
                       <i className="fa-solid fa-check" style={{ color: 'var(--primary)', fontSize: '1rem' }}></i>
                     </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: '10px 0' }}>
            <button onClick={handleNext} disabled={physicalIssues.length === 0} style={{ width: '100%', padding: '14px', background: physicalIssues.length > 0 ? 'var(--primary)' : '#dee2e6', color: physicalIssues.length > 0 ? '#fff' : '#adb5bd', borderRadius: '30px', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
              次へ
            </button>
          </div>
        </div>
      )}

      {/* STEP 13: Activity Level */}
      {step === 13 && (
        <div style={{ flex: '1 0 auto', maxWidth: '600px', margin: '0 auto', padding: '10px 15px 15px', width: '100%', display: 'flex', flexDirection: 'column' }}>
          {renderWizardHeader("04 ライフスタイル", 13)}
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: '10px' }}>
            <h2 className="logo-text-premium" style={{ textAlign: 'center', fontSize: 'clamp(1.3rem, 5vw, 1.6rem)', marginBottom: '15px' }}>あなたの身体活動レベルは？</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <ActivityLevelSlider value={activityLevel} onChange={setActivityLevel} />
            </div>
          </div>

          <div style={{ padding: '10px 0' }}>
            <button onClick={handleNext} disabled={!activityLevel} style={{ width: '100%', padding: '14px', background: activityLevel ? 'linear-gradient(180deg, #FDF0A6 0%, #DCA038 45%, #9C6615 55%, #E8C162 100%)' : '#e9ecef', boxShadow: activityLevel ? '0 4px 15px rgba(0,0,0,0.5)' : 'none', color: activityLevel ? '#000' : '#adb5bd', letterSpacing: activityLevel ? '0.1em' : 'normal', borderRadius: '30px', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
              次へ
            </button>
          </div>
        </div>
      )}

      {/* STEP 14: Frequency */}
      {step === 14 && (
        <div style={{ flex: '1 0 auto', maxWidth: '600px', margin: '0 auto', padding: '10px 15px 15px', width: '100%', display: 'flex', flexDirection: 'column' }}>
          {renderWizardHeader("04 ライフスタイル", 14)}
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: '10px', justifyContent: 'center' }}>
            <h2 className="logo-text-premium" style={{ textAlign: 'center', fontSize: 'clamp(1.3rem, 5vw, 1.6rem)', marginBottom: '15px' }}>目標とする運動頻度（1週間）</h2>
            
            <div className="options-grid" style={{ flex: 1, justifyContent: 'flex-start', paddingTop: '10px', paddingBottom: '10px' }}>
              {renderOptionCard('週1回 (無理なく)', 'fa-solid fa-calendar-day', frequency === '週1回', () => setFrequency('週1回'))}
              {renderOptionCard('週2〜3回 (おすすめ！)', 'fa-solid fa-calendar-days', frequency === '週3回', () => setFrequency('週3回'))}
              {renderOptionCard('週4〜5回', 'fa-solid fa-calendar-week', frequency === '週5回', () => setFrequency('週5回'))}
              {renderOptionCard('週6〜7回 (毎日！)', 'fa-solid fa-calendar-check', frequency === '週7回', () => setFrequency('週7回'))}
            </div>
          </div>

          <div style={{ padding: '10px 0' }}>
            <button type="button" onClick={handleCalculateAI} disabled={!frequency || loading} style={{ width: '100%', padding: '14px', background: frequency ? 'linear-gradient(180deg, #FDF0A6 0%, #DCA038 45%, #9C6615 55%, #E8C162 100%)' : '#e9ecef', boxShadow: frequency ? '0 4px 15px rgba(0,0,0,0.5)' : 'none', color: frequency ? '#000' : '#adb5bd', letterSpacing: frequency ? '0.1em' : 'normal', borderRadius: '30px', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
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
            <div style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '5px' }}>
              <i className="fa-solid fa-bullseye"></i>
            </div>
            <h2 style={{ marginBottom: '5px', fontSize: '1.3rem', fontWeight: 'bold' }}>AI分析完了！</h2>
            
            <div style={{ background: '#f8f9fa', padding: '10px 15px', borderRadius: '20px', border: '1px solid #e9ecef', marginBottom: '10px' }}>
              <p style={{ color: '#111827', marginBottom: '0', fontSize: '0.9rem' }}>目標（{targetWeight}{weightUnit}）到達までの予測日数</p>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '10px' }}>
                約 {estimatedResult?.estimatedDays || '?'} 日
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                <div style={{ background: '#fff', padding: '10px', borderRadius: '16px', minWidth: '110px', border: '1px solid #e9ecef', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
                  <div style={{ fontSize: '0.8rem', color: '#8b8d9a', marginBottom: '2px' }}>目標カロリー</div>
                  <div style={{ fontWeight: 'bold', color: '#DCA038', letterSpacing: '0.05em', fontSize: '1.1rem' }}>{estimatedResult?.calories || '?'} kcal</div>
                </div>
                <div style={{ background: '#fff', padding: '10px', borderRadius: '16px', minWidth: '110px', border: '1px solid #e9ecef', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
                  <div style={{ fontSize: '0.8rem', color: '#8b8d9a', marginBottom: '2px' }}>タンパク質</div>
                  <div style={{ fontWeight: 'bold', color: '#DCA038', letterSpacing: '0.05em', fontSize: '1.1rem' }}>{estimatedResult?.protein || '?'} g</div>
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
                bgVal = 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)';
              } else if (levelStr.includes('やりごたえ') || levelStr.includes('上級') || levelStr.includes('少しやりごたえがある')) {
                levelVal = '上級';
                timeVal = '約12分';
                bgVal = 'linear-gradient(135deg, #9c27b0 0%, #6a1b9a 100%)';
              }
              
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', marginBottom: '10px', width: '100%', textAlign: 'left' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary)', alignSelf: 'flex-start' }}>
                    <i className="fa-solid fa-bolt"></i> おすすめプラン
                  </h3>
                  <div className="challenge-card animate-fade-in" style={{ background: bgVal, width: '100%', margin: 0, padding: '16px', borderRadius: '24px', color: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                    <span className="challenge-badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', display: 'inline-block', marginBottom: '10px' }}>あなたにおすすめ</span>
                    <h4 className="challenge-title" style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: '0 0 15px 0' }}>全身脂肪燃焼 ({levelVal})</h4>
                    
                    <div className="challenge-stats" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
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
                    
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button type="button" className="challenge-btn" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleComplete('dashboard'); }} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '30px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <i className="fa-solid fa-home" style={{ pointerEvents: 'none' }}></i> ホームへ
                      </button>
                      <button type="button" className="challenge-btn" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleComplete('workout'); }} style={{ flex: 1, padding: '12px', background: '#fff', color: 'var(--primary)', border: 'none', borderRadius: '30px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
                        <i className="fa-solid fa-arrow-right" style={{ pointerEvents: 'none' }}></i> 開始する
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            <p style={{ fontSize: '0.8rem', color: '#5a5d72', marginBottom: '0', lineHeight: '1.4' }}>
              入力されたデータに基づいて、最適な推奨値を設定しました。<br/>
              後から変更することも可能です！
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
