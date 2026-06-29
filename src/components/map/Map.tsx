'use client';
import React, { useState, useEffect } from 'react';

export default function Map() {
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    const handleFindGyms = () => {
        setLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setSearchQuery(`${lat},${lng} ジム`);
                    setLoading(false);
                },
                (error) => {
                    console.warn("Location access denied or timeout");
                    // 取得できない場合はデフォルトの検索
                    setSearchQuery('フィットネスジム');
                    setLoading(false);
                },
                { timeout: 5000, maximumAge: 60000 }
            );
        } else {
            setSearchQuery('フィットネスジム');
            setLoading(false);
        }
    };

    // 初回マウント時に自動で現在地を取得
    useEffect(() => {
        handleFindGyms();
    }, []);

    return (
        <section id="map" className="content-section active" style={{ paddingBottom: '100px' }}>
            <div className="section-layout single-column">
                <div className="form-container glass-panel">
                    <div className="panel-header">
                        <h2><i className="fa-solid fa-map-location-dot icon-blue"></i> 周辺のジムを探す</h2>
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <button className="btn btn-primary" onClick={handleFindGyms} style={{ padding: '8px 16px', fontSize: '1rem' }} disabled={loading}>
                            <i className="fa-solid fa-location-crosshairs"></i> 現在地周辺を検索
                        </button>
                    </div>
                    <p className="section-desc" style={{ marginBottom: '15px' }}>ボタンを押すと現在地を取得し、近くのフィットネスジムを検索します。</p>
                    <div className="map-wrapper" style={{ borderRadius: '12px', overflow: 'hidden', height: 'calc(100vh - 280px)', minHeight: '350px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', position: 'relative' }}>
                        {loading ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'rgba(0,0,0,0.05)' }}>
                                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '10px' }}></i>
                                    <p>現在地を取得中...</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <a 
                                    href={`https://maps.google.co.jp/maps?q=${encodeURIComponent(searchQuery)}&hl=ja`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    style={{
                                        position: 'absolute',
                                        top: '10px',
                                        left: '10px',
                                        background: 'white',
                                        color: '#1a73e8',
                                        padding: '8px 12px',
                                        borderRadius: '4px',
                                        textDecoration: 'none',
                                        fontWeight: 'bold',
                                        fontSize: '0.9rem',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        zIndex: 10
                                    }}
                                >
                                    マップで開く <i className="fa-solid fa-arrow-up-right-from-square"></i>
                                </a>
                                <iframe 
                                    width="100%" 
                                    height="100%" 
                                    frameBorder="0" 
                                    style={{ border: 0 }} 
                                    src={`https://maps.google.co.jp/maps?q=${encodeURIComponent(searchQuery)}&hl=ja&z=13&output=embed`} 
                                    allowFullScreen
                                    loading="lazy">
                                </iframe>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
