import { NextResponse } from 'next/server';
import { callGemini } from '@/lib/gemini';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { description, amount } = body || {};
        if (!description) return NextResponse.json({ error: 'description required' }, { status: 400 });

        const mealText = amount ? `${description} (${amount}g)` : description;
        const prompt = `以下の食事について、概算の栄養成分をJSON形式で出力してください。
【重要事項】
・必ずJSONオブジェクト1つのみを出力してください。マークダウンの装飾（\`\`\`json）や説明文は一切含めないでください。
・キーはすべて小文字で "calories", "protein", "fat", "carb", "amountGrams" とし、値は数値（number）にしてください。
・もし食事の分量（g）が指定されていない場合は、一般的な1人前のグラム数を "amountGrams" に推測して設定し、そのグラム数に基づいた栄養成分を計算してください。分量が指定されている場合はその分量のまま計算してください。
食事: ${mealText}`;

        const text = await callGemini(prompt);
        // Clean up potential markdown formatting that the model might stubbornly add
        let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonStart = cleanText.indexOf('{');
        const jsonEnd = cleanText.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
            cleanText = cleanText.substring(jsonStart, jsonEnd + 1);
        }
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
