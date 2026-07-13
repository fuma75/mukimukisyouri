'use client';
import React, { useState } from 'react';
import { useAppContext } from '../AppContext';

const equipmentData = [
  {
    id: 'dumbbell',
    title: 'ダンベル (Dumbbell)',
    icon: 'fa-dumbbell',
    description: '自由な軌道で動かせるため、筋肉をより広い可動域で鍛えることができます。左右のバランスを整えるのにも最適です。',
    usage: 'まずは軽めの重量（男性なら5〜10kg、女性なら2〜5kg程度）から始め、フォームを固めましょう。反動を使わず、筋肉の収縮を意識しながらゆっくりと動作します。',
    exercises: [
      { name: 'ダンベルフライ', target: '大胸筋', tips: '胸を張り、肩甲骨を寄せて行います。' },
      { name: 'ダンベルカール', target: '上腕二頭筋', tips: '肘を固定し、反動を使わずに持ち上げます。' },
      { name: 'ダンベルプレス', target: '大胸筋・三角筋', tips: '手のひらが前を向くように握り、真上に押し上げます。' }
    ]
  },
  {
    id: 'barbell',
    title: 'バーベル (Barbell)',
    icon: 'fa-weight-hanging',
    description: '高重量を扱うことができるため、筋力アップや筋肥大（筋肉を大きくする）に最も効果的な器具です。',
    usage: '正しいフォームの習得が必須です。初心者のうちは重り（プレート）をつけず、シャフト（バーのみ）でフォームの練習を行いましょう。不安な場合はジムのスタッフに補助を頼んでください。',
    exercises: [
      { name: 'ベンチプレス', target: '大胸筋', tips: '肩甲骨を寄せて胸を張り、バーを胸の下部に下ろします。' },
      { name: 'スクワット', target: '大腿四頭筋・大臀筋', tips: '背筋を伸ばし、膝がつま先より前に出すぎないようにお尻を下げます。' },
      { name: 'デッドリフト', target: '背中全体・ハムストリング', tips: '背中が丸まらないように注意し、股関節を支点に持ち上げます。' }
    ]
  },
  {
    id: 'machine',
    title: 'マシン (Machine)',
    icon: 'fa-gear',
    description: '軌道が固定されているため、初心者でも安全かつ簡単に特定の筋肉を鍛えることができます。怪我のリスクが低いです。',
    usage: 'まずは自分の体格に合わせてマシンのシートやパッドの位置を調整します（これが一番重要です）。説明書きや図解がマシンに貼ってあることが多いので参考にしましょう。',
    exercises: [
      { name: 'チェストプレス', target: '大胸筋', tips: 'ベンチプレスと同じ動きを安全に行えます。' },
      { name: 'ラットプルダウン', target: '広背筋', tips: '肩甲骨を下げる意識でバーを胸の前に引き寄せます。' },
      { name: 'レッグプレス', target: '脚全体', tips: '膝を伸ばしきらない（ロックしない）ように注意します。' }
    ]
  }
];

const plansData = [
  {
    title: '初心者向け: 全身基礎プラン（週2〜3回）',
    level: '初心者',
    duration: '45分',
    details: 'マシンを中心に使用し、安全に全身の筋肉を刺激するプランです。各10〜15回 × 3セットを目指しましょう。',
    routine: [
      '1. ウォーミングアップ（有酸素運動 5分）',
      '2. チェストプレス（胸）',
      '3. ラットプルダウン（背中）',
      '4. レッグプレス（脚）',
      '5. クランチ（腹筋 15回×2セット）'
    ]
  },
  {
    title: '中級者向け: 上下分割プラン（週4回）',
    level: '中級者',
    duration: '60分',
    details: '上半身と下半身を別々の日に鍛えるスプリットルーティンです。フリーウェイト（バーベル・ダンベル）を取り入れます。',
    routine: [
      '【上半身の日】',
      '・ベンチプレス または ダンベルプレス',
      '・ダンベルフライ',
      '・ラットプルダウン または 懸垂',
      '・ダンベルカール',
      '【下半身の日】',
      '・バーベルスクワット',
      '・レッグエクステンション',
      '・レッグカール',
      '・クランチ（腹筋）'
    ]
  }
];

