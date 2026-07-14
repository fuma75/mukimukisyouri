'use client';
import React, { useState } from 'react';
import { useAppContext } from '../AppContext';

const equipmentToImage: Record<string, string> = {
  'dumbbell': '/images/dumbbell.png',
  'barbell': '/images/barbell.png',
  'machine': '/images/machine.png',
  'ab-roller': '/images/ab-roller.png',
};

const equipmentData = [
  {
    id: 'dumbbell',
    title: 'ダンベル (Dumbbell)',
    icon: 'fa-dumbbell',
    description: '自由な軌道で動かせるため、筋肉をより広い可動域で鍛えることができます。左右のバランスを整えるのにも最適です。',
    usage: 'まずは軽めの重量（男性なら5〜10kg、女性なら2〜5kg程度）から始め、フォームを固めましょう。反動を使わず、筋肉の収縮を意識しながらゆっくりと動作します。',
    exercises: [
      { name: 'ダンベルフライ', target: '大胸筋', tips: '胸を張り、肩甲骨を寄せて行います。',
        training: [
          { name: 'ダンベルフライ（フラット）', gif: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0294.gif', reps: 'x12' },
          { name: 'インクラインダンベルフライ', gif: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0313.gif', reps: 'x10' },
          { name: 'ダンベルプルオーバー', gif: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0334.gif', reps: 'x12' },
        ]},
      { name: 'ダンベルカール', target: '上腕二頭筋', tips: '肘を固定し、反動を使わずに持ち上げます。',
        training: [
          { name: 'ダンベルカール（スタンディング）', gif: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0293.gif', reps: 'x12' },
          { name: 'ハンマーカール', gif: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0303.gif', reps: 'x12' },
          { name: 'コンセントレーションカール', gif: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0285.gif', reps: 'x10' },
        ]},
      { name: 'ダンベルプレス', target: '大胸筋・三角筋', tips: '手のひらが前を向くように握り、真上に押し上げます。',
        training: [
          { name: 'ダンベルベンチプレス', gif: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0289.gif', reps: 'x10' },
          { name: 'インクラインダンベルプレス', gif: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0314.gif', reps: 'x10' },
          { name: 'ダンベルショルダープレス', gif: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0405.gif', reps: 'x12' },
        ]},
    ]
  },
  {
    id: 'barbell',
    title: 'バーベル (Barbell)',
    icon: 'fa-weight-hanging',
    description: '高重量を扱うことができるため、筋力アップや筋肥大（筋肉を大きくする）に最も効果的な器具です。',
    usage: '正しいフォームの習得が必須です。初心者のうちは重り（プレート）をつけず、シャフト（バーのみ）でフォームの練習を行いましょう。不安な場合はジムのスタッフに補助を頼んでください。',
    exercises: [
      { name: 'ベンチプレス', target: '大胸筋', tips: '肩甲骨を寄せて胸を張り、バーを胸の下部に下ろします。',
        training: [
          { name: 'バーベルベンチプレス', gif: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0025.gif', reps: 'x8' },
          { name: 'インクラインベンチプレス', gif: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0031.gif', reps: 'x8' },
          { name: 'クローズグリップベンチプレス', gif: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0032.gif', reps: 'x10' },
        ]},
      { name: 'スクワット', target: '大腿四頭筋・大臀筋', tips: '背筋を伸ばし、膝がつま先より前に出すぎないようにお尻を下げます。',
        training: [
          { name: 'バーベルバックスクワット', gif: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0043.gif', reps: 'x10' },
          { name: 'フロントスクワット', gif: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0037.gif', reps: 'x8' },
          { name: 'バーベルランジ', gif: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0039.gif', reps: 'x10 (各脚)' },
        ]},
      { name: 'デッドリフト', target: '背中全体・ハムストリング', tips: '背中が丸まらないように注意し、股関節を支点に持ち上げます。',
        training: [
          { name: 'コンベンショナルデッドリフト', gif: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0032.gif', reps: 'x6' },
          { name: 'ルーマニアンデッドリフト', gif: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0085.gif', reps: 'x10' },
          { name: 'バーベルベントオーバーロウ', gif: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0027.gif', reps: 'x10' },
        ]},
    ]
  },
  {
    id: 'machine',
    title: 'マシン (Machine)',
    icon: 'fa-gear',
    description: '軌道が固定されているため、初心者でも安全かつ簡単に特定の筋肉を鍛えることができます。怪我のリスクが低いです。',
    usage: 'まずは自分の体格に合わせてマシンのシートやパッドの位置を調整します（これが一番重要です）。説明書きや図解がマシンに貼ってあることが多いので参考にしましょう。',
    exercises: [
      { name: 'チェストプレス', target: '大胸筋', tips: 'ベンチプレスと同じ動きを安全に行えます。',
        training: [
          { name: 'チェストプレスマシン', gif: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0586.gif', reps: 'x12' },
          { name: 'ペックデックフライ', gif: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0585.gif', reps: 'x12' },
          { name: 'ケーブルクロスオーバー', gif: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0160.gif', reps: 'x12' },
        ]},
      { name: 'ラットプルダウン', target: '広背筋', tips: '肩甲骨を下げる意識でバーを胸の前に引き寄せます。',
        training: [
          { name: 'ワイドグリップラットプルダウン', gif: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0186.gif', reps: 'x12' },
          { name: 'クローズグリップラットプルダウン', gif: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0185.gif', reps: 'x12' },
          { name: 'シーテッドケーブルロウ', gif: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0171.gif', reps: 'x12' },
        ]},
      { name: 'レッグプレス', target: '脚全体', tips: '膝を伸ばしきらない（ロックしない）ように注意します。',
        training: [
          { name: 'レッグプレスマシン', gif: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0578.gif', reps: 'x12' },
          { name: 'レッグエクステンション', gif: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0583.gif', reps: 'x15' },
          { name: 'レッグカール', gif: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0576.gif', reps: 'x12' },
        ]},
    ]
  },
  {
    id: 'ab-roller',
    title: '腹筋ローラー (Ab Roller)',
    icon: 'fa-circle-dot',
    description: '腹筋を中心に、体幹全体（腹直筋・腹斜筋・腰背筋）を強烈に鍛えられるコンパクトな器具です。正しいフォームで行うと驚くほど高強度なトレーニングになります。',
    usage: '最初は膝をついた状態（膝コロ）から始めましょう。腰を反りすぎず、お腹を凹ませながら前に転がします。帰りは腹筋の力でゆっくりと体を引き戻すことが重要です。',
    exercises: [
      { name: '膝コロ（ニーロールアウト）', target: '腹筋全体', tips: '腰を反らさず、お腹を丸めるイメージで行います。',
        training: [
          { name: 'ニーロールアウト（基本）', gif: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0276.gif', reps: 'x10' },
          { name: 'ニーロールアウト（ワイドスタンス）', gif: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0276.gif', reps: 'x8' },
          { name: 'ニーロールアウト（スロー）', gif: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0276.gif', reps: 'x6' },
        ]},
      { name: '立ちコロ（スタンディングロールアウト）', target: '腹筋・体幹', tips: '上級者向け。背中が床と水平になるまで伸ばします。',
        training: [
          { name: '半立ちコロ（ハーフ）', gif: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0276.gif', reps: 'x8' },
          { name: 'フルスタンディングロールアウト', gif: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0276.gif', reps: 'x5' },
        ]},
      { name: 'V字ロールアウト（サイドコロ）', target: '腹斜筋・脇腹', tips: '斜め方向に転がして脇腹を重点的に鍛えます。',
        training: [
          { name: 'サイドロールアウト（左）', gif: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0276.gif', reps: 'x10 (各側)' },
          { name: 'サイドロールアウト（右）', gif: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0276.gif', reps: 'x10 (各側)' },
        ]},
    ]
  }
];

const plansData = [
  {
    title: '初心者向け: 全身基礎プラン',
    level: '初級',
    frequency: '週2〜3回',
    duration: '45分',
    color: { bg: 'rgba(43,138,62,0.15)', text: '#40c057', border: 'rgba(43,138,62,0.3)' },
    details: 'マシンを中心に使用し、安全に全身の筋肉を刺激するプランです。各10〜15回 × 3セットを目指しましょう。',
    days: [
      {
        label: '全身トレーニング（週2〜3回）',
        exercises: [
          { name: 'ウォーミングアップ', detail: '有酸素運動 5分' },
          { name: 'チェストプレス', detail: '10〜12回 × 3セット（胸）' },
          { name: 'ラットプルダウン', detail: '10〜12回 × 3セット（背中）' },
          { name: 'レッグプレス', detail: '12〜15回 × 3セット（脚）' },
          { name: 'クランチ', detail: '15回 × 2セット（腹筋）' },
          { name: 'クールダウン', detail: 'ストレッチ 5分' },
        ]
      }
    ]
  },
  {
    title: '中級者向け: 上下分割プラン',
    level: '中級',
    frequency: '週4回',
    duration: '60分',
    color: { bg: 'rgba(217,119,6,0.15)', text: '#f59f00', border: 'rgba(217,119,6,0.3)' },
    details: '上半身と下半身を別日に鍛えるスプリットルーティンです。フリーウェイトを取り入れます。',
    days: [
      {
        label: '上半身の日（月・木）',
        exercises: [
          { name: 'ベンチプレス / ダンベルプレス', detail: '8〜10回 × 4セット（胸）' },
          { name: 'ダンベルフライ', detail: '10〜12回 × 3セット（胸）' },
          { name: 'ラットプルダウン / 懸垂', detail: '8〜10回 × 4セット（背中）' },
          { name: 'ダンベルカール', detail: '10〜12回 × 3セット（二頭筋）' },
        ]
      },
      {
        label: '下半身の日（火・金）',
        exercises: [
          { name: 'バーベルスクワット', detail: '8〜10回 × 4セット（脚全体）' },
          { name: 'レッグエクステンション', detail: '12〜15回 × 3セット（前もも）' },
          { name: 'レッグカール', detail: '12〜15回 × 3セット（ハム）' },
          { name: 'クランチ / プランク', detail: '15〜20回 × 3セット（腹筋）' },
        ]
      }
    ]
  },
  {
    title: '上級者向け: 3分割プラン',
    level: '上級',
    frequency: '週5〜6回',
    duration: '75〜90分',
    color: { bg: 'rgba(220,38,38,0.15)', text: '#f87171', border: 'rgba(220,38,38,0.3)' },
    details: '胸・背中、肩・腕、脚という3分割で各部位を徹底的に追い込む上級プランです。',
    days: [
      {
        label: '胸・三頭筋の日（月・木）',
        exercises: [
          { name: 'バーベルベンチプレス', detail: '5〜8回 × 5セット' },
          { name: 'インクラインダンベルプレス', detail: '8〜10回 × 4セット' },
          { name: 'ペックデックフライ', detail: '12〜15回 × 3セット' },
          { name: 'トライセプスプッシュダウン', detail: '12〜15回 × 3セット' },
        ]
      },
      {
        label: '背中・二頭筋の日（火・金）',
        exercises: [
          { name: 'デッドリフト', detail: '5〜6回 × 4セット' },
          { name: 'ベントオーバーロウ', detail: '8〜10回 × 4セット' },
          { name: 'ラットプルダウン', detail: '10〜12回 × 3セット' },
          { name: 'ダンベルカール', detail: '10〜12回 × 3セット' },
        ]
      },
      {
        label: '脚・肩・腹筋の日（水・土）',
        exercises: [
          { name: 'バーベルスクワット', detail: '5〜8回 × 5セット' },
          { name: 'レッグプレス', detail: '10〜12回 × 4セット' },
          { name: 'ショルダープレス', detail: '8〜10回 × 4セット' },
          { name: 'サイドレイズ', detail: '12〜15回 × 3セット' },
          { name: 'プランク', detail: '60秒 × 3セット' },
        ]
      }
    ]
  }
];

export default function EquipmentGuide() {
  const [activeTab, setActiveTab] = useState('equipment');
  const [selectedEquipment, setSelectedEquipment] = useState(equipmentData[0].id);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [zoomGif, setZoomGif] = useState<string | null>(null);
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

      {/* GIF Zoom Modal */}
      {zoomGif && (
        <div
          onClick={() => setZoomGif(null)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 99999,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out',
          }}
        >
          <img
            src={zoomGif}
            alt="拡大"
            style={{ maxWidth: '90vw', maxHeight: '80vh', borderRadius: '16px', boxShadow: '0 8px 40px rgba(0,0,0,0.6)', objectFit: 'contain' }}
          />
          <button
            onClick={() => setZoomGif(null)}
            style={{ position: 'absolute', top: '20px', right: '24px', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: '1.5rem', width: '44px', height: '44px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
      )}

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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {item.exercises.map((ex, idx) => {
                    const imgUrl = equipmentToImage[item.id] || '/images/tiger-male.png';
                    const exKey = `${item.id}-${idx}`;
                    const isExpanded = expandedExercise === exKey;
                    return (
                      <div key={idx}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '15px',
                          background: isDark ? 'var(--bg-card, rgba(15,15,15,0.8))' : '#fff',
                          borderRadius: isExpanded ? '16px 16px 0 0' : '16px',
                          padding: '10px',
                          boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.04)',
                          border: isExpanded ? `1px solid ${primaryColor}` : (isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #f1f3f5'),
                          borderBottom: isExpanded ? 'none' : undefined,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                          onClick={() => setExpandedExercise(isExpanded ? null : exKey)}
                        >
                          <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '12px',
                            backgroundColor: isDark ? '#1a1a1a' : '#f0f0f0',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            padding: '8px',
                          }}>
                            <img
                              src={imgUrl}
                              alt={item.title}
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                          </div>
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 'bold', color: textMain }}>{ex.name}</h4>
                            <span style={{ fontSize: '0.8rem', color: textMuted }}>{ex.tips}</span>
                            <span style={{
                              display: 'inline-block',
                              width: 'fit-content',
                              fontSize: '0.75rem',
                              color: primaryColor,
                              background: isDark ? 'rgba(220,160,56,0.1)' : 'rgba(26,115,232,0.1)',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              marginTop: '2px',
                            }}>{ex.target}</span>
                          </div>
                          <i className={`fa-solid fa-chevron-${isExpanded ? 'up' : 'down'}`} style={{ color: primaryColor, fontSize: '14px', marginRight: '8px' }}></i>
                        </div>

                        {isExpanded && ex.training && (
                          <div style={{
                            background: isDark ? 'rgba(10,10,10,0.9)' : '#fafafa',
                            border: `1px solid ${primaryColor}`,
                            borderTop: 'none',
                            borderRadius: '0 0 16px 16px',
                            padding: '16px',
                          }}>
                            <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', color: textMain, display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <i className="fa-solid fa-dumbbell" style={{ color: primaryColor }}></i> トレーニング
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              {ex.training.map((t, tIdx) => (
                                <div key={tIdx} style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '14px',
                                  padding: '8px 0',
                                  borderBottom: tIdx < ex.training.length - 1 ? (isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #eee') : 'none',
                                }}>
                                  <i className="fa-solid fa-grip-vertical" style={{ color: textMuted, fontSize: '12px' }}></i>
                                 <div
                                    onClick={(e) => { e.stopPropagation(); setZoomGif(t.gif); }}
                                    style={{
                                      width: '60px',
                                      height: '60px',
                                      borderRadius: '10px',
                                      overflow: 'hidden',
                                      flexShrink: 0,
                                      background: isDark ? '#1a1a1a' : '#e9ecef',
                                      cursor: 'zoom-in',
                                      position: 'relative',
                                    }}
                                  >
                                    <img src={t.gif} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <div style={{ position: 'absolute', bottom: '2px', right: '2px', background: 'rgba(0,0,0,0.5)', borderRadius: '4px', padding: '1px 3px' }}>
                                      <i className="fa-solid fa-magnifying-glass-plus" style={{ color: '#fff', fontSize: '9px' }} />
                                    </div>
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: textMain }}>{t.name}</div>
                                    <div style={{ fontSize: '0.85rem', color: primaryColor, marginTop: '2px' }}>{t.reps}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'plan' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {plansData.map((plan, idx) => (
            <div key={idx} style={{ background: cardBg, borderRadius: '16px', overflow: 'hidden', boxShadow: isDark ? '0 4px 15px rgba(0,0,0,0.2)' : '0 4px 10px rgba(0,0,0,0.06)', border: cardBorder }}>
              {/* Plan Header */}
              <div style={{ padding: '18px 20px 14px', borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 style={{ margin: '0', fontSize: '1.1rem', color: textMain, fontWeight: 'bold' }}>{plan.title}</h3>
                  <span style={{ background: plan.color.bg, color: plan.color.text, border: `1px solid ${plan.color.border}`, fontSize: '0.75rem', padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold', flexShrink: 0 }}>
                    {plan.level}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '16px', color: textMuted, fontSize: '0.82rem', marginBottom: '10px' }}>
                  <span><i className="fa-regular fa-clock" style={{ marginRight: '4px' }} />{plan.duration}</span>
                  <span><i className="fa-solid fa-calendar-days" style={{ marginRight: '4px' }} />{plan.frequency}</span>
                </div>
                <p style={{ margin: '0', color: textSub, fontSize: '0.88rem', lineHeight: '1.55' }}>{plan.details}</p>
              </div>

              {/* Days */}
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {plan.days.map((day, dIdx) => (
                  <div key={dIdx}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: plan.color.text, flexShrink: 0 }} />
                      <span style={{ fontSize: '0.82rem', fontWeight: 'bold', color: plan.color.text }}>{day.label}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '14px', borderLeft: `2px solid ${plan.color.border}` }}>
                      {day.exercises.map((ex, eIdx) => (
                        <div key={eIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px 10px', background: isDark ? 'rgba(255,255,255,0.03)' : '#f8f9fa', borderRadius: '8px' }}>
                          <i className="fa-solid fa-check" style={{ color: plan.color.text, fontSize: '0.75rem', marginTop: '3px', flexShrink: 0 }} />
                          <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: textMain }}>{ex.name}</div>
                            <div style={{ fontSize: '0.78rem', color: textMuted, marginTop: '2px' }}>{ex.detail}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {dIdx < plan.days.length - 1 && <div style={{ height: '1px', background: isDark ? 'rgba(255,255,255,0.05)' : '#f0f0f0', margin: '4px 0 0 0' }} />}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
