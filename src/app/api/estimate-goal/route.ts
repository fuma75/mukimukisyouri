import { NextResponse } from 'next/server';
import { callGemini } from '@/lib/gemini';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { weight, targetWeight, goal, frequency, activityLevel, gender, targetAreas, dob, height, environment, exerciseTypes, workoutLevel, physicalIssues } = body || {};

        if (!weight || !targetWeight) {
            return NextResponse.json({ error: 'weight and targetWeight required' }, { status: 400 });
        }

        const prompt = `あなたは優秀なパーソナルトレーナー「筋にくん」です。
ユーザーの詳細なプロフィール情報をもとに、個別のプランを計算・作成してください。

【ユーザーのプロフィール】
・性別：${gender || '不明'}
・生年月日：${dob || '不明'}
・身長：${height || '不明'} cm
・現在の体重：${weight} kg
・目標体重：${targetWeight} kg
・メインの目標：${goal}
・ターゲット部位：${targetAreas ? targetAreas.join(', ') : '指定なし'}
・トレーニング環境：${environment || '不明'}
・運動の種類の制限：${exerciseTypes ? exerciseTypes.join(', ') : 'なし'}
・希望する運動レベル：${workoutLevel || '不明'}
・身体の懸念事項（痛みなど）：${physicalIssues ? physicalIssues.join(', ') : 'なし'}
・運動頻度：${frequency || '不明'}
・普段の活動レベル：${activityLevel || '不明'}

この情報を総合的に分析し、健康的に「現在の体重から目標体重を達成するのにかかるおおよその予測日数（整数）」を算出してください。（例：活動レベルが低く頻度が少ない場合は期間を長めに、頻度が多い場合は短めに、ただし健康的なペース（減量なら月-5%体重以内、増量なら月+1~2kg程度）を厳守すること）。
また、「1日の目標摂取カロリー（kcal）」「目標タンパク質（g）」「目標脂質（g）」「目標炭水化物（g）」、および「このユーザーのプロフィール（制限や環境、目的）に完全に合わせた筋トレプランの具体例」を提案してください。

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
