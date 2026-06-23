import { NextResponse } from 'next/server';
import { callGeminiChat } from '@/lib/gemini';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { systemInstruction, messages } = body || {};
        if (!messages || !Array.isArray(messages)) return NextResponse.json({ error: 'messages array required' }, { status: 400 });

        const text = await callGeminiChat(systemInstruction || "あなたは熱血フィットネストレーナーです。", messages);
        return NextResponse.json({ ok: true, text });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'gemini call failed', detail: String(err) }, { status: 500 });
    }
}
