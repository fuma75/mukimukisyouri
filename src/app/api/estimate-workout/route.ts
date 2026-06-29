import { NextResponse } from 'next/server';
import { EXERCISE_LIBRARY } from '@/lib/exerciseDictionary';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { exercise, weight, reps, sets, durationMinutes, userWeight } = body || {};
        if (!exercise) return NextResponse.json({ error: 'exercise required' }, { status: 400 });

        // 1. エクササイズに応じた METs 値の決定 (デフォルトは 4.0: 中強度の自重筋トレ)
        let mets = 4.0;
        const detail = EXERCISE_LIBRARY[exercise];
        if (detail && detail.mets) {
            mets = detail.mets;
        } else {
            // キーの部分一致検索
            const matchedKey = Object.keys(EXERCISE_LIBRARY).find(k => k.includes(exercise) || exercise.includes(k));
            if (matchedKey && EXERCISE_LIBRARY[matchedKey].mets) {
                mets = EXERCISE_LIBRARY[matchedKey].mets!;
            }
        }

        // 2. 運動時間(分)の決定
        let minutes = Number(durationMinutes);
        if (!minutes || isNaN(minutes)) {
            // 時間の指定がない場合は、セット数とレップ数から推定
            const s = Number(sets) || 3;
            const r = Number(reps) || 10;
            // 1レップあたり3秒、セット間インターバル60秒として算出
            const estSeconds = (s * r * 3) + (Math.max(0, s - 1) * 60);
            minutes = Math.max(2, Math.round(estSeconds / 60)); // 最低2分
        }

        // 3. ユーザー体重の決定 (デフォルト65kg)
        const weightKg = Number(userWeight) || Number(weight) || 65;

        // 4. 消費カロリー計算 (METs × 体重(kg) × 時間(時間) × 1.05)
        const calories = Math.round(mets * weightKg * (minutes / 60) * 1.05);

        const result = {
            calories,
            userWeightKg: weightKg
        };

        return NextResponse.json({ ok: true, result });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'calculation failed', detail: String(err) }, { status: 500 });
    }
}
