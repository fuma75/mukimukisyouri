import { NextResponse } from 'next/server';
import { callGemini } from '@/lib/gemini';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { weight, targetWeight, goal, frequency, activityLevel } = body || {};

        if (!weight || !targetWeight) {
            return NextResponse.json({ error: 'weight and targetWeight required' }, { status: 400 });
        }

        const prompt = `あなたは優秀なパーソナルトレーナー「筋にくん」です。
ユーザーの現在の体重は${weight}kg、目標体重は${targetWeight}kgです。
フィットネス目標は「${goal}」です。
運動頻度は「${frequency || '不明'}」、普段の活動レベルは「${activityLevel || '不明'}」です。

この目標を健康的に達成するのにかかる「おおよその予測日数（整数）」と、「1日の目標摂取カロリー（kcal）」「目標タンパク質（g）」「目標脂質（g）」「目標炭水化物（g）」、および「目標達成に向けた筋トレプランの具体例」を提案してください。
健康的な減量ペースは月に体重の約5%まで、健康的な増量ペースは月に1~2kg程度とします。

必ず以下のキーを持つ有効なJSONオブジェクト1件のみを返してください。余計なコードブロックマークアップ（\`\`\`json等）や余分なテキストは一切含めないでください。
JSON形式：
{
  "estimatedDays": 予測日数,
  "calories": 目標カロリー,
  "protein": 目標タンパク質,
  "fat": 目標脂質,
  "carb": 目標炭水化物,
  "samplePlan": {
    "title": "プランのタイトル（例：週3回 自宅で全身引き締めプラン）",
    "description": "プランの簡単な説明とモチベーションが上がるコメント",
    "exercises": [
      { "name": "スクワット", "sets": "3セット", "reps": "15回" },
      { "name": "プランク", "sets": "3セット", "reps": "30秒" }
    ]
  }
}`;

        const text = await callGemini(prompt);
        let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        try {
            const match = cleanText.match(/\{[\s\S]*\}/);
            const jsonStr = match ? match[0] : cleanText;
            const parsed = JSON.parse(jsonStr);
            return NextResponse.json({ ok: true, result: parsed });
        } catch (e) {
            return NextResponse.json({ ok: false, raw: text, error: 'JSON parse failed' });
        }
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'gemini call failed', detail: String(err) }, { status: 500 });
    }
}
