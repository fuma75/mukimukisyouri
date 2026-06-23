import { NextResponse } from 'next/server';
import { callGemini } from '@/lib/gemini';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { exercise, weight, reps, sets, durationMinutes, userWeight } = body || {};
        if (!exercise) return NextResponse.json({ error: 'exercise required' }, { status: 400 });

        const prompt = `次の運動の実施情報から、このセッションで消費したおおよその消費カロリー(kcal)をJSONで返してください。出力は必ずJSONオブジェクト1つにしてください。キーは小文字で正確に"calories"とし、数値を返してください。ユーザー体重が分かれば'userWeightKg'に値を入れてください。運動: ${exercise}、重量(kg): ${weight || ''}、回数: ${reps || ''}、セット数: ${sets || ''}、継続時間(分): ${durationMinutes || ''}、ユーザー体重(kg): ${userWeight || ''}`;

        const text = await callGemini(prompt);
        let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        try {
            const parsed = JSON.parse(cleanText);
            return NextResponse.json({ ok: true, result: parsed, raw: text });
        } catch (e) {
            return NextResponse.json({ ok: false, raw: text });
        }
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'gemini call failed', detail: String(err) }, { status: 500 });
    }
}
