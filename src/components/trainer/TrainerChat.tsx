'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../AppContext';
import { getMeals, getWorkouts } from '@/lib/storage';

export default function TrainerChat() {
  const { userProfile } = useAppContext();
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string, image?: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  // Video recording states
  const [isRecording, setIsRecording] = useState(false);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const videoStreamRef = useRef<MediaStream | null>(null);

  const trainerName = userProfile?.trainerName || '筋にくん';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ role: 'model', text: `おう！よく来たな！俺は「${trainerName}」、お前専属の熱血AIトレーナーだ！💪\n\nトレーニングのこと、食事のこと、モチベーションのこと、何でも聞いてくれ。全力で答えるぞ！` }]);
    }
  }, [trainerName, messages.length]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      setShowAttachMenu(false);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      videoStreamRef.current = stream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }
      
      let mimeType = 'video/webm';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/mp4'; // Fallback
      }
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      videoChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          videoChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(videoChunksRef.current, { type: mimeType });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          const file = new File([blob], `video.${mimeType.split('/')[1]}`, { type: mimeType });
          
          // Stop tracks immediately
          if (videoStreamRef.current) {
            videoStreamRef.current.getTracks().forEach(track => track.stop());
            videoStreamRef.current = null;
          }
          
          // Submit immediately to AI for form analysis
          submitMessage("フォームを解析してください。", file, base64data);
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setShowAttachMenu(false);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("カメラの起動に失敗しました。権限を確認してください。");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    submitMessage(input, imageFile, imagePreview);
  };

  const submitMessage = async (text: string, file: File | null, previewData: string | null) => {
    if (!text.trim() && !file) return;

    const newMessages = [...messages, { role: 'user' as const, text: text, image: previewData || undefined }];
    setMessages(newMessages);
    setInput('');
    setImageFile(null);
    setImagePreview(null);
    setLoading(true);

    try {
      // Build system context
      const todayStr = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
      const todayMeals = getMeals(todayStr);
      const todayWorkouts = getWorkouts(todayStr);
      let mealText = todayMeals.length > 0 ? todayMeals.map(m => `${m.name}(${m.calories}kcal)`).join(', ') : 'なし';
      let workoutText = todayWorkouts.length > 0 ? todayWorkouts.map(w => `${w.exercise}(${w.weight}kg x ${w.reps}回)`).join(', ') : 'なし';

      const appLang = localStorage.getItem('app_language') || '日本語';
      const systemInstruction = `あなたは熱血フィットネストレーナー「${trainerName}」だ！ユーザーのボディメイクを全力でサポートしろ！
ユーザーの情報: 名前=${userProfile?.name||'ゲスト'}, 目標=${userProfile?.goal||'維持'}, 目標摂取カロリー=${userProfile?.targetCalories||2000}kcal.
今日の食事: ${mealText}.
今日の筋トレ: ${workoutText}.
回答はHTMLのマークダウン（改行は<br>など）を含めても良い。ユーザーの質問（メニュー提案、トレーニングのコツなど）には、このデータに基づいて具体的に答えろ！口調は熱血で、語尾は「だ！」「ぞ！」などを使い、ポジティブに励ませ！
【特別指示：フォーム評価】ユーザーから動画（または連続した画像）が送られてきた場合は、筋トレのフォーム評価を行え！「背中が丸まっていないか」「膝が内側に入っていないか」「可動域は適切か」などを鋭く分析し、熱く的確なアドバイスと改善のためのキュー（意識するポイント）を教えろ！
【IMPORTANT LANGUAGE INSTRUCTION】
The user has selected the following language for communication: ${appLang}.
You MUST reply ENTIRELY in ${appLang}, but keep your hot-blooded fitness trainer persona. Translate your energetic style to the target language!`;

      const reqBody: any = {
        systemInstruction,
        messages: newMessages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }))
      };

      if (previewData) {
        // Send media data as base64 in the last message
        const base64Data = previewData.split(',')[1];
        reqBody.messages[reqBody.messages.length - 1].parts.push({
          inlineData: { mimeType: file?.type, data: base64Data }
        });
      }

      // Stream response
      const res = await fetch('/api/chat-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqBody)
      });

      if (!res.ok) throw new Error('Network error');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      
      setMessages([...newMessages, { role: 'model', text: '' }]);
      let botFullText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          botFullText += chunk;
          
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1].text = botFullText;
            return updated;
          });
        }
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: 'すまない！通信に失敗したようだ！もう一度試してくれ！💪' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="trainer" className="content-section active">
      <div className="chat-container glass-panel" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', overflow: 'hidden', padding: 0 }}>
        <div className="chat-header" style={{ padding: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.2)' }}>
          <img src="/assets/kinnikun.png" alt={trainerName} style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', background: 'var(--bg-card)', border: '2px solid var(--primary)' }} />
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{trainerName}</span> <span style={{ background: 'var(--primary)', color: 'white', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 'normal' }}>AI Trainer</span>
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}><i className="fa-solid fa-circle text-success" style={{ fontSize: '0.6rem', color: '#66bb6a' }}></i> オンラインで待機中だ！</span>
          </div>
        </div>
        
        <div className="chat-messages scroll-list" style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {messages.map((m, i) => (
            <div key={i} className={`chat-message ${m.role === 'user' ? 'msg-user' : 'msg-bot'} animate-fade-in`}>
              {m.role === 'model' && (
                <div className="msg-avatar">
                  <img src="/assets/kinnikun.png" alt={trainerName} className="chat-avatar-img" />
                </div>
              )}
              <div className={`msg-bubble ${m.role === 'user' ? 'user-bubble' : 'bot-bubble'}`}>
                <div className="msg-sender">{m.role === 'user' ? 'あなた' : trainerName}</div>
                <div className="msg-text" dangerouslySetInnerHTML={{ __html: m.text.replace(/\n/g, '<br>') }}></div>
                {m.image && (
                  <div style={{ marginTop: '5px' }}>
                    {m.image.startsWith('data:video') ? (
                      <video src={m.image} controls style={{ maxWidth: '100%', borderRadius: '8px', maxHeight: '300px' }} />
                    ) : (
                      <img src={m.image} style={{ maxWidth: '100%', borderRadius: '8px' }} />
                    )}
                  </div>
                )}
              </div>
              {m.role === 'user' && (
                <div className="msg-avatar user-avatar-icon">
                  <i className="fa-solid fa-user"></i>
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="chat-message msg-bot typing-indicator animate-fade-in">
              <div className="msg-avatar">
                <img src="/assets/kinnikun.png" alt={trainerName} className="chat-avatar-img" />
              </div>
              <div className="msg-bubble bot-bubble">
                <div className="typing-dots"><span></span><span></span><span></span></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="chat-input-area" style={{ padding: '15px', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', position: 'relative' }}>
          {imagePreview && (
            <div style={{ position: 'absolute', top: '-80px', left: '15px', background: 'rgba(0,0,0,0.8)', padding: '5px', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              {imagePreview.startsWith('data:video') ? (
                <video src={imagePreview} style={{ height: '60px', borderRadius: '4px' }} muted />
              ) : (
                <img src={imagePreview} style={{ height: '60px', borderRadius: '4px' }} />
              )}
              <button onClick={removeImage} style={{ background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>&times;</button>
            </div>
          )}
          
          {/* Recording Overlay */}
          {isRecording && (
            <div style={{ position: 'absolute', top: '-250px', left: '15px', right: '15px', height: '230px', background: 'rgba(0,0,0,0.9)', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', zIndex: 200, border: '2px solid red', boxShadow: '0 0 20px rgba(255,0,0,0.3)' }}>
              <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,0,0,0.8)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', zIndex: 201, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white', animation: 'pulse-glow 1s infinite' }}></div>
                録画中
              </div>
              <video ref={videoPreviewRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', bottom: '15px', left: '0', right: '0', display: 'flex', justifyContent: 'center' }}>
                <button onClick={stopRecording} className="btn" style={{ background: '#ff3b30', color: 'white', borderRadius: '30px', padding: '10px 30px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                  <i className="fa-solid fa-stop"></i> 停止して解析する
                </button>
              </div>
            </div>
          )}
          {showAttachMenu && (
            <div id="chat-attachment-menu" style={{ display: 'flex', position: 'absolute', bottom: 'calc(100% + 10px)', left: '15px', background: 'var(--panel-bg)', borderRadius: '16px', padding: '10px', border: '1px solid rgba(255,255,255,0.1)', flexDirection: 'column', gap: '4px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', zIndex: 100, minWidth: '200px' }}>
              <label className="attachment-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', cursor: 'pointer', borderRadius: '12px', transition: 'background 0.2s' }}>
                <div style={{ width: '32px', height: '32px', minWidth: '32px', flexShrink: 0, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fa-solid fa-camera"></i></div>
                <span style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>写真を撮る</span>
                <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleImageSelect} />
              </label>
              <label className="attachment-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', cursor: 'pointer', borderRadius: '12px', transition: 'background 0.2s' }}>
                <div style={{ width: '32px', height: '32px', minWidth: '32px', flexShrink: 0, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fa-solid fa-video"></i></div>
                <span style={{ fontWeight: 500, whiteSpace: 'nowrap' }} onClick={(e) => { e.preventDefault(); startRecording(); }}>動画を撮る</span>
              </label>
              <label className="attachment-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', cursor: 'pointer', borderRadius: '12px', transition: 'background 0.2s' }}>
                <div style={{ width: '32px', height: '32px', minWidth: '32px', flexShrink: 0, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fa-regular fa-image"></i></div>
                <span style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>画像・動画を選択</span>
                <input type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={handleImageSelect} />
              </label>
            </div>
          )}
          <form style={{ display: 'flex', gap: '10px', margin: 0, alignItems: 'center' }} onSubmit={handleSubmit}>
            <button type="button" onClick={() => setShowAttachMenu(!showAttachMenu)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fa-solid fa-plus"></i>
            </button>
            <input type="text" placeholder="筋肉や食事について相談する..." value={input} onChange={e => setInput(e.target.value)} disabled={loading} style={{ flex: 1, padding: '12px 20px', borderRadius: '25px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '1rem', outline: 'none' }} />
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ borderRadius: '50%', width: '46px', height: '46px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className="fa-solid fa-paper-plane" style={{ marginLeft: '-2px' }}></i>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
