import { NextResponse } from 'next/server';
import { callGemini } from '@/lib/gemini';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { category, goal, environment, profile } = body || {};
        if (!category) return NextResponse.json({ error: 'category required' }, { status: 400 });

        let envInstruction = '';
        if (environment === '家トレ') {
            envInstruction = '自宅でできる自重トレーニングや、特別な器具（ダンベル等）がなくても可能な種目を提案してください。';
        } else if (environment === 'ジムトレ') {
            envInstruction = 'ジムにある本格的なマシンやフリーウェイトを利用した効果的な種目を提案してください。';
        }

        let profileInstruction = '';
        if (profile) {
            profileInstruction = `
ユーザーのプロフィール情報：
- 年齢・性別: ${profile.age || '不明'}歳 ${profile.gender || '不明'}
- 現在の体重: ${profile.weight || '不明'}kg
- 目標体重: ${profile.targetWeight || '不明'}kg
- 身長: ${profile.height || '不明'}cm
- 体の痛み・不安: ${profile.physicalIssues ? profile.physicalIssues.join('、') : '特になし'}
- 普段の活動レベル: ${profile.activityLevel || '不明'}
このユーザーの身体情報や不安箇所を最大限考慮して、無理のない最適な負荷（重量・回数）や種目を選定してください。`;
        }

        const prompt = `あなたは熱血パーソナルトレーナー「筋にくん」です。ユーザーのトレーニング部位：${category}、フィットネス目標：${goal || 'maintain'}に合わせた、今日行うべき筋トレメニューを提案してください。
${envInstruction}
${profileInstruction}
必ず以下のキーを持つ有効なJSONオブジェクト1件のみを返してください。余計なコードブロックマークアップ（\`\`\`json等）や余分なテキストは一切含めないでください。
JSON形式：
{
  "warmup": [
    {
      "exercise": "種目名（例: ジャンピングジャック）",
      "duration": "00:30",
      "instructions": ["やり方のポイント1", "やり方のポイント2"]
    }
  ],
  "training": [
    {
      "exercise": "種目名（例: ベンチプレス）",
      "weight": 推奨重量kg（自重の場合は0）,
      "reps": 推奨回数,
      "sets": 推奨セット数,
      "duration": "00:30",
      "calories": 推定消費カロリーkcal,
      "instructions": ["やり方のポイント1", "やり方のポイント2"]
    }
  ],
  "cooldown": [
    {
      "exercise": "種目名（例: ストレッチ）",
      "duration": "00:30",
      "instructions": ["やり方のポイント1", "やり方のポイント2"]
    }
  ]
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
