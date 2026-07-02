import React, { useState, useEffect, useRef } from 'react';

interface HeightSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (height: number) => void;
  initialHeight: number;
}

export default function HeightSelectModal({ isOpen, onClose, onConfirm, initialHeight }: HeightSelectModalProps) {
  const [selectedHeight, setSelectedHeight] = useState<number>(initialHeight);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedHeight(initialHeight);
      // scroll to selected item if needed
      setTimeout(() => {
        if (listRef.current) {
          const selectedEl = listRef.current.querySelector('.selected-item');
          if (selectedEl) {
             selectedEl.scrollIntoView({ block: 'center' });
          }
        }
      }, 100);
    }
  }, [isOpen, initialHeight]);

  if (!isOpen) return null;

  const heights = [130, ...Array.from({ length: 90 }, (_, i) => 131 + i)]; // 130 to 220

  return (
    <div className="modal-overlay" style={overlayStyle} onClick={onClose}>
      <div className="modal-content" style={contentStyle} onClick={e => e.stopPropagation()}>
        <h3 style={titleStyle}>身長を選択してください</h3>
        
        <div style={listContainerStyle} ref={listRef}>
          {heights.map((h) => (
            <div 
              key={h} 
              style={itemStyle} 
              className={selectedHeight === h ? 'selected-item' : ''}
              onClick={() => setSelectedHeight(h)}
            >
              <span style={textStyle}>{h === 130 ? '130cm以下' : `${h}cm`}</span>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                border: selectedHeight === h ? '6px solid var(--primary)' : '2px solid #e0e0e0',
                backgroundColor: '#fff',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box'
              }} />
            </div>
          ))}
        </div>

        <div style={buttonContainerStyle}>
          <button style={closeButtonStyle} onClick={onClose}>閉じる</button>
          <button style={confirmButtonStyle} onClick={() => { onConfirm(selectedHeight); onClose(); }}>決定</button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '20px'
};

const contentStyle: React.CSSProperties = {
  backgroundColor: '#f6eff5', // subtle pinkish white like the image
  borderRadius: '24px',
  width: '100%',
  maxWidth: '400px',
  maxHeight: '85vh',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
};

const titleStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '24px 20px',
  fontSize: '17px',
  fontWeight: 'bold',
  color: '#555',
  margin: 0
};

const listContainerStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '0 24px',
  scrollbarWidth: 'none', // hide scrollbar for cleaner look
};

const itemStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '18px 0',
  borderBottom: '1px solid rgba(0,0,0,0.03)',
  cursor: 'pointer'
};

const textStyle: React.CSSProperties = {
  fontSize: '16px',
  color: '#666'
};

const buttonContainerStyle: React.CSSProperties = {
  display: 'flex',
  padding: '24px',
  gap: '16px'
};

const closeButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: '16px',
  borderRadius: '100px',
  border: 'none',
  backgroundColor: '#a39da8',
  color: 'white',
  fontSize: '16px',
  fontWeight: 'bold',
  cursor: 'pointer'
};

const confirmButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: '16px',
  borderRadius: '100px',
  border: 'none',
  backgroundColor: 'var(--primary)',
  color: 'white',
  fontSize: '16px',
  fontWeight: 'bold',
  cursor: 'pointer'
};
