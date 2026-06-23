'use client';
import React, { useState, useRef } from 'react';

const muscleExercises: Record<string, {name: string, desc: string}[]> = {
    '胸': [
        { name: 'ベンチプレス', desc: '胸全体を鍛える王道種目。大胸筋・三角筋前部・上腕三頭筋に効果的。' },
        { name: 'ダンベルフライ', desc: '大胸筋をストレッチさせ、内側までしっかり収縮させる種目。' },
        { name: 'インクラインベンチプレス', desc: '大胸筋上部をターゲットにした種目。立体的な胸を作る。' },
        { name: 'プッシュアップ', desc: '自重で行う基本的な胸トレ。バリエーションで強度調整可能。' }
    ],
    '背中': [
        { name: 'デッドリフト', desc: '背中全体から下半身まで鍛えるBIG3の一つ。' },
        { name: 'ラットプルダウン', desc: '広背筋をターゲットにし、背中の広がりを作る。' },
        { name: 'ベントオーバーローイング', desc: '背中の厚みを作る種目。広背筋と僧帽筋中下部に効く。' },
        { name: '懸垂（チンニング）', desc: '自重最強の背中トレ。広背筋をダイレクトに刺激する。' }
    ],
    '脚': [
        { name: 'スクワット', desc: '下半身全体を鍛える最強の種目。大腿四頭筋・ハム・大臀筋に。' },
        { name: 'レッグプレス', desc: 'マシンを使い、安全に高重量で脚を追い込める種目。' },
        { name: 'ランジ', desc: '片脚ずつ行うことでバランス能力と大臀筋・ハムストリングスを強化。' },
        { name: 'レッグエクステンション', desc: '大腿四頭筋（前もも）をアイソレートして鍛える。' }
    ],
    '肩': [
        { name: 'ショルダープレス', desc: '三角筋全体、特に前部〜中部を鍛えてメロン肩を作る。' },
        { name: 'サイドレイズ', desc: '三角筋中部をターゲットにし、肩幅を広く見せる種目。' },
        { name: 'リアレイズ', desc: '見落とされがちな三角筋後部を鍛え、立体的な肩を作る。' },
        { name: 'アップライトロウ', desc: '三角筋と僧帽筋上部を同時に鍛える種目。' }
    ],
    '腕': [
        { name: 'アームカール', desc: '上腕二頭筋（力こぶ）を鍛える代表的な種目。' },
        { name: 'フレンチプレス', desc: '上腕三頭筋（二の腕）をストレッチさせて鍛える。' },
        { name: 'トライセプスプッシュダウン', desc: 'ケーブルを使い、上腕三頭筋を収縮させる種目。' },
        { name: 'ハンマーカール', desc: '腕橈骨筋や上腕筋を鍛え、腕の厚みを作る。' }
    ],
    '腹筋': [
        { name: 'クランチ', desc: '腹直筋上部をターゲットにした基本的な腹筋運動。' },
        { name: 'レッグレイズ', desc: '腹直筋下部を狙い、ぽっこりお腹を解消する。' },
        { name: 'プランク', desc: '体幹部（コア）全体を等尺性収縮で鍛える。' },
        { name: 'ロシアンツイスト', desc: '腹斜筋を鍛え、くびれを作る種目。' }
    ]
};

