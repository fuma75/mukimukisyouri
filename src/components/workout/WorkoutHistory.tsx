import React, { useState, useEffect, useMemo } from 'react';
import { getWorkouts, WorkoutItem } from '@/lib/storage';

interface WorkoutHistoryProps {
  onClose: () => void;
  initialDate: string;
  onSelectDate: (date: string) => void;
}

export default function WorkoutHistory({ onClose, initialDate, onSelectDate }: WorkoutHistoryProps) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date(initialDate));
  const [selectedDate, setSelectedDate] = useState(() => new Date(initialDate));
  const [allWorkouts, setAllWorkouts] = useState<WorkoutItem[]>([]);

  useEffect(() => {
    // We fetch all workouts and then filter.
    // In a real large scale app, we'd fetch by month, but here localStorage is fast.
    const all = getWorkouts();
    setAllWorkouts(all);
  }, []);

  const changeMonth = (offset: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + offset);
    setCurrentMonth(newMonth);
  };

  const handleDateClick = (dateObj: Date) => {
    setSelectedDate(dateObj);
    const dStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    onSelectDate(dStr);
  };

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days = [];
    const startPadding = firstDay.getDay(); // 0 (Sun) to 6 (Sat)
    
    // Previous month's trailing days (optional, here we'll just leave them blank or render light gray)
    for (let i = 0; i < startPadding; i++) {
        days.push(null);
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push(new Date(year, month, i));
    }
    
    return days;
  }, [currentMonth]);

  const activeDates = useMemo(() => {
    const dates = new Set<string>();
    allWorkouts.forEach(w => dates.add(w.date));
    return dates;
  }, [allWorkouts]);

  const selectedDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  
  // Weekly Summary logic (for the week containing selectedDate, Sunday to Saturday)
  const weeklySummary = useMemo(() => {
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    let totalWorkouts = 0;
    let totalDuration = 0;
    let totalCalories = 0;
    
    for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const dayWorkouts = allWorkouts.filter(w => w.date === dStr);
        if (dayWorkouts.length > 0) totalWorkouts += 1; // Count days with workouts or total workout items? Let's say total items.
        
        dayWorkouts.forEach(w => {
            totalDuration += (w.duration || 0);
            totalCalories += (w.calories || 0);
        });
    }

    return {
        startStr: `${startOfWeek.getMonth() + 1}月${startOfWeek.getDate()}日`,
        endStr: `${endOfWeek.getMonth() + 1}月${endOfWeek.getDate()}日`,
        totalWorkouts,
        totalDuration,
        totalCalories
    };
  }, [selectedDate, allWorkouts]);

  const dailyWorkouts = useMemo(() => {
    return allWorkouts.filter(w => w.date === selectedDateStr);
  }, [selectedDateStr, allWorkouts]);

  return (
    <div className="history-modal-overlay">
      <div className="history-modal-content">
        <div className="history-header">
            <button className="btn-icon" onClick={onClose}><i className="fa-solid fa-arrow-left"></i></button>
            <h2 className="history-title">履歴</h2>
            <div style={{ width: '40px' }}></div>
        </div>

        <div className="history-calendar-section">
            <div className="history-month-selector">
                <button onClick={() => changeMonth(-1)}><i className="fa-solid fa-caret-left"></i></button>
                <span>{currentMonth.getFullYear()}/{String(currentMonth.getMonth() + 1).padStart(2, '0')}</span>
                <button onClick={() => changeMonth(1)}><i className="fa-solid fa-caret-right"></i></button>
            </div>

            <div className="history-calendar-grid">
                {['日', '月', '火', '水', '木', '金', '土'].map(d => (
                    <div key={d} className="cal-header-day">{d}</div>
                ))}
                
                {calendarDays.map((dateObj, idx) => {
                    if (!dateObj) {
                        return <div key={`empty-${idx}`} className="cal-cell empty"></div>;
                    }
                    const dStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
                    const isSelected = selectedDateStr === dStr;
                    const hasWorkout = activeDates.has(dStr);
                    
                    return (
                        <div 
                            key={dStr} 
                            className="cal-cell"
                            onClick={() => handleDateClick(dateObj)}
                        >
                            <div className={`cal-day-num ${isSelected ? 'selected' : ''}`}>
                                {dateObj.getDate()}
                            </div>
                            {hasWorkout && <div className={`cal-dot ${isSelected ? 'selected-dot' : ''}`}></div>}
                        </div>
                    );
                })}
            </div>
        </div>

        <div className="history-summary-section">
            <h3 className="summary-title">週間サマリー</h3>
            <div className="summary-card">
                <div className="summary-card-header">
                    <span className="summary-dates">{weeklySummary.startStr} - {weeklySummary.endStr}</span>
                    <div className="summary-stats-top">
                        <span className="stat-time"><i className="fa-regular fa-clock"></i> {Math.floor(weeklySummary.totalDuration / 60)}:{String(weeklySummary.totalDuration % 60).padStart(2, '0')}</span>
                    </div>
                </div>
                <div className="summary-card-footer">
                    <span className="summary-workouts">{weeklySummary.totalWorkouts} ワークアウト</span>
                    <span className="stat-cals"><i className="fa-solid fa-fire" style={{color: '#ff5252'}}></i> {weeklySummary.totalCalories.toFixed(1)} キロカロリー</span>
                </div>
            </div>

            <div className="history-daily-list">
                {dailyWorkouts.length === 0 ? (
                    <div className="empty-daily-msg">この日のワークアウトはありません</div>
                ) : (
                    dailyWorkouts.map((w, idx) => (
                        <div key={w.id || idx} className="daily-workout-card">
                            <div className="dw-thumb">
                                {/* Normally dynamic based on category */}
                                <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="workout" />
                            </div>
                            <div className="dw-info">
                                <span className="dw-time">{new Date(selectedDateStr).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric'})}</span>
                                <h4 className="dw-title">{w.exercise}</h4>
                                <div className="dw-stats">
                                    <span><i className="fa-regular fa-clock"></i> {w.duration || 0}:00</span>
                                    <span><i className="fa-solid fa-fire" style={{color: '#ff5252'}}></i> {w.calories || 0} キロカロリー</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
