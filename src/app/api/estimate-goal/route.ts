import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { weight, targetWeight, goal, frequency, activityLevel, gender, targetAreas, dob, height, environment, exerciseTypes, workoutLevel, physicalIssues } = body || {};

        if (!weight || !targetWeight) {
            return NextResponse.json({ error: 'weight and targetWeight required' }, { status: 400 });
        }

        // 1. 年齢の算出 (生年月日から計算、デフォルト30歳)
        let age = 30;
        if (dob) {
            const birthDate = new Date(dob);
            const today = new Date();
            if (!isNaN(birthDate.getTime())) {
                age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
            }
        }

        // 2. 身長 (デフォルト170cm)
        const userHeight = Number(height) || 170;
        const userWeight = Number(weight);
        const userTargetWeight = Number(targetWeight);

        // 3. 基礎代謝(BMR)の計算 (ミフリン・セントジョール方程式)
        let BMR = 0;
        const isFemale = gender === 'female' || gender === '女性';
        if (isFemale) {
            BMR = 10 * userWeight + 6.25 * userHeight - 5 * age - 161;
        } else {
            BMR = 10 * userWeight + 6.25 * userHeight - 5 * age + 5;
        }

        // 4. 活動係数の決定
        let activityFactor = 1.2;
        const level = (activityLevel || frequency || '').toLowerCase();
        if (level.includes('ほぼ運動しない') || level.includes('なし') || level.includes('sedentary') || level.includes('low')) {
            activityFactor = 1.2;
        } else if (level.includes('週1') || level.includes('週1〜3') || level.includes('light') || level.includes('少ない')) {
            activityFactor = 1.375;
        } else if (level.includes('週3') || level.includes('週3〜5') || level.includes('moderate') || level.includes('普通')) {
            activityFactor = 1.55;
        } else if (level.includes('週6') || level.includes('active') || level.includes('多い')) {
            activityFactor = 1.725;
        } else if (level.includes('毎日') || level.includes('very active') || level.includes('ハード')) {
            activityFactor = 1.9;
        }

        // 消費カロリー(TDEE)
        const TDEE = BMR * activityFactor;

        // 5. 目標による調整 (targetCalories)
        let calories = Math.round(TDEE);
        let dailyDeficitOrSurplus = 0; // 1日あたりのカロリー差分

        const isGain = goal === '筋肥大' || goal === 'bulking' || goal === 'gain';
        const isLose = goal === '減量' || goal === 'diet' || goal === 'lose';

        if (isGain) {
            calories = Math.round(TDEE + 400); // 筋肥大: TDEE + 300〜500 (400を採用)
            dailyDeficitOrSurplus = 400;
        } else if (isLose) {
            calories = Math.round(TDEE - 400); // 減量: TDEE - 300〜500 (400を採用)
            dailyDeficitOrSurplus = 400;
        } else {
            calories = Math.round(TDEE); // 維持: TDEE
            dailyDeficitOrSurplus = 0;
        }

        // 6. 目標体重まで何日か (脂肪1kg = 7700kcal)
        const weightDiff = Math.abs(userWeight - userTargetWeight);
        const totalTargetKcal = weightDiff * 7700;
        
        let estimatedDays = 0;
        if (dailyDeficitOrSurplus > 0 && weightDiff > 0) {
            estimatedDays = Math.round(totalTargetKcal / dailyDeficitOrSurplus);
        } else {
            // 維持目標、または現在と同じ体重の場合は30日目安
            estimatedDays = 30;
        }

        // 最低/最高値のセーフガード
        if (calories < 1200) calories = 1200; // 最低必要カロリー保証

        // 7. PFCマクロ自動計算
        // P: 体重×2g
        const protein = Math.round(userWeight * 2);
        // F: 総カロリーの25%
        const fat = Math.round((calories * 0.25) / 9);
        // C: 残りすべて
        const proteinKcal = protein * 4;
        const fatKcal = fat * 9;
        const carbKcal = Math.max(0, calories - proteinKcal - fatKcal);
        const carb = Math.round(carbKcal / 4);

        // 8. 難易度の判定 (easy = 簡単に始められる / medium = 軽い汗をかく / hard = 少しやりごたえがある)
        const levelStr = (workoutLevel || '').toLowerCase();
        let userLevel = 'medium';
        if (levelStr.includes('簡単') || levelStr.includes('初級') || levelStr.includes('beginner') || levelStr.includes('easy')) {
            userLevel = 'easy';
        } else if (levelStr.includes('やりごたえ') || levelStr.includes('上級') || levelStr.includes('advanced') || levelStr.includes('hard')) {
            userLevel = 'hard';
        }

        const isGym = environment === 'ジム' || environment === 'gym';
        const targetArea = targetAreas && targetAreas.length > 0 ? targetAreas[0] : '全身';

        let planTitle = `${frequency || '週3回'} ${environment || '自宅'}で${goal || '健康維持'}プラン`;
        let planDesc = `あなたの目標「${goal || '健康維持'}」に向けて、${environment || '自宅'}で安全かつ効果的に行えるメニューを設計しました！熱くやり抜こう！`;
        
        let planExercises = [];

        if (userLevel === 'easy') {
            planExercises = [
                { "name": "全身脂肪燃焼 (初級)", "sets": "難易度: 初級", "reps": "約6分" }
            ];
        } else if (userLevel === 'hard') {
            planExercises = [
                { "name": "全身脂肪燃焼 (上級)", "sets": "難易度: 上級", "reps": "約12分" }
            ];
        } else {
            planExercises = [
                { "name": "全身脂肪燃焼 (中級)", "sets": "難易度: 中級", "reps": "約8分" }
            ];
        }

        const result = {
            estimatedDays,
            calories,
            protein,
            fat,
            carb,
            samplePlan: {
                title: planTitle,
                description: planDesc,
                exercises: planExercises
            }
        };

        return NextResponse.json({ ok: true, result });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'calculation failed', detail: String(err) }, { status: 500 });
    }
}
