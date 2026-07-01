import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { category, goal, environment, profile } = body || {};
        if (!category) return NextResponse.json({ error: 'category required' }, { status: 400 });

        const isGym = environment === 'ジムトレ' || environment === 'ジム';
        const userLevel = (profile?.workoutLevel || '中級').toLowerCase();
        
        const exerciseTypes = profile?.exerciseTypes || [];
        const canDoAnything = exerciseTypes.includes('なし') || exerciseTypes.includes('なし（何でもできる）');
        const isBodyweightOnly = exerciseTypes.includes('器具無し') || exerciseTypes.includes('器具無し（自重のみ）');
        const isLyingDownOnly = exerciseTypes.includes('寝たままの運動') || exerciseTypes.includes('寝たままの運動（負担軽減）');
        const noJumps = exerciseTypes.includes('ジャンプ無し') || exerciseTypes.includes('ジャンプ禁止') || exerciseTypes.includes('ジャンプなし') || profile?.physicalIssues?.some((i: string) => i.includes('膝') || i.includes('足首'));
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

        // カテゴリ（部位）と環境・制限に応じたトレーニング種目の決定
        if (isLyingDownOnly) {
            // 寝たままできる負担軽減メニュー
            if (category === '胸' || category === '上半身') {
                training = [
                    { exercise: 'フロアプレス (胸)', weight: 0, reps: 15, sets: 3, duration: '00:30', calories: 10, instructions: ['仰向けになり、両手で空気を押し上げる', '胸の筋肉を意識する'] },
                    { exercise: 'ライイング・トライセプス', weight: 0, reps: 15, sets: 3, duration: '00:30', calories: 8, instructions: ['仰向けで両手を上げ、肘を曲げ伸ばす', '二の腕を意識する'] },
                    { exercise: 'アームサークル', weight: 0, reps: 20, sets: 3, duration: '00:30', calories: 8, instructions: ['仰向けで両腕を大きく回す', '肩周りをほぐす'] }
                ];
            } else if (category === '背中') {
                training = [
                    { exercise: 'ライイング・プルダウン', weight: 0, reps: 15, sets: 3, duration: '00:30', calories: 8, instructions: ['うつ伏せになり、両手でエアプルダウン', '肩甲骨を寄せる'] },
                    { exercise: 'スーパーマン (背中)', weight: 0, reps: 12, sets: 3, duration: '00:30', calories: 10, instructions: ['うつ伏せで手足を軽く浮かせる', '腰に無理のない範囲で行う'] },
                    { exercise: 'ヒップリフト', weight: 0, reps: 15, sets: 3, duration: '00:30', calories: 8, instructions: ['仰向けで膝を立て、お尻を浮かせる', '背中下部とお尻に効かせる'] }
                ];
            } else if (category === '脚' || category === '下半身') {
                training = [
                    { exercise: 'ヒップリフト (お尻・もも裏)', weight: 0, reps: 15, sets: 3, duration: '00:30', calories: 12, instructions: ['仰向けで膝を立て、お尻を高く上げる', 'もも裏とお尻の収縮を意識'] },
                    { exercise: 'ライイング・レッグアブダクション', weight: 0, reps: 15, sets: 3, duration: '00:30', calories: 10, instructions: ['横向きに寝て、上側の脚を上げる', 'お尻の横の筋肉を使う'] },
                    { exercise: 'ドンキーキック (膝立ち)', weight: 0, reps: 15, sets: 3, duration: '00:30', calories: 10, instructions: ['四つん這いになり、片脚を後ろに蹴り上げる', 'お尻に集中する'] }
                ];
            } else if (category === '腹筋') {
                training = [
                    { exercise: 'クランチ (お腹上部)', weight: 0, reps: 15, sets: 3, duration: '00:30', calories: 10, instructions: ['仰向けで膝を曲げ、おへそを覗き込む'] },
                    { exercise: 'レッグレイズ (下腹部)', weight: 0, reps: 12, sets: 3, duration: '00:30', calories: 10, instructions: ['仰向けで脚を伸ばしたまま上下させる'] },
                    { exercise: 'デッドバグ', weight: 0, reps: 12, sets: 3, duration: '00:30', calories: 8, instructions: ['仰向けで対角の手足をゆっくり下ろす', '腰が浮かないようにする'] }
                ];
            } else {
                training = [
                    { exercise: 'ヒップリフト', weight: 0, reps: 15, sets: 3, duration: '00:30', calories: 12, instructions: ['下半身と体幹を鍛える'] },
                    { exercise: 'フロアプレス', weight: 0, reps: 15, sets: 3, duration: '00:30', calories: 10, instructions: ['上半身の筋肉を刺激する'] },
                    { exercise: 'クランチ', weight: 0, reps: 15, sets: 3, duration: '00:30', calories: 10, instructions: ['お腹周りを引き締める'] }
                ];
            }
        } else if (canDoAnything) {
            // 何でもできる（ダンベルと自重） - バーベルやマシンは除外
            if (category === '胸' || category === '上半身') {
                training = [
                    { exercise: 'ダンベルプレス (胸)', weight: 10, reps: 10, sets: 3, duration: '00:30', calories: 18, instructions: ['仰向けになりダンベルを押し上げる', '胸の筋肉の収縮を感じる'] },
                    { exercise: 'プッシュアップ (胸)', weight: 0, reps: 12, sets: 3, duration: '00:30', calories: 12, instructions: ['体幹を締め、床スレスレまで胸を下ろす'] },
                    { exercise: 'ダンベルフライ (大胸筋)', weight: 8, reps: 12, sets: 3, duration: '00:30', calories: 15, instructions: ['大きな円を描くようにダンベルを広げる', '胸のストレッチ感を意識する'] }
                ];
            } else if (category === '背中') {
                training = [
                    { exercise: 'ワンアーム・ダンベルロウ', weight: 10, reps: 12, sets: 3, duration: '00:30', calories: 15, instructions: ['片手と片膝をベンチや椅子につき、ダンベルを引き上げる', '肩甲骨を寄せる'] },
                    { exercise: 'ダンベル・デッドリフト', weight: 15, reps: 10, sets: 3, duration: '00:30', calories: 18, instructions: ['背中をまっすぐにして腰から曲げる', 'もも裏と背中を意識'] },
                    { exercise: 'バックエクステンション (腰)', weight: 0, reps: 15, sets: 3, duration: '00:30', calories: 10, instructions: ['腰を反らしすぎないように上体を起こす'] }
                ];
            } else if (category === '脚' || category === '下半身') {
                training = [
                    { exercise: 'ゴブレットスクワット (ダンベル)', weight: 12, reps: 12, sets: 3, duration: '00:30', calories: 20, instructions: ['ダンベルを胸の前に持ち、深くしゃがむ', '背筋をまっすぐに保つ'] },
                    { exercise: 'ダンベルランジ', weight: 8, reps: 10, sets: 3, duration: '00:30', calories: 18, instructions: ['両手にダンベルを持ち、片脚を前に出す', '後ろの膝が床スレスレになるまで下げる'] },
                    { exercise: 'カーフレイズ (ダンベル)', weight: 10, reps: 15, sets: 3, duration: '00:30', calories: 10, instructions: ['両手にダンベルを持ち、かかとを高く上げる'] }
                ];
            } else if (category === '腹筋') {
                training = [
                    { exercise: 'ダンベル・ロシアンツイスト', weight: 5, reps: 20, sets: 3, duration: '00:30', calories: 12, instructions: ['ダンベルを持ち、お腹を捻る', '腹斜筋に効かせる'] },
                    { exercise: 'クランチ (お腹上部)', weight: 0, reps: 15, sets: 3, duration: '00:30', calories: 10, instructions: ['おへそを見るように背中を丸めながら起こす'] },
                    { exercise: 'プランク (体幹)', weight: 0, reps: 0, sets: 3, duration: '00:30', calories: 8, instructions: ['体を床と並行に一直線にキープ'] }
                ];
            } else {
                training = [
                    { exercise: 'ゴブレットスクワット', weight: 12, reps: 12, sets: 3, duration: '00:30', calories: 20, instructions: ['下半身全体を使うスクワット'] },
                    { exercise: 'ダンベルプレス', weight: 10, reps: 10, sets: 3, duration: '00:30', calories: 18, instructions: ['大胸筋に刺激を与える'] },
                    { exercise: 'ワンアーム・ダンベルロウ', weight: 10, reps: 12, sets: 3, duration: '00:30', calories: 15, instructions: ['背中全体を鍛える'] }
                ];
            }
        } else {
            // 器具無し（自重のみ） およびデフォルトの家トレ
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
