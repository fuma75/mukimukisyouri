import { NextResponse } from 'next/server';
import { callGeminiImage } from '@/lib/gemini';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { imageBase64, mimeType } = body || {};
        
        if (!imageBase64 || !mimeType) {
            return NextResponse.json({ error: 'imageBase64 and mimeType are required' }, { status: 400 });
        }

        const prompt = `提供された食事の画像から、料理名と概算の栄養成分を推測し、JSON形式で出力してください。
【重要事項】
・必ずJSONオブジェクト1つのみを出力してください。マークダウンの装飾（\`\`\`json）や説明文は一切含めないでください。
・キーはすべて小文字で "name", "calories", "protein", "fat", "carb", "amountGrams" とし、値は以下のようにしてください：
  - "name": 推測した料理名（string）
  - "calories", "protein", "fat", "carb": 画像から推測される分量に基づいた栄養成分の数値（number）。単位はそれぞれkcal, g, g, g。
  - "amountGrams": 画像から推測される料理の全体量（グラム数）（number）。
・画像に複数の料理が写っている場合は、それらを合わせた合計の栄養成分と、代表的な名前（定食名など）を推測してください。`;

        const text = await callGeminiImage(prompt, mimeType, imageBase64);
        
        // Clean up potential markdown formatting
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
            return NextResponse.json({ ok: false, raw: text, error: 'JSON parse error', detail: String(e) });
        }
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'gemini call failed', detail: String(err) }, { status: 500 });
    }
}
