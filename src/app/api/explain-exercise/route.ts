import { NextResponse } from 'next/server';
import { EXERCISE_LIBRARY } from '@/lib/exerciseDictionary';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { exercise } = body || {};
        if (!exercise) return NextResponse.json({ error: 'exercise required' }, { status: 400 });

        // 1. 辞書からエクササイズ情報を取得
        const detail = EXERCISE_LIBRARY[exercise];

        let explanation = "";

        if (detail) {
            const steps = detail.instructions.map((inst, i) => `${i + 1}. ${inst}！`).join('\n');
            const targets = detail.targetTags ? detail.targetTags.join('、') : '全身';
            
            explanation = `パワーー！！『${exercise}』だな！
${detail.description || '素晴らしい種目だ！'}

【正しいやり方＆フォームの注意点】
${steps}

【効果のある部位】
👉 ${targets} にバチバチ効くぞ！

さあ、筋肉の声を聞きながら、1回1回を大切に限界を超えていこう！おい、俺の筋肉、やるのかい、やらないのかい、どっちなんだい！？やるーー！！`;
        } else {
            // 辞書にない未知の種目の場合の汎用熱血テキスト
            explanation = `パワーー！！『${exercise}』に挑戦するんだな！素晴らしい！

【フォームの注意点】
1. 常に体幹（コア）を意識してお腹に力を入れること！
2. 反動を使わずに、ターゲットの筋肉を意識してゆっくり動かすこと！
3. 呼吸を止めずに、筋肉が縮む時に息を吐くこと！

【効果】
全身の代謝を爆上げし、最高のボディメイクに繋がるぞ！

さあ、限界の先にある新しい自分に会いに行こう！おい、俺の筋肉、やるのかい、やらないのかい、どっちなんだい！？やるーー！！`;
        }

        return NextResponse.json({ ok: true, text: explanation });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'calculation failed', detail: String(err) }, { status: 500 });
    }
}
