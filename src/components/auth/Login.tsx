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
  const { setUserProfile, setActiveTab, theme, setTheme } = useAppContext();
  const isDark = theme === 'dark';
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [estimatedResult, setEstimatedResult] = useState<any>(null);

  // Form State
  const [showForm, setShowForm] = useState(false);
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

  
  const isNextDisabled = () => {
    switch(step) {
      case 2: return !gender;
      case 3: return !goal;
      case 4: return targetAreas.length === 0;
      case 5: return !dob;
      case 6: return !height;
      case 7: return !weight;
      case 8: return !targetWeight;
      case 9: return !environment;
      case 10: return exerciseTypes.length === 0;
      case 11: return !workoutLevel;
      case 12: return physicalIssues.length === 0;
      case 13: return !activityLevel;
      case 14: return !frequency || loading;
      default: return false;
    }
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
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', position: 'relative', paddingTop: '15px', zIndex: 1 }}>
        <button onClick={handleBack} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', padding: '10px', color: isDark ? '#DCA038' : '#B58434' }}>
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div className="logo-text-premium" style={{ fontSize: '1rem', marginBottom: '8px', color: isDark ? '#DCA038' : '#B58434', letterSpacing: '0.05em' }}>
            {title}
          </div>
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', width: '150px', margin: '0 auto' }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{ flex: 1, height: '3px', background: i < normalizedStep ? (isDark ? '#DCA038' : '#B58434') : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'), borderRadius: '3px' }}></div>
            ))}
          </div>
        </div>
        <div style={{ width: '40px' }}></div>
      </div>
    );
  };

  
  const renderEnvironmentCard = (label: string, icon: string, selected: boolean, onClick: () => void, subtitle1: string, subtitle2: string, badge1Icon: string, badge1Text: string, badge2Icon: string, badge2Text: string) => (
    <div 
      onClick={onClick}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        padding: '20px',
        background: 'rgba(20, 20, 20, 0.5)',
        border: `1px solid ${selected ? '#DCA038' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: '16px',
        cursor: 'pointer',
        boxShadow: selected ? '0 0 15px rgba(220, 160, 56, 0.3)' : 'none',
        transition: 'all 0.3s ease',
        marginBottom: '15px',
        overflow: 'hidden'
      }}
    >
      {/* Tiger background faint */}
      <div style={{ position: 'absolute', right: '-20px', top: '0', bottom: '0', width: '200px', opacity: selected ? 0.3 : 0.1, backgroundImage: 'url(/images/login-bg-tiger.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'grayscale(100%) brightness(1.5)', maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)', WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)' }}></div>
      
      {/* Selected Checkmark */}
      {selected && (
        <div style={{ position: 'absolute', top: '15px', right: '15px', width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(180deg, #FDF0A6, #DCA038)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2 }}>
          <i className="fa-solid fa-check" style={{ color: '#000', fontSize: '0.8rem' }}></i>
        </div>
      )}

      {/* Icon */}
      <div style={{ 
        width: '70px', height: '70px', borderRadius: '50%', 
        border: `1px solid ${selected ? 'rgba(220, 160, 56, 0.5)' : 'rgba(255,255,255,0.2)'}`, 
        display: 'flex', justifyContent: 'center', alignItems: 'center', 
        marginRight: '20px', position: 'relative', zIndex: 2, flexShrink: 0
      }}>
        <div style={{ 
          width: '56px', height: '56px', borderRadius: '50%', 
          border: `1px solid ${selected ? '#DCA038' : 'rgba(255,255,255,0.3)'}`, 
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          background: selected ? 'rgba(220, 160, 56, 0.1)' : 'transparent'
        }}>
          <i className={icon} style={{ fontSize: '1.8rem', color: selected ? '#DCA038' : 'rgba(255,255,255,0.5)' }}></i>
        </div>
      </div>

      {/* Content */}
      <div style={{ display: 'flex', flexDirection: 'column', zIndex: 2 }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: selected ? '#fff' : 'rgba(255,255,255,0.8)', marginBottom: '8px', letterSpacing: '0.05em' }}>{label}</h3>
        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', margin: '0 0 4px 0', lineHeight: '1.4' }}>{subtitle1}</p>
        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', margin: '0 0 12px 0', lineHeight: '1.4' }}>{subtitle2}</p>
        
        {/* Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '4px 12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(220, 160, 56, 0.3)', borderRadius: '20px' }}>
            <i className={badge1Icon} style={{ fontSize: '0.75rem', color: '#DCA038', marginRight: '6px' }}></i>
            <span style={{ fontSize: '0.75rem', color: '#DCA038' }}>{badge1Text}</span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', padding: '4px 12px' }}>
            <i className={badge2Icon} style={{ fontSize: '0.75rem', color: '#DCA038', marginRight: '6px' }}></i>
            <span style={{ fontSize: '0.75rem', color: '#DCA038' }}>{badge2Text}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOptionCard = (label: string, icon: string, selected: boolean, onClick: () => void) => (
    <div 
      className="option-card"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => handleCardKeyDown(e, onClick)}
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '14px',
        padding: '16px 20px',
        background: selected ? 'rgba(220, 160, 56, 0.1)' : 'rgba(20, 20, 20, 0.5)',
        border: `2px solid ${selected ? '#DCA038' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: '14px',
        cursor: 'pointer',
        boxShadow: selected ? '0 0 15px rgba(220, 160, 56, 0.2)' : 'none',
        transition: 'all 0.2s ease',
        boxSizing: 'border-box',
        marginBottom: '0px',
      }}
    >
      <div style={{ width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0, overflow: 'hidden' }}>
        {icon.startsWith('/') ? (
          <img src={icon} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.2)', filter: selected ? 'sepia(1) hue-rotate(-30deg) saturate(3) brightness(1.1)' : 'grayscale(100%) brightness(0.5)', opacity: selected ? 1 : 0.6 }} />
        ) : (
          <i className={icon} style={{ fontSize: '1.7rem', color: selected ? '#DCA038' : 'rgba(255,255,255,0.3)' }}></i>
        )}
      </div>
      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: selected ? '#DCA038' : 'rgba(255,255,255,0.5)', textAlign: 'left', flex: 1 }}>
        {label}
      </div>
      {selected && <i className="fa-solid fa-circle-check" style={{ color: '#DCA038', fontSize: '1.2rem', flexShrink: 0 }}></i>}
    </div>
  );

  return (
    <div className="login-overlay" style={{ 
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, overflowY: 'auto', padding: '0', 
      background: isDark ? '#050505' : '#FCF8F2', 
      color: isDark ? '#FDF0A6' : '#333', 
      display: 'flex', flexDirection: 'column' 
    }}>
      {step > 1 && (
        <>
          <div style={{
            position: 'absolute', top: '10%', right: '-10%', width: '120%', height: '40%',
            background: isDark ? 'radial-gradient(circle, rgba(220,160,56,0.03) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(220,160,56,0.1) 0%, transparent 70%)',
            opacity: 0.5, pointerEvents: 'none', zIndex: 0
          }}></div>
          <div style={{
            position: 'absolute', top: '15%', right: '0%', fontSize: '200px',
            opacity: isDark ? 0.02 : 0.04, color: isDark ? '#ffffff' : '#000000', pointerEvents: 'none', zIndex: 0
          }}>
            <i className="fa-solid fa-tiger"></i>
          </div>
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '80px', height: '80px', opacity: isDark ? 0.3 : 0.4, transform: 'scaleX(-1)', pointerEvents: 'none', zIndex: 0 }}>
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M70 10 Q 50 40 40 90" stroke={isDark ? "#DCA038" : "#B58434"} strokeWidth="3" strokeLinecap="round" style={{filter: "drop-shadow(0px 0px 2px rgba(220,160,56,0.5))"}}/>
              <path d="M85 20 Q 65 50 55 95" stroke={isDark ? "#DCA038" : "#B58434"} strokeWidth="4" strokeLinecap="round" style={{filter: "drop-shadow(0px 0px 2px rgba(220,160,56,0.5))"}}/>
              <path d="M100 30 Q 80 60 70 100" stroke={isDark ? "#DCA038" : "#B58434"} strokeWidth="3" strokeLinecap="round" style={{filter: "drop-shadow(0px 0px 2px rgba(220,160,56,0.5))"}}/>
            </svg>
          </div>
        </>
      )}
      
      {/* STEP 1: Firebase Auth */}
      {step === 1 && (
        <div className="login-container" style={{ maxWidth: '400px', margin: 'auto', padding: '20px', width: '100%', position: 'relative' }}>
          {/* Theme Toggle */}
          <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
            <button 
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              style={{
                background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '20px',
                color: isDark ? '#DCA038' : '#B58434',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 'bold'
              }}
            >
              <i className={isDark ? "fa-solid fa-sun" : "fa-solid fa-moon"}></i>
              {isDark ? 'ライトモード' : 'ダークモード'}
            </button>
          </div>

          <div className="login-logo" style={{ marginBottom: '30px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '20px' }}>
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
            {!showForm ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <button type="button" className="btn btn-block" style={{ padding: '16px', background: 'linear-gradient(180deg, #FDF0A6 0%, #DCA038 45%, #9C6615 55%, #E8C162 100%)', color: '#000', borderRadius: '8px', fontWeight: 'bold', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', fontSize: '1.1rem', letterSpacing: '0.1em' }} onClick={() => { setIsLoginMode(false); setShowForm(true); }}>
                  新規登録
                </button>

                <button type="button" className="btn btn-block" style={{ padding: '16px', background: 'transparent', color: '#DCA038', border: '1px solid #DCA038', borderRadius: '8px', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', fontSize: '1.1rem', letterSpacing: '0.1em' }} onClick={() => { setIsLoginMode(true); setShowForm(true); }}>
                  ログイン
                </button>

                <div style={{ display: 'flex', alignItems: 'center', margin: '10px 0', color: '#DCA038', fontSize: '0.85rem' }}>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(220, 160, 56, 0.3)' }}></div>
                  <div style={{ padding: '0 10px' }}>または</div>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(220, 160, 56, 0.3)' }}></div>
                </div>

                <button type="button" className="btn btn-block" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '16px', background: '#ffffff', color: '#000', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.5)', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem' }} onClick={handleGoogleLogin} disabled={loading}>
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '20px' }} />
                  Googleで続ける
                </button>
              </div>
            ) : (
              <>
                <form autoComplete="off" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label style={{display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: isDark ? '#DCA038' : '#B58434', letterSpacing: '0.05em', marginBottom: '8px', textAlign: 'left'}}>メールアドレス</label>
                    <input type="email" name="email" autoComplete="off" placeholder="メールアドレスを入力" value={email} onChange={e => setEmail(e.target.value)} style={{ background: isDark ? '#0F0F11' : '#FFFFFF', border: isDark ? '1px solid rgba(220, 160, 56, 0.4)' : '1px solid #DCA038', borderRadius: '8px', padding: '16px', width: '100%', color: isDark ? '#fff' : '#000', outline: 'none', fontSize: '1rem', boxShadow: isDark ? 'inset 0 2px 4px rgba(0,0,0,0.5)' : 'none' }} />
                  </div>
                  
                  <div className="form-group" style={{ position: 'relative', marginBottom: '20px' }}>
                    <label style={{display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: isDark ? '#DCA038' : '#B58434', letterSpacing: '0.05em', marginBottom: '8px', textAlign: 'left'}}>パスワード</label>
                    <div style={{ position: 'relative' }}>
                      <input type={showPassword ? "text" : "password"} name="password" autoComplete="new-password" placeholder="パスワードを入力" value={password} onChange={e => setPassword(e.target.value)} style={{ background: isDark ? '#0F0F11' : '#FFFFFF', border: isDark ? '1px solid rgba(220, 160, 56, 0.4)' : '1px solid #DCA038', borderRadius: '8px', padding: '16px', width: '100%', color: isDark ? '#fff' : '#000', outline: 'none', fontSize: '1rem', boxShadow: isDark ? 'inset 0 2px 4px rgba(0,0,0,0.5)' : 'none', paddingRight: '60px' }} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: isDark ? '#DCA038' : '#B58434', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}>
                        {showPassword ? '非表示' : '表示'}
                      </button>
                    </div>
                  </div>

                  {!isLoginMode && (
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label style={{display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: isDark ? '#DCA038' : '#B58434', letterSpacing: '0.05em', marginBottom: '8px', textAlign: 'left'}}>ユーザー名</label>
                      <input type="text" name="nickname" autoComplete="off" placeholder="ユーザー名を入力" value={name} onChange={e => setName(e.target.value)} style={{ background: isDark ? '#0F0F11' : '#FFFFFF', border: isDark ? '1px solid rgba(220, 160, 56, 0.4)' : '1px solid #DCA038', borderRadius: '8px', padding: '16px', width: '100%', color: isDark ? '#fff' : '#000', outline: 'none', fontSize: '1rem', boxShadow: isDark ? 'inset 0 2px 4px rgba(0,0,0,0.5)' : 'none' }} />
                    </div>
                  )}

                  {isLoginMode && (
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', fontSize: '0.85rem', color: '#DCA038', letterSpacing: '0.05em', fontWeight: 'bold' }}>
                      <input type="checkbox" id="keepLoggedIn" style={{ marginRight: '8px', width: '16px', height: '16px', accentColor: '#DCA038' }} defaultChecked />
                      <label htmlFor="keepLoggedIn">ログイン状態を保持</label>
                    </div>
                  )}
                  
                  <button type="submit" className="btn btn-block" style={{ marginTop: '10px', padding: '16px', background: 'linear-gradient(180deg, #FDF0A6 0%, #DCA038 45%, #9C6615 55%, #E8C162 100%)', color: '#000', borderRadius: '8px', fontWeight: 'bold', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', fontSize: '1.1rem', letterSpacing: '0.1em' }} disabled={loading}>
                    {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : (isLoginMode ? 'ログイン' : '新規登録')}
                  </button>
                </form>

                <button type="button" className="btn btn-block" style={{ marginTop: '15px', padding: '14px', background: 'transparent', color: 'rgba(255,255,255,0.5)', border: 'none', fontWeight: 'bold', fontSize: '0.9rem' }} onClick={() => setShowForm(false)}>
                  キャンセル
                </button>
              </>
            )}
            
          </div>
        </div>
      )}

      {/* STEP 2: Gender */}
      {step === 2 && (
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '10px 20px 100px', width: '100%', display: 'flex', flexDirection: 'column', minHeight: '100dvh', justifyContent: 'center' }}>
          {renderWizardHeader("01 目標とターゲット部位", 2)}
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginTop: '10px', marginBottom: '20px' }}>
            <h2 className="logo-text-premium" style={{ textAlign: 'center', fontSize: 'clamp(1.3rem, 5vw, 1.6rem)', margin: '0 0 4px' }}>あなたの性別は？</h2>
            <p style={{ textAlign: 'center', color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0,0,0,0.5)', margin: 0 }}>あなたについて教えてください</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%', maxWidth: '360px' }}>
              {['male', 'female'].map((g) => {
                const isSelected = gender === g;
                return (
                  <div key={g} 
                    className="option-card"
                    tabIndex={0}
                    onClick={() => setGender(g as 'male'|'female')}
                    onKeyDown={(e) => handleCardKeyDown(e, () => setGender(g as 'male'|'female'))}
                    style={{ 
                      aspectRatio: '3/4',
                      borderRadius: '16px', 
                      background: isSelected ? (isDark ? 'rgba(220,160,56,0.1)' : 'linear-gradient(180deg,#FFF 0%,#FDF8ED 100%)') : (isDark ? '#111' : '#FFF'), 
                      border: `2px solid ${isSelected ? '#DCA038' : (isDark ? '#333' : '#E8DFD1')}`, 
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 8px 20px rgba(220,160,56,0.15)' : '0 2px 8px rgba(0,0,0,0.05)',
                      transform: isSelected ? 'translateY(-2px)' : 'none',
                    }}>
                    
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: isSelected ? (isDark ? '#FDF0A6' : '#B58434') : (isDark ? '#555' : '#4C4239') }}>
                      <i className={`fa-solid ${g === 'male' ? 'fa-person' : 'fa-person-dress'}`} style={{ fontSize: '3.5rem' }}></i>
                    </div>
                    
                    <div style={{ height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: isSelected ? (isDark ? 'rgba(220,160,56,0.12)' : '#EBE1D0') : (isDark ? '#151515' : '#F6F3EC') }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: isSelected ? (isDark ? '#FDF0A6' : '#B58434') : (isDark ? '#888' : '#4C4239') }}>
                        {g === 'male' ? '男性' : '女性'}
                      </span>
                      {isSelected && <i className="fa-solid fa-check" style={{ color: isDark ? '#DCA038' : '#B58434', fontSize: '0.9rem' }}></i>}
                    </div>
                  </div>
                );
              })}
            </div>

            <button 
              type="button" 
              onClick={() => setGender('other')}
              style={{ background: gender === 'other' ? '#DCA038' : 'transparent', border: `1px solid ${gender === 'other' ? '#DCA038' : (isDark ? 'rgba(255,255,255,0.2)' : '#ccc')}`, padding: '10px 24px', borderRadius: '24px', color: gender === 'other' ? '#000' : (isDark ? 'rgba(255,255,255,0.6)' : '#666'), fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s' }}>
              その他 / 言いたくない
            </button>
          </div>

          
        </div>
      )}


      {/* STEP 3: Goal */}
      {step === 3 && (
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '10px 20px 100px', width: '100%', display: 'flex', flexDirection: 'column', minHeight: '100dvh', justifyContent: 'center' }}>
          {renderWizardHeader("01 目標とターゲット部位", 3)}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px', marginBottom: '20px' }}>
            <h2 className="logo-text-premium" style={{ textAlign: 'center', fontSize: 'clamp(1.2rem, 5vw, 1.5rem)', marginBottom: '8px' }}>主な目標は何ですか？</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {renderOptionCard('体重を減らす', 'fa-solid fa-weight-scale', goal === '減量', () => setGoal('減量'))}
              {renderOptionCard('筋肉増強', 'fa-solid fa-dumbbell', goal === '増量', () => setGoal('増量'))}
              {renderOptionCard('健康維持', 'fa-solid fa-heart-pulse', goal === '現状維持', () => setGoal('現状維持'))}
            </div>
          </div>

          
        </div>
      )}


      {/* STEP 4: Target Area */}
      {step === 4 && (
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '10px 20px 100px', width: '100%', display: 'flex', flexDirection: 'column', minHeight: '100dvh', justifyContent: 'center' }}>
          {renderWizardHeader("01 目標とターゲット部位", 4)}
          
          <div style={{ marginTop: '10px', marginBottom: '16px' }}>
            <h2 className="logo-text-premium" style={{ textAlign: 'center', fontSize: 'clamp(1.2rem, 5vw, 1.5rem)', marginBottom: '12px' }}>ターゲットの部位はどこですか？</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {renderOptionCard('全身', 'fa-solid fa-child', targetAreas.includes('全身'), () => handleAreaToggle('全身'))}
              {renderOptionCard('腕', 'fa-solid fa-hand-fist', targetAreas.includes('腕'), () => handleAreaToggle('腕'))}
              {renderOptionCard('胸部', 'fa-solid fa-child-reaching', targetAreas.includes('胸部'), () => handleAreaToggle('胸部'))}
              {renderOptionCard('背筋', '/images/tiger-back.png', targetAreas.includes('背筋'), () => handleAreaToggle('背筋'))}
              {renderOptionCard('腹筋', '/images/tiger-abs.png', targetAreas.includes('腹筋'), () => handleAreaToggle('腹筋'))}
              {renderOptionCard('脚', '/images/tiger-legs.png', targetAreas.includes('脚'), () => handleAreaToggle('脚'))}
            </div>
          </div>

          
        </div>
      )}


      {/* STEP 5: Date of Birth */}
      {step === 5 && (
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '10px 20px 100px', width: '100%', display: 'flex', flexDirection: 'column', minHeight: '100dvh', justifyContent: 'center' }}>
          {renderWizardHeader("02 身体情報の設定", 5)}
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <h2 className="logo-text-premium" style={{ textAlign: 'center', fontSize: 'clamp(1.3rem, 5vw, 1.6rem)', marginBottom: '15px' }}>生まれた年は？</h2>
            
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
                style={{ fontSize: '4rem', color: '#DCA038', textShadow: '0 2px 10px rgba(220, 160, 56, 0.5)', fontWeight: 'bold', background: 'transparent', border: 'none', borderBottom: '2px solid rgba(220, 160, 56, 0.5)', width: '140px', textAlign: 'center', outline: 'none', padding: 0, margin: 0, lineHeight: '1.2', paddingBottom: '4px' }} 
              />
              <span style={{ fontSize: '1.5rem', color: 'rgba(220, 160, 56, 0.5)', marginLeft: '10px', fontWeight: 'bold' }}>年</span>
            </div>

            <div style={{ width: '100%', maxWidth: '400px' }}>
              <DateWheelPicker value={dob} onChange={setDob} mode="year" />
            </div>
          </div>

          
        </div>
      )}

      {/* STEP 6: Height */}
      {step === 6 && (
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '10px 20px 100px', width: '100%', display: 'flex', flexDirection: 'column', minHeight: '100dvh', justifyContent: 'center' }}>
          {renderWizardHeader("02 身体情報の設定", 6)}
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <h2 className="logo-text-premium" style={{ textAlign: 'center', fontSize: 'clamp(1.3rem, 5vw, 1.6rem)', marginBottom: '15px' }}>身長を入力してください。</h2>

            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', marginBottom: '10px' }}>
              <input 
                type="number" 
                value={height} 
                onChange={(e) => { setHeight(e.target.value); setHeightUnit('cm'); }} 
                style={{ fontSize: '4rem', color: '#DCA038', textShadow: '0 2px 10px rgba(220, 160, 56, 0.5)', fontWeight: 'bold', background: 'transparent', border: 'none', borderBottom: '2px solid rgba(220, 160, 56, 0.5)', width: '180px', textAlign: 'center', outline: 'none', padding: 0, margin: 0, lineHeight: '1.2', paddingBottom: '4px' }} 
              />
              <span style={{ fontSize: '1.5rem', color: 'rgba(220, 160, 56, 0.5)', marginLeft: '10px', fontWeight: 'bold' }}>cm</span>
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

          
        </div>
      )}

      {/* STEP 7: Current Weight */}
      {step === 7 && (
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '10px 20px 100px', width: '100%', display: 'flex', flexDirection: 'column', minHeight: '100dvh', justifyContent: 'center' }}>
          {renderWizardHeader("02 身体情報の設定", 7)}
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <h2 className="logo-text-premium" style={{ textAlign: 'center', fontSize: 'clamp(1.3rem, 5vw, 1.6rem)', marginBottom: '15px' }}>現在の体重を入力してください。</h2>
            
            <div style={{ display: 'flex', border: '1px solid #DCA038', borderRadius: '30px', overflow: 'hidden', marginBottom: '10px' }}>
              <div 
                onClick={() => setWeightUnit('kg')}
                style={{ padding: '8px 24px', fontWeight: 'bold', cursor: 'pointer', background: weightUnit === 'kg' ? 'linear-gradient(180deg, #FDF0A6 0%, #DCA038 45%, #9C6615 55%, #E8C162 100%)' : 'rgba(20, 20, 20, 0.5)', color: weightUnit === 'kg' ? '#000' : 'rgba(220, 160, 56, 0.5)' }}>
                kg
              </div>
              <div 
                onClick={() => setWeightUnit('lbs')}
                style={{ padding: '8px 24px', fontWeight: 'bold', cursor: 'pointer', background: weightUnit === 'lbs' ? 'linear-gradient(180deg, #FDF0A6 0%, #DCA038 45%, #9C6615 55%, #E8C162 100%)' : 'rgba(20, 20, 20, 0.5)', color: weightUnit === 'lbs' ? '#000' : 'rgba(220, 160, 56, 0.5)' }}>
                lbs
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', marginBottom: '10px' }}>
              <input 
                type="number" 
                value={weight} 
                onChange={(e) => setWeight(e.target.value)} 
                style={{ fontSize: '4rem', color: '#DCA038', textShadow: '0 2px 10px rgba(220, 160, 56, 0.5)', fontWeight: 'bold', background: 'transparent', border: 'none', borderBottom: '2px solid rgba(220, 160, 56, 0.5)', width: '180px', textAlign: 'center', outline: 'none', padding: 0, margin: 0, lineHeight: '1.2', paddingBottom: '4px' }} 
              />
              <span style={{ fontSize: '1.5rem', color: 'rgba(220, 160, 56, 0.5)', marginLeft: '10px', fontWeight: 'bold' }}>{weightUnit}</span>
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
                <div style={{ width: '100%', marginTop: '16px', padding: '12px 16px', background: 'rgba(20, 20, 20, 0.5)', border: '1px solid rgba(220, 160, 56, 0.3)', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#DCA038' }}>あなたのBMI</span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span style={{ fontSize: 'clamp(1.3rem, 5vw, 1.6rem)', fontWeight: 'bold', color: bmiColor }}>{bmiFixed}</span>
                      <span style={{ fontSize: '1rem', fontWeight: 'bold', color: bmiColor, background: 'rgba(20,20,20,0.8)', padding: '4px 12px', borderRadius: '20px', border: `1px solid ${bmiColor}` }}>{bmiLabel}</span>
                    </div>
                  </div>
                  <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: 'linear-gradient(to right, #3b82f6 0%, #22c55e 40%, #f59e0b 65%, #ef4444 100%)', boxShadow: '0 2px 10px rgba(0,0,0,0.5)', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '-4px', left: `calc(${bmiPercent}% - 8px)`, width: '16px', height: '16px', borderRadius: '50%', background: '#111', border: `3px solid ${bmiColor}`, boxShadow: `0 0 10px ${bmiColor}, 0 2px 6px rgba(0,0,0,0.2)`, transition: 'left 0.3s' }} />
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

          
        </div>
      )}

      {/* STEP 8: Target Weight */}
      {step === 8 && (
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '10px 20px 100px', width: '100%', display: 'flex', flexDirection: 'column', minHeight: '100dvh', justifyContent: 'center' }}>
          {renderWizardHeader("02 身体情報の設定", 8)}
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <h2 className="logo-text-premium" style={{ textAlign: 'center', fontSize: 'clamp(1.3rem, 5vw, 1.6rem)', marginBottom: '15px' }}>目標体重を入力してください。</h2>
            
            <div style={{ display: 'flex', border: '1px solid #DCA038', borderRadius: '30px', overflow: 'hidden', marginBottom: '10px' }}>
              <div 
                onClick={() => setWeightUnit('kg')}
                style={{ padding: '8px 24px', fontWeight: 'bold', cursor: 'pointer', background: weightUnit === 'kg' ? 'linear-gradient(180deg, #FDF0A6 0%, #DCA038 45%, #9C6615 55%, #E8C162 100%)' : 'rgba(20, 20, 20, 0.5)', color: weightUnit === 'kg' ? '#000' : 'rgba(220, 160, 56, 0.5)' }}>
                kg
              </div>
              <div 
                onClick={() => setWeightUnit('lbs')}
                style={{ padding: '8px 24px', fontWeight: 'bold', cursor: 'pointer', background: weightUnit === 'lbs' ? 'linear-gradient(180deg, #FDF0A6 0%, #DCA038 45%, #9C6615 55%, #E8C162 100%)' : 'rgba(20, 20, 20, 0.5)', color: weightUnit === 'lbs' ? '#000' : 'rgba(220, 160, 56, 0.5)' }}>
                lbs
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', marginBottom: '10px' }}>
              <input 
                type="number" 
                value={targetWeight} 
                onChange={(e) => setTargetWeight(e.target.value)} 
                style={{ fontSize: '4rem', color: '#DCA038', textShadow: '0 2px 10px rgba(220, 160, 56, 0.5)', fontWeight: 'bold', background: 'transparent', border: 'none', borderBottom: '2px solid rgba(220, 160, 56, 0.5)', width: '180px', textAlign: 'center', outline: 'none', padding: 0, margin: 0, lineHeight: '1.2', paddingBottom: '4px' }} 
              />
              <span style={{ fontSize: '1.5rem', color: 'rgba(220, 160, 56, 0.5)', marginLeft: '10px', fontWeight: 'bold' }}>{weightUnit}</span>
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
                <div style={{ width: '100%', marginTop: '16px', padding: '12px 16px', background: 'rgba(20, 20, 20, 0.5)', border: '1px solid rgba(220, 160, 56, 0.3)', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#DCA038' }}>目標のBMI</span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span style={{ fontSize: 'clamp(1.3rem, 5vw, 1.6rem)', fontWeight: 'bold', color: bmiColor }}>{bmiFixed}</span>
                      <span style={{ fontSize: '1rem', fontWeight: 'bold', color: bmiColor, background: 'rgba(20,20,20,0.8)', padding: '4px 12px', borderRadius: '20px', border: `1px solid ${bmiColor}` }}>{bmiLabel}</span>
                    </div>
                  </div>
                  <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: 'linear-gradient(to right, #3b82f6 0%, #22c55e 40%, #f59e0b 65%, #ef4444 100%)', boxShadow: '0 2px 10px rgba(0,0,0,0.5)', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '-4px', left: `calc(${bmiPercent}% - 8px)`, width: '16px', height: '16px', borderRadius: '50%', background: '#111', border: `3px solid ${bmiColor}`, boxShadow: `0 0 10px ${bmiColor}, 0 2px 6px rgba(0,0,0,0.2)`, transition: 'left 0.3s' }} />
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

          
        </div>
      )}

      {/* STEP 9: Environment */}
      {step === 9 && (
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '10px 20px 100px', width: '100%', display: 'flex', flexDirection: 'column', minHeight: '100dvh', justifyContent: 'center' }}>
          {renderWizardHeader("03 トレーニング環境", 9)}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            <h2 className="logo-text-premium" style={{ textAlign: 'center', fontSize: 'clamp(1.3rem, 5vw, 1.6rem)', marginBottom: '15px' }}>どこでトレーニングしますか？</h2>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: '10px', paddingBottom: '10px', gap: '10px' }}>
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '20px' }}>あなたのライフスタイルに合わせて選択してください</p>
              {renderOptionCard('自宅でトレーニング', 'fa-solid fa-house', environment === '家', () => setEnvironment('家'))}
              {renderOptionCard('ジムでトレーニング', 'fa-solid fa-dumbbell', environment === 'ジム', () => setEnvironment('ジム'))}
              {renderOptionCard('どの場所でもOK', 'fa-solid fa-globe', environment === 'どの場所でもOK', () => setEnvironment('どの場所でもOK'))}
            </div>
          </div>

          
        </div>
      )}

      {/* STEP 10: Exercise Limitations */}
      {step === 10 && (
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '10px 20px 100px', width: '100%', display: 'flex', flexDirection: 'column', minHeight: '100dvh', justifyContent: 'center' }}>
          {renderWizardHeader("03 トレーニング環境", 10)}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            <h2 className="logo-text-premium" style={{ textAlign: 'center', fontSize: 'clamp(1.3rem, 5vw, 1.6rem)', marginBottom: '15px' }}>運動の種類の制限はありますか？</h2>
            
            <div className="options-grid" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {renderOptionCard('なし（何でもできる）', 'fa-solid fa-check-double', exerciseTypes.includes('なし'), () => handleExerciseTypeToggle('なし'))}
              {renderOptionCard('器具無し（自重のみ）', 'fa-solid fa-hand-fist', exerciseTypes.includes('器具無し'), () => handleExerciseTypeToggle('器具無し'))}
              {renderOptionCard('ジャンプ無し（騒音配慮）', 'fa-solid fa-shoe-prints', exerciseTypes.includes('ジャンプ無し'), () => handleExerciseTypeToggle('ジャンプ無し'))}
              {renderOptionCard('寝たままの運動（負担軽減）', 'fa-solid fa-bed', exerciseTypes.includes('寝たままの運動'), () => handleExerciseTypeToggle('寝たままの運動'))}
            </div>
          </div>

          
        </div>
      )}

      {/* STEP 11: Workout Level */}
      {step === 11 && (
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '10px 20px 100px', width: '100%', display: 'flex', flexDirection: 'column', minHeight: '100dvh', justifyContent: 'center' }}>
          {renderWizardHeader("03 フィットネスレベル評価", 11)}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            <h2 className="logo-text-premium" style={{ textAlign: 'center', fontSize: 'clamp(1.3rem, 5vw, 1.6rem)', marginBottom: '15px' }}>ご希望のワークアウトレベルを選択してください</h2>
            
            <div className="options-grid options-grid-3" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {renderOptionCard('簡単に始められる', 'fa-solid fa-hand-peace', workoutLevel === '簡単に始められる', () => setWorkoutLevel('簡単に始められる'))}
              {renderOptionCard('軽い汗をかく', 'fa-solid fa-droplet', workoutLevel === '軽い汗をかく', () => setWorkoutLevel('軽い汗をかく'))}
              {renderOptionCard('少しやりごたえがある', 'fa-solid fa-fire', workoutLevel === '少しやりごたえがある', () => setWorkoutLevel('少しやりごたえがある'))}
            </div>
          </div>

          
        </div>
      )}

      {/* STEP 12: Physical Issues */}
      {step === 12 && (
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '10px 20px 100px', width: '100%', display: 'flex', flexDirection: 'column', minHeight: '100dvh', justifyContent: 'center' }}>
          {renderWizardHeader("04 ライフスタイル", 12)}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            <h2 className="logo-text-premium" style={{ textAlign: 'center', fontSize: 'clamp(1.3rem, 5vw, 1.6rem)', marginBottom: '15px' }}>体に不快感や懸念はありますか？</h2>
            <div style={{ background: 'rgba(20,20,20,0.5)', border: '1px solid rgba(220, 160, 56, 0.3)', padding: '15px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px', width: '100%' }}>
              <i className="fa-solid fa-briefcase-medical" style={{ fontSize: '1.5rem', color: '#DCA038' }}></i>
              <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', lineHeight: 1.5 }}>これにより、特別な注意が必要な部位に焦点を当て、あなたのフィットネスの旅をカスタマイズします。</p>
            </div>
            
            <div className="options-grid" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                    padding: '16px 20px',
                    background: physicalIssues.includes(issue) ? (issue === 'なし' ? 'linear-gradient(180deg, #FDF0A6 0%, #DCA038 45%, #9C6615 55%, #E8C162 100%)' : 'rgba(220, 160, 56, 0.1)') : 'rgba(20, 20, 20, 0.5)',
                    border: `2px solid ${physicalIssues.includes(issue) ? '#DCA038' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '16px',
                    cursor: 'pointer',
                    boxShadow: physicalIssues.includes(issue) ? '0 0 15px rgba(220, 160, 56, 0.2)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <i className={issue === 'なし' ? 'fa-solid fa-ban' : 'fa-solid fa-notes-medical'} style={{ fontSize: '1.5rem', color: physicalIssues.includes(issue) ? (issue === 'なし' ? '#000' : '#DCA038') : 'rgba(255,255,255,0.3)', width: '40px' }}></i>
                  <div style={{ fontSize: '1.1rem', fontWeight: physicalIssues.includes(issue) ? 'bold' : 'normal', color: physicalIssues.includes(issue) ? (issue === 'なし' ? '#000' : '#DCA038') : 'rgba(255,255,255,0.5)' }}>
                    {issue}
                  </div>
                  {physicalIssues.includes(issue) && issue === 'なし' && (
                     <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: physicalIssues.includes(issue) ? 'rgba(220, 160, 56, 0.1)' : 'rgba(20, 20, 20, 0.5)', borderRadius: '50%', width: '24px', height: '24px' }}>
                       <i className="fa-solid fa-check" style={{ color: '#DCA038', fontSize: '1rem' }}></i>
                     </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          
        </div>
      )}

      {/* STEP 13: Activity Level */}
      {step === 13 && (
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '10px 20px 100px', width: '100%', display: 'flex', flexDirection: 'column', minHeight: '100dvh', justifyContent: 'center' }}>
          {renderWizardHeader("04 ライフスタイル", 13)}
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: '10px' }}>
            <h2 className="logo-text-premium" style={{ textAlign: 'center', fontSize: 'clamp(1.3rem, 5vw, 1.6rem)', marginBottom: '15px' }}>あなたの身体活動レベルは？</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <ActivityLevelSlider value={activityLevel} onChange={setActivityLevel} />
            </div>
          </div>

          
        </div>
      )}

      {/* STEP 14: Frequency */}
      {step === 14 && (
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '10px 20px 100px', width: '100%', display: 'flex', flexDirection: 'column', minHeight: '100dvh', justifyContent: 'center' }}>
          {renderWizardHeader("04 ライフスタイル", 14)}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            <h2 className="logo-text-premium" style={{ textAlign: 'center', fontSize: 'clamp(1.3rem, 5vw, 1.6rem)', marginBottom: '15px' }}>目標とする運動頻度（1週間）</h2>
            
            <div className="options-grid" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {renderOptionCard('週1回 (無理なく)', 'fa-solid fa-calendar-day', frequency === '週1回', () => setFrequency('週1回'))}
              {renderOptionCard('週2〜3回 (おすすめ！)', 'fa-solid fa-calendar-days', frequency === '週3回', () => setFrequency('週3回'))}
              {renderOptionCard('週4〜5回', 'fa-solid fa-calendar-week', frequency === '週5回', () => setFrequency('週5回'))}
              {renderOptionCard('週6〜7回 (毎日！)', 'fa-solid fa-calendar-check', frequency === '週7回', () => setFrequency('週7回'))}
            </div>
          </div>

          
        </div>
      )}

      {/* STEP 15: AI Calculation Result & Finish */}
      {step === 15 && (
        <div style={{ flex: '1 0 auto', maxWidth: '600px', margin: '0 auto', padding: '20px', width: '100%', display: 'flex', flexDirection: 'column', minHeight: '100%', justifyContent: 'center' }}>
          <div className="animate-fade-in" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', color: '#DCA038', marginBottom: '5px' }}>
              <i className="fa-solid fa-bullseye"></i>
            </div>
            <h2 style={{ marginBottom: '5px', fontSize: '1.3rem', fontWeight: 'bold' }}>AI分析完了！</h2>
            
            <div style={{ background: 'rgba(20, 20, 20, 0.5)', border: '1px solid rgba(220, 160, 56, 0.3)', padding: '10px 15px', borderRadius: '20px', marginBottom: '10px' }}>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0', fontSize: '0.9rem' }}>目標（{targetWeight}{weightUnit}）到達までの予測日数</p>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#DCA038', marginBottom: '10px' }}>
                約 {estimatedResult?.estimatedDays || '?'} 日
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                <div style={{ background: 'rgba(20,20,20,0.5)', border: '1px solid rgba(220, 160, 56, 0.3)', padding: '10px', borderRadius: '16px', minWidth: '110px', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
                  <div style={{ fontSize: '0.8rem', color: '#DCA038', marginBottom: '2px' }}>目標カロリー</div>
                  <div style={{ fontWeight: 'bold', color: '#DCA038', letterSpacing: '0.05em', fontSize: '1.1rem' }}>{estimatedResult?.calories || '?'} kcal</div>
                </div>
                <div style={{ background: 'rgba(20,20,20,0.5)', border: '1px solid rgba(220, 160, 56, 0.3)', padding: '10px', borderRadius: '16px', minWidth: '110px', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
                  <div style={{ fontSize: '0.8rem', color: '#DCA038', marginBottom: '2px' }}>タンパク質</div>
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
                bgVal = 'linear-gradient(135deg, #DCA038 0%, var(--primary-dark) 100%)';
              } else if (levelStr.includes('やりごたえ') || levelStr.includes('上級') || levelStr.includes('少しやりごたえがある')) {
                levelVal = '上級';
                timeVal = '約12分';
                bgVal = 'linear-gradient(135deg, #9c27b0 0%, #6a1b9a 100%)';
              }
              
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', marginBottom: '10px', width: '100%', textAlign: 'left' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#DCA038', alignSelf: 'flex-start' }}>
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
                      <button type="button" className="challenge-btn" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleComplete('workout'); }} style={{ flex: 1, padding: '12px', background: '#DCA038', color: '#fff', border: 'none', borderRadius: '30px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
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


      {/* Sticky Wizard Footer */}
      {step >= 2 && step <= 14 && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '15px 20px', background: isDark ? 'rgba(15,15,17,0.95)' : 'rgba(255,255,255,0.95)', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, zIndex: 100, display: 'flex', justifyContent: 'center', backdropFilter: 'blur(10px)', paddingBottom: 'calc(15px + env(safe-area-inset-bottom))' }}>
          <div style={{ width: '100%', maxWidth: '500px', display: 'flex' }}>
            <button type="button" onClick={step === 14 ? handleCalculateAI : handleNext} disabled={isNextDisabled()} style={{ flex: 1, padding: '14px', background: !isNextDisabled() ? 'linear-gradient(180deg, #FDF0A6 0%, #DCA038 45%, #9C6615 55%, #E8C162 100%)' : 'rgba(255, 255, 255, 0.1)', boxShadow: !isNextDisabled() ? '0 4px 15px rgba(0,0,0,0.5)' : 'none', color: !isNextDisabled() ? '#000' : 'rgba(255, 255, 255, 0.3)', letterSpacing: !isNextDisabled() ? '0.1em' : 'normal', borderRadius: '30px', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              {step === 14 ? (
                <>
                  {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-robot"></i>}
                  <span style={{ marginLeft: '8px' }}>{loading ? 'AIで目標を計算中...' : 'AIで目標を計算して完了'}</span>
                </>
              ) : '次へ'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