export default function EquipmentGuide() {
  const [activeTab, setActiveTab] = useState('equipment');
  const [selectedEquipment, setSelectedEquipment] = useState(equipmentData[0].id);
  const { theme } = useAppContext();
  const isDark = theme === 'dark';

  const primaryColor = isDark ? '#DCA038' : 'var(--primary)';
  const cardBg = isDark ? 'rgba(20,20,20,0.5)' : '#fff';
  const cardBorder = isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #f1f3f5';
  const textMain = isDark ? '#ffffff' : '#212529';
  const textSub = isDark ? 'rgba(255,255,255,0.8)' : '#495057';
  const textMuted = isDark ? 'rgba(255,255,255,0.5)' : '#6c757d';
  const boxBg = isDark ? 'rgba(0,0,0,0.3)' : '#f8f9fa';
  
  const getBtnStyle = (isActive: boolean) => ({
    padding: '12px', 
    background: isActive ? (isDark ? 'rgba(220,160,56,0.15)' : 'var(--primary)') : (isDark ? 'rgba(20,20,20,0.5)' : '#fff'), 
    color: isActive ? (isDark ? '#DCA038' : '#fff') : textSub, 
    border: isActive ? `1px solid ${primaryColor}` : (isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #ced4da'), 
    borderRadius: '8px', 
    fontWeight: 'bold', 
    cursor: 'pointer', 
    transition: '0.2s',
    flex: 1
  });

  const getPillStyle = (isActive: boolean) => ({
    padding: '8px 20px', 
    borderRadius: '20px', 
    border: isActive ? `1px solid ${primaryColor}` : (isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #ced4da'), 
    background: isActive ? (isDark ? 'rgba(220,160,56,0.15)' : 'var(--primary)') : (isDark ? 'rgba(20,20,20,0.5)' : '#fff'), 
    color: isActive ? (isDark ? '#DCA038' : '#fff') : textSub, 
    whiteSpace: 'nowrap', 
    fontSize: '14px', 
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: isActive ? (isDark ? '0 4px 10px rgba(220,160,56,0.2)' : '0 4px 10px rgba(0,0,0,0.1)') : 'none'
  });

  return (
    <section id="equipment" className="content-section active" style={{ height: '100%', overflowY: 'auto', padding: '20px', background: isDark ? 'transparent' : '#fcfcfd' }}>
      <div className="section-header" style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: isDark ? '#DCA038' : '#212529', margin: '0' }}>器具ガイド＆プラン</h2>
        <p style={{ color: textMuted, fontSize: '0.9rem', margin: '5px 0 0 0' }}>ジムでの正しいトレーニング方法を学びましょう</p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveTab('equipment')}
          style={getBtnStyle(activeTab === 'equipment')}
        >
          <i className="fa-solid fa-dumbbell" style={{ marginRight: '8px' }}></i>器具の使い方
        </button>
        <button 
          onClick={() => setActiveTab('plan')}
          style={getBtnStyle(activeTab === 'plan')}
        >
          <i className="fa-solid fa-clipboard-list" style={{ marginRight: '8px' }}></i>おすすめプラン
        </button>
      </div>

      {activeTab === 'equipment' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <style>{`
            .no-scrollbar::-webkit-scrollbar { display: none; }
          `}</style>
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '5px' }} className="no-scrollbar">
            {equipmentData.map(item => (
              <button 
                key={item.id}
                onClick={() => setSelectedEquipment(item.id)}
                style={getPillStyle(selectedEquipment === item.id) as any}
              >
                {item.title.split(' ')[0]}
              </button>
            ))}
          </div>

          {equipmentData.filter(item => item.id === selectedEquipment).map(item => (
            <div key={item.id} style={{ background: cardBg, borderRadius: '12px', padding: '20px', boxShadow: isDark ? '0 4px 15px rgba(0,0,0,0.2)' : '0 4px 6px rgba(0,0,0,0.05)', border: cardBorder, animation: 'fade-in 0.3s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: isDark ? 'rgba(220,160,56,0.1)' : 'rgba(26,115,232,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: primaryColor, fontSize: '1.5rem' }}>
                  <i className={`fa-solid ${item.icon}`}></i>
                </div>
                <h3 style={{ margin: '0', fontSize: '1.2rem', color: textMain }}>{item.title}</h3>
              </div>
              <p style={{ color: textSub, fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '15px' }}>{item.description}</p>
              
              <div style={{ background: boxBg, padding: '15px', borderRadius: '8px', marginBottom: '15px', border: isDark ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: textMain, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-lightbulb" style={{ color: isDark ? '#DCA038' : '#f59f00' }}></i> 使い方のコツ
                </h4>
                <p style={{ margin: '0', color: textSub, fontSize: '0.9rem', lineHeight: '1.5' }}>{item.usage}</p>
              </div>

              <div>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: textMain }}>代表的な種目</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {item.exercises.map((ex, idx) => (
                    <div key={idx} style={{ borderLeft: `3px solid ${primaryColor}`, paddingLeft: '10px' }}>
                      <div style={{ fontWeight: 'bold', color: textMain, fontSize: '0.95rem' }}>{ex.name} <span style={{ fontSize: '0.8rem', color: primaryColor, fontWeight: 'normal', background: isDark ? 'rgba(220,160,56,0.1)' : 'rgba(26,115,232,0.1)', padding: '2px 6px', borderRadius: '4px', marginLeft: '5px' }}>{ex.target}</span></div>
                      <div style={{ color: textMuted, fontSize: '0.85rem', marginTop: '3px' }}>{ex.tips}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'plan' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {plansData.map((plan, idx) => (
            <div key={idx} style={{ background: cardBg, borderRadius: '12px', padding: '20px', boxShadow: isDark ? '0 4px 15px rgba(0,0,0,0.2)' : '0 4px 6px rgba(0,0,0,0.05)', border: cardBorder }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <h3 style={{ margin: '0', fontSize: '1.15rem', color: textMain, fontWeight: 'bold' }}>{plan.title}</h3>
                <span style={{ background: plan.level === '初心者' ? (isDark ? 'rgba(43,138,62,0.2)' : '#eebfa') : (isDark ? 'rgba(217,72,15,0.2)' : '#ffe8cc'), color: plan.level === '初心者' ? (isDark ? '#40c057' : '#2b8a3e') : (isDark ? '#ff922b' : '#d9480f'), fontSize: '0.75rem', padding: '4px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                  {plan.level}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: textMuted, fontSize: '0.85rem', marginBottom: '15px' }}>
                <span><i className="fa-regular fa-clock" style={{ marginRight: '5px' }}></i>目安: {plan.duration}</span>
              </div>
              <p style={{ color: textSub, fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '15px' }}>{plan.details}</p>
              
              <div style={{ background: boxBg, padding: '15px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: textMain }}>ルーティン</h4>
                <ul style={{ margin: '0', padding: '0', listStyleType: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {plan.routine.map((step, sIdx) => (
                    <li key={sIdx} style={{ color: textSub, fontSize: '0.9rem', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <i className="fa-solid fa-check" style={{ color: primaryColor, marginTop: '3px', fontSize: '0.8rem' }}></i>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
