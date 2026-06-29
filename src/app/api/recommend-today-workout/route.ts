import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { category, goal, environment, profile } = body || {};
        if (!category) return NextResponse.json({ error: 'category required' }, { status: 400 });

        const isGym = environment === 'ジムトレ' || environment === 'ジム';
        const userLevel = (profile?.workoutLevel || '中級').toLowerCase();
        const noJumps = profile?.exerciseTypes?.includes('ジャンプ禁止') || profile?.exerciseTypes?.includes('ジャンプなし') || profile?.physicalIssues?.some((i: string) => i.includes('膝') || i.includes('足首'));
        const upperInjury = profile?.physicalIssues?.some((i: string) => i.includes('肩') || i.includes('手首') || i.includes('腕'));

        // ウォームアップ
        let warmup = [
            { exercise: 'ジャンピングジャック', duration: '00:30', instructions: ['軽く跳ねて両手両足を開く', 'リズミカルに行う'] },
            { exercise: 'ハイニーズ', duration: '00:30', instructions: ['背筋を伸ばし、膝を高く上げる', '腕をしっかり振る'] }
        ];

        // クールダウン
        let cooldown = [
            { exercise: 'ストレッチ', duration: '00:30', instructions: ['使った筋肉をゆっくり伸ばす', '深呼吸をしながら行う'] },
            { exercise: 'ストレッチ', duration: '00:30', instructions: ['反動をつけずにじっくり伸ばす', '痛みが出ない範囲で行う'] }
        ];

        let training = [];

        // カテゴリ（部位）と環境に応じた基本トレーニング種目の決定
        if (isGym) {
            // ジムメニュー
            if (category === '胸' || category === '上半身') {
                training = [
                    { exercise: 'ベンチプレス (胸)', weight: 30, reps: 10, sets: 3, duration: '00:30', calories: 20, instructions: ['肩甲骨を寄せてバーベルを下ろす', '足裏でしっかり床を踏ん張る'] },
                    { exercise: 'チェストプレス (マシン)', weight: 25, reps: 12, sets: 3, duration: '00:30', calories: 15, instructions: ['胸の高さでグリップを押し出す', 'ゆっくり戻す動作も意識する'] },
                    { exercise: 'ダンベルフライ (大胸筋)', weight: 8, reps: 12, sets: 3, duration: '00:30', calories: 15, instructions: ['大きな円を描くようにダンベルを広げる', '胸のストレッチ感を意識する'] }
                ];
            } else if (category === '背中') {
                training = [
                    { exercise: 'ラットプルダウン (背中)', weight: 30, reps: 12, sets: 3, duration: '00:30', calories: 18, instructions: ['バーを引き寄せるときに胸を張る', '背中の広背筋を収縮させる'] },
                    { exercise: 'シーテッドローイング (背中)', weight: 25, reps: 12, sets: 3, duration: '00:30', calories: 18, instructions: ['骨盤を立ててお腹に引き寄せる', '肩甲骨を寄せるように引く'] },
                    { exercise: 'バックエクステンション (腰)', weight: 0, reps: 15, sets: 3, duration: '00:30', calories: 10, instructions: ['腰を反らしすぎないように上体を起こす', '臀部とハムストリングスも意識する'] }
                ];
            } else if (category === '脚' || category === '下半身') {
                training = [
                    { exercise: 'バーベルスクワット (脚)', weight: 40, reps: 8, sets: 3, duration: '00:30', calories: 25, instructions: ['お尻を後ろに引くようにしゃがむ', '膝とつま先を同じ方向にする'] },
                    { exercise: 'レッグプレス (太もも)', weight: 60, reps: 12, sets: 3, duration: '00:30', calories: 20, instructions: ['足の裏全体でプレートを押す', '膝を伸ばしきらないように注意'] },
                    { exercise: 'レッグカール (裏もも)', weight: 20, reps: 12, sets: 3, duration: '00:30', calories: 12, instructions: ['かかとをお尻に引き寄せるように曲げる', 'もも裏の収縮を意識する'] }
                ];
            } else if (category === '腹筋') {
                training = [
                    { exercise: 'アブドミナルクランチ', weight: 15, reps: 15, sets: 3, duration: '00:30', calories: 10, instructions: ['お腹を丸めるようにマシンを倒す', 'ゆっくり元の位置に戻す'] },
                    { exercise: 'ハンギングレッグレイズ', weight: 0, reps: 12, sets: 3, duration: '00:30', calories: 12, instructions: ['ぶら下がった状態から両脚を持ち上げる', '下腹部の筋肉を強く意識する'] },
                    { exercise: 'プランク (体幹)', weight: 0, reps: 0, sets: 3, duration: '00:30', calories: 8, instructions: ['体を床と並行に一直線にキープ', 'お腹とお尻に力を入れる'] }
                ];
            } else {
                // 全身、またはその他
                training = [
                    { exercise: 'バーベルスクワット (脚)', weight: 30, reps: 10, sets: 3, duration: '00:30', calories: 22, instructions: ['下半身全体を使う基本のスクワット', '腰が丸まらないように注意'] },
                    { exercise: 'チェストプレス (マシン) (胸)', weight: 25, reps: 12, sets: 3, duration: '00:30', calories: 15, instructions: ['大胸筋に刺激を与えるプレス運動'] },
                    { exercise: 'ラットプルダウン (背中)', weight: 25, reps: 12, sets: 3, duration: '00:30', calories: 15, instructions: ['背中全体の筋肉をバランスよく鍛える'] }
                ];
            }
        } else {
            // 自宅メニュー (家トレ)
            if (category === '胸' || category === '上半身') {
                training = [
                    { exercise: 'プッシュアップ (胸)', weight: 0, reps: 12, sets: 3, duration: '00:30', calories: 12, instructions: ['肩幅よりやや広く手をつく', '体幹を締め、床スレスレまで胸を下ろす'] },
                    { exercise: 'ダイアモンドプッシュアップ', weight: 0, reps: 10, sets: 3, duration: '00:30', calories: 12, instructions: ['両手の親指と人差し指でひし形を作る', '上腕三頭筋に強く効く'] },
                    { exercise: 'リバースプッシュアップ (腕)', weight: 0, reps: 12, sets: 3, duration: '00:30', calories: 10, instructions: ['椅子などを背にして手をつく', '肘を90度まで曲げて腰を下ろす'] }
                ];
            } else if (category === '背中') {
                training = [
                    { exercise: 'タオルラットプルダウン', weight: 0, reps: 15, sets: 3, duration: '00:30', calories: 8, instructions: ['タオルを両手で外側に引っ張りながら引く', '背中の肩甲骨同士を寄せる'] },
                    { exercise: 'バックエクステンション (背中)', weight: 0, reps: 15, sets: 3, duration: '00:30', calories: 8, instructions: ['うつ伏せになり、ゆっくり上体を起こす', '腰を反らしすぎないようお尻を締める'] },
                    { exercise: 'プランク (背中・お腹)', weight: 0, reps: 0, sets: 3, duration: '00:30', calories: 8, instructions: ['体幹を一枚の板のように一直線に保つ'] }
                ];
            } else if (category === '脚' || category === '下半身') {
                training = [
                    { exercise: '自重スクワット (脚)', weight: 0, reps: 15, sets: 3, duration: '00:30', calories: 15, instructions: ['足裏全体で床を押して立ち上がる', '太ももとお尻を強く意識する'] },
                    { exercise: 'リバースランジ (もも裏)', weight: 0, reps: 12, sets: 3, duration: '00:30', calories: 12, instructions: ['一歩大きく後ろに引き、深く腰を落とす', '前の脚の臀部に効かせる'] },
                    { exercise: 'カーフレイズ (ふくらはぎ)', weight: 0, reps: 20, sets: 3, duration: '00:30', calories: 8, instructions: ['かかとをできるだけ高く持ち上げる', '足首を引き締める効果'] }
                ];
            } else if (category === '腹筋') {
                training = [
                    { exercise: 'クランチ (お腹上部)', weight: 0, reps: 15, sets: 3, duration: '00:30', calories: 10, instructions: ['おへそを見るように背中を丸めながら起こす', '首の力ではなく腹筋を意識'] },
                    { exercise: 'レッグレイズ (下腹部)', weight: 0, reps: 12, sets: 3, duration: '00:30', calories: 10, instructions: ['仰向けでゆっくり脚を上げ下げする', '腰が浮かないように押し付ける'] },
                    { exercise: 'プランク (体幹)', weight: 0, reps: 0, sets: 3, duration: '00:30', calories: 8, instructions: ['お腹とお尻に力を入れ姿勢を維持する'] }
                ];
            } else {
                // 全身、またはその他
                training = [
                    { exercise: '自重スクワット (脚)', weight: 0, reps: 15, sets: 3, duration: '00:30', calories: 15, instructions: ['下半身全体をバランスよく引き締める'] },
                    { exercise: 'プッシュアップ (胸)', weight: 0, reps: 12, sets: 3, duration: '00:30', calories: 12, instructions: ['胸と二の腕の筋肉を鍛える'] },
                    { exercise: 'プランク (体幹)', weight: 0, reps: 0, sets: 3, duration: '00:30', calories: 8, instructions: ['全身のインナーマッスルを強化する'] }
                ];
            }
        }

        // 痛み・不安情報による調整（怪我対応）
        if (noJumps) {
            warmup[0] = { exercise: 'スクワット', duration: '00:30', instructions: ['ゆっくりしゃがんで立ち上がる', '関節を温める'] };
        }
        if (upperInjury) {
            // 上半身に怪我がある場合：プッシュアップ等をプランクやクランチに変換
            training = training.map(t => {
                if (t.exercise.includes('プッシュアップ') || t.exercise.includes('プレス')) {
                    return { exercise: 'クランチ', weight: 0, reps: 15, sets: 3, duration: '00:30', calories: 10, instructions: ['お腹に意識を集中させて丸める', '体に負担の少ない腹筋運動'] };
                }
                return t;
            });
        }

        // 難易度(レベル)による回数・セット数・時間の調整
        const isEasy = userLevel.includes('簡単') || userLevel.includes('初級') || userLevel.includes('easy');
        const isHard = userLevel.includes('やりごたえ') || userLevel.includes('上級') || userLevel.includes('hard');

        if (isEasy) {
            training = training.map(t => ({
                ...t,
                sets: 2,
                reps: t.reps ? Math.max(6, Math.round(t.reps * 0.7)) : 0,
                duration: t.duration === '00:30' ? '00:20' : t.duration,
                calories: Math.max(5, Math.round(t.calories * 0.7))
            }));
            warmup = warmup.map(w => ({ ...w, duration: '00:20' }));
        } else if (isHard) {
            training = training.map(t => ({
                ...t,
                sets: 4,
                reps: t.reps ? Math.round(t.reps * 1.3) : 0,
                duration: t.duration === '00:30' ? '00:45' : t.duration,
                calories: Math.round(t.calories * 1.4)
            }));
            // 上級の場合はハードな種目を1つ追加
            training.push({
                exercise: noJumps ? 'スクワットホールド' : 'バーピージャンプ',
                weight: 0,
                reps: noJumps ? 0 : 10,
                sets: 3,
                duration: '00:45',
                calories: 25,
                instructions: noJumps ? ['腰を落としたまま姿勢をキープする'] : ['ジャンプしてから素早く腕立て姿勢になる', '全身のスタミナを強化する']
            });
        }

        const result = {
            warmup,
            training,
            cooldown
        };

        return NextResponse.json({ ok: true, result });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'calculation failed', detail: String(err) }, { status: 500 });
    }
}
