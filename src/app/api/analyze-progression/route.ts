import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { exercise, goal, history } = body || {};
        if (!exercise) return NextResponse.json({ error: 'exercise required' }, { status: 400 });

        // 1. 過去の最新履歴を取得
        const lastSession = history && history.length > 0 ? history[history.length - 1] : null;
        
        let lastWeight = 0;
        let lastReps = 10;
        let lastSets = 3;

        if (lastSession) {
            lastWeight = Number(lastSession.weight) || 0;
            lastReps = Number(lastSession.reps) || 10;
            lastSets = Number(lastSession.sets) || 3;
        }

        // 2. プログレッシブ・オーバーロードの法則に沿って次回目標を算出
        let recommendedWeight = lastWeight;
        let recommendedReps = lastReps;
        let recommendedSets = lastSets;

        if (lastWeight === 0) {
            // 自重トレーニングの場合は回数を増やす (+2回)
            recommendedReps = lastReps + 2;
            if (recommendedReps > 20) {
                // 回数が20回を超える場合は、セット数を増やす
                recommendedReps = 15;
                recommendedSets = lastSets + 1;
            }
        } else {
            // ウエイトトレーニングの場合は重量を少し増やす (+2.5kg)
            recommendedWeight = lastWeight + 2.5;
        }

        // 3. 熱血アドバイスメッセージの自動生成
        let targetText = recommendedWeight > 0 ? `${recommendedWeight}kg` : '自重';
        let message = `パワー！💪 前回『${exercise}』をやり切った君なら、次回はこの限界を超えられる！
次は【${targetText} × ${recommendedReps}回 × ${recommendedSets}セット】に挑戦だ！

前回の記録をほんの少しでも更新し続けること（漸進的過負荷の原則）が、強い筋肉と引き締まった体を作る唯一無二の黄金律！
限界を決めるのは自分の心だけだ！さあ、おい俺の筋肉、やるのかい、やらないのかい、どっちなんだい！？やるーー！！`;

        const result = {
            recommendedWeight,
            recommendedReps,
            recommendedSets,
            message
        };

        return NextResponse.json({ ok: true, result });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'calculation failed', detail: String(err) }, { status: 500 });
    }
}
