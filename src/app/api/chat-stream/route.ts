import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { systemInstruction, messages } = body || {};
        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'messages array required' }, { status: 400 });
        }

        const API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
        const MODEL = process.env.GEMINI_MODEL || 'gemini-flash-latest';
        const modelId = MODEL.startsWith('models/') ? MODEL : `models/${MODEL}`;
        const url = `https://generativelanguage.googleapis.com/v1beta/${modelId}:streamGenerateContent?alt=sse&key=${API_KEY}`;
        
        const geminiBody = {
            systemInstruction: {
                parts: [{ text: systemInstruction || "あなたは熱血フィットネストレーナーです。" }]
            },
            contents: messages,
            generationConfig: {
                temperature: 0.7
            }
        };

        const fetchRes = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(geminiBody)
        });

        if (!fetchRes.ok) {
            const errorText = await fetchRes.text();
            console.error("Gemini stream error:", errorText);
            const fallbackMessage = "すまない！現在AIの頭がパンク中（APIの利用制限または通信エラー）だ！\\n少し時間を置いてから再度試してくれ！それまでは、今まで通りの筋トレと食事を全力でこなすんだ！パワー！💪";
            return new Response(`data: ${JSON.stringify({candidates: [{content: {parts: [{text: fallbackMessage}]}}]})}\n\n`, {
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive'
                }
            });
        }

        // Return the ReadableStream from the fetch response directly
        return new Response(fetchRes.body, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            }
        });
    } catch (err) {
        console.error(err);
        const fallbackMessage = "すまない！サーバー側でエラーが発生したぞ！\\n筋肉を休めて、後でもう一度頼む！";
        return new Response(`data: ${JSON.stringify({candidates: [{content: {parts: [{text: fallbackMessage}]}}]})}\n\n`, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            }
        });
    }
}