export default function MuscleMap() {
    const [view, setView] = useState<'front' | 'back'>('front');
    const [selectedPart, setSelectedPart] = useState<string | null>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    const handlePartClick = (part: string) => {
        setSelectedPart(part);
        setTimeout(() => {
            resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    return (
        <section id="muscle-map" className="content-section active">
            <div className="section-layout">
                <div className="map-container glass-panel" style={{ flex: 1, minWidth: '300px', textAlign: 'center' }}>
                    <div className="panel-header" style={{ justifyContent: 'center' }}>
                        <h2><i className="fa-solid fa-child-reaching icon-blue"></i> 筋肉マップ</h2>
                    </div>
                    <p className="section-desc">気になる部位をクリックして、おすすめの筋トレ種目をチェックしよう！</p>
                    
                    <div style={{ margin: '10px 0' }}>
                        <div className="timer-mode-switch" style={{ display: 'inline-flex', gap: '5px' }}>
                            <button className={`btn btn-sm ${view === 'front' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setView('front')}>前面</button>
                            <button className={`btn btn-sm ${view === 'back' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setView('back')}>背面</button>
                        </div>
                    </div>

                    <div className="svg-body-container" style={{ position: 'relative', maxWidth: '250px', margin: '0 auto', padding: '10px 0' }}>
                        {view === 'front' ? (
                            <svg viewBox="0 0 200 400" width="100%" height="400" style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}>
                                <circle cx="100" cy="40" r="25" fill="#2a2a35" stroke="#121218" strokeWidth="2" />
                                <path className={`muscle-part ${selectedPart === '胸' ? 'active' : ''}`} onClick={() => handlePartClick('胸')} d="M 60 80 L 140 80 L 140 130 L 100 145 L 60 130 Z" />
                                <path className={`muscle-part ${selectedPart === '腹筋' ? 'active' : ''}`} onClick={() => handlePartClick('腹筋')} d="M 65 135 L 100 150 L 135 135 L 130 200 L 70 200 Z" />
                                <path className={`muscle-part ${selectedPart === '肩' ? 'active' : ''}`} onClick={() => handlePartClick('肩')} d="M 55 80 L 60 110 L 35 110 Z" />
                                <path className={`muscle-part ${selectedPart === '肩' ? 'active' : ''}`} onClick={() => handlePartClick('肩')} d="M 145 80 L 140 110 L 165 110 Z" />
                                <path className={`muscle-part ${selectedPart === '腕' ? 'active' : ''}`} onClick={() => handlePartClick('腕')} d="M 35 115 L 55 115 L 40 220 L 20 220 Z" />
                                <path className={`muscle-part ${selectedPart === '腕' ? 'active' : ''}`} onClick={() => handlePartClick('腕')} d="M 145 115 L 165 115 L 180 220 L 160 220 Z" />
                                <path className={`muscle-part ${selectedPart === '脚' ? 'active' : ''}`} onClick={() => handlePartClick('脚')} d="M 70 210 L 95 210 L 95 360 L 65 360 Z" />
                                <path className={`muscle-part ${selectedPart === '脚' ? 'active' : ''}`} onClick={() => handlePartClick('脚')} d="M 105 210 L 130 210 L 135 360 L 105 360 Z" />
                            </svg>
                        ) : (
                            <svg viewBox="0 0 200 400" width="100%" height="400" style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}>
                                <circle cx="100" cy="40" r="25" fill="#2a2a35" stroke="#121218" strokeWidth="2" />
                                <path className={`muscle-part ${selectedPart === '背中' ? 'active' : ''}`} onClick={() => handlePartClick('背中')} d="M 60 80 L 140 80 L 130 200 L 70 200 Z" />
                                <path className={`muscle-part ${selectedPart === '肩' ? 'active' : ''}`} onClick={() => handlePartClick('肩')} d="M 55 80 L 60 110 L 35 110 Z" />
                                <path className={`muscle-part ${selectedPart === '肩' ? 'active' : ''}`} onClick={() => handlePartClick('肩')} d="M 145 80 L 140 110 L 165 110 Z" />
                                <path className={`muscle-part ${selectedPart === '腕' ? 'active' : ''}`} onClick={() => handlePartClick('腕')} d="M 35 115 L 55 115 L 40 220 L 20 220 Z" />
                                <path className={`muscle-part ${selectedPart === '腕' ? 'active' : ''}`} onClick={() => handlePartClick('腕')} d="M 145 115 L 165 115 L 180 220 L 160 220 Z" />
                                <path className={`muscle-part ${selectedPart === '脚' ? 'active' : ''}`} onClick={() => handlePartClick('脚')} d="M 70 210 L 95 210 L 95 360 L 65 360 Z" />
                                <path className={`muscle-part ${selectedPart === '脚' ? 'active' : ''}`} onClick={() => handlePartClick('脚')} d="M 105 210 L 130 210 L 135 360 L 105 360 Z" />
                            </svg>
                        )}
                    </div>
                </div>

                <div ref={resultsRef} className="list-container glass-panel" style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column' }}>
                    <div className="panel-header">
                        <h2>
                            <i className="fa-solid fa-list-check icon-orange"></i> 
                            <span>{selectedPart ? `${selectedPart}トレ おすすめ種目` : '部位を選択してください'}</span>
                        </h2>
                    </div>
                    <div className="scroll-list" style={{ flex: 1, padding: '10px' }}>
                        {!selectedPart ? (
                            <div className="empty-state">
                                <i className="fa-solid fa-hand-pointer"></i>
                                <p>左の人体図から鍛えたい部位をクリックすると、<br/>おすすめの種目一覧が表示されます。</p>
                            </div>
                        ) : muscleExercises[selectedPart]?.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {muscleExercises[selectedPart].map((ex, idx) => (
                                    <div key={idx} className="glass-panel" style={{ padding: '15px', borderRadius: '12px', borderLeft: '4px solid var(--primary)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                                            <div>
                                                <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-color)', fontSize: '1.1rem' }}>{ex.name}</h4>
                                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{ex.desc}</p>
                                            </div>
                                            {/* AI Explain button could be implemented here */}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <p>{selectedPart}の種目はまだ登録されていません。</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
