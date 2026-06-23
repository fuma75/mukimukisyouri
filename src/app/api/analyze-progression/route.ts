import { NextResponse } from 'next/server';
import { callGemini } from '@/lib/gemini';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { exercise, goal, history } = body || {};
        if (!exercise) return NextResponse.json({ error: 'exercise required' }, { status: 400 });

        const prompt = `あなたは熱血パーソナルトレーナー「筋にくん」です。ユーザーの種目「${exercise}」の過去の筋トレ履歴を分析し、プログレッシブオーバーロード（漸進的過負荷）の原則に基づき、次回挑戦すべき重量・回数・セット数を提案してください。また、熱血かつ励みになるアドバイスメッセージ（「パワー！💪」等を含めて）を作成してください。ユーザーの全体目標は ${goal || 'maintain'} です。
履歴：
${JSON.stringify(history || [])}

必ず以下のキーを持つ有効なJSONオブジェクト1件のみを返してください。余計なコードブロックマークアップや余分なテキストは一切含めないでください。
JSON形式：
{
  "recommendedWeight": 推奨重量kg（数値、自重の場合は0）,
  "recommendedReps": 推奨回数（数値）,
  "recommendedSets": 推奨セット数（数値）,
  "message": "熱血トレーナーとしての解説や応援メッセージ（150文字程度）"
}`;

        const text = await callGemini(prompt);
        let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        try {
            const parsed = JSON.parse(cleanText);
            return NextResponse.json({ ok: true, result: parsed });
        } catch (e) {
            return NextResponse.json({ ok: false, raw: text, error: 'JSON parse failed' });
        }
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'gemini call failed', detail: String(err) }, { status: 500 });
    }
}
