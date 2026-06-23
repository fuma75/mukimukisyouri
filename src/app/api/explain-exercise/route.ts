import { NextResponse } from 'next/server';
import { callGemini } from '@/lib/gemini';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { exercise } = body || {};
        if (!exercise) return NextResponse.json({ error: 'exercise required' }, { status: 400 });

        const prompt = `あなたは熱血パーソナルトレーナー「筋にくん」です。「${exercise}」という筋トレ種目の正しいやり方、フォームの注意点、効果のある筋肉部位について説明してください。必ず以下のキーを持つ有効なJSONオブジェクト1件のみを返してください。余計なマークアップや説明は一切含めないでください。
JSON形式：
{
  "explanation": "正しいやり方、フォームの注意点、効果のある筋肉部位の説明文（150文字〜200文字程度、熱血パーソナルトレーナー『筋にくん』の口調で。改行や箇条書きを含めること）"
}`;

        const text = await callGemini(prompt);
        let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        try {
            const parsed = JSON.parse(cleanText);
            return NextResponse.json({ ok: true, text: parsed.explanation || cleanText });
        } catch (e) {
            return NextResponse.json({ ok: true, text: cleanText });
        }
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'gemini call failed', detail: String(err) }, { status: 500 });
    }
}
