export interface ExerciseDetail {
  image: string;
  icon: string;
  instructions: string[];
  images?: string[];
  gifUrl?: string;
  description?: string;
  targetTags?: string[];
  targetMuscles?: string[];
  mets?: number;
}

export const EXERCISE_LIBRARY: Record<string, ExerciseDetail> = {
  'プッシュアップ': { 
    image: '/exercises/pushup.png', icon: '/icons/pushup.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/3294.gif', 
    instructions: ['手は肩幅よりやや広めに開く', '体は一直線に保つ', '胸が床スレスレになるまで下げる'],
    description: '腕立て伏せです。胸や腕、肩などの上半身を全体的に鍛えることができる基本的な自重トレーニングです。',
    targetTags: ['胸部', '肩', '腕'],
    targetMuscles: ['chest', 'front-deltoids', 'triceps'],
    mets: 4.0
  },
  '腕立て伏せ': { 
    image: '/exercises/pushup.png', icon: '/icons/pushup.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/3294.gif', 
    instructions: ['手は肩幅よりやや広めに開く', '体は一直線に保つ', '胸が床スレスレになるまで下げる'],
    description: '腕立て伏せです。胸や腕、肩などの上半身を全体的に鍛えることができる基本的な自重トレーニングです。',
    targetTags: ['胸部', '肩', '腕'],
    targetMuscles: ['chest', 'front-deltoids', 'triceps'],
    mets: 4.0
  },
  'ダイアモンドプッシュアップ': { 
    image: '/exercises/pushup.png', icon: '/icons/pushup.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0283.gif', 
    instructions: ['両手でひし形を作る', '脇を締めて腕を曲げる', '上腕三頭筋を意識する'],
    description: '両手でひし形（ダイアモンド）を作り、腕立て伏せを行います。特に上腕三頭筋（二の腕）に強く効くトレーニングです。',
    targetTags: ['腕', '胸部'],
    targetMuscles: ['triceps', 'chest'],
    mets: 4.0
  },
  'パイクプッシュアップ': { 
    image: '/exercises/pushup.png', icon: '/icons/pushup.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/3294.gif', 
    instructions: ['お尻を高く上げ「く」の字になる', '頭を両手の間に下ろす', '肩周りの筋肉を意識する'],
    description: 'お尻を高く上げて行う腕立て伏せです。主に肩（三角筋）を鍛えるのに非常に効果的です。',
    targetTags: ['肩', '腕'],
    targetMuscles: ['front-deltoids', 'triceps'],
    mets: 4.0
  },
  'ベンチディップス': { 
    image: '/exercises/pushup.png', icon: '/icons/pushup.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0129.gif', 
    instructions: ['椅子や段差に手を後ろ手につく', '肘が90度になるまで腰を下ろす', '二の腕を意識して押し上げる'],
    description: '椅子などの段差を利用し、上腕三頭筋（二の腕）を集中的に鍛える種目です。',
    targetTags: ['腕', '肩'],
    targetMuscles: ['triceps', 'front-deltoids'],
    mets: 4.0
  },
  'スクワット': { 
    image: '/exercises/squat.png', icon: '/icons/squat.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/3543.gif', 
    instructions: ['足は肩幅に開く', 'お尻を後ろに引くようにしゃがむ', '膝が爪先より前に出すぎないように'],
    description: '下半身全体を鍛える「筋トレの王様」です。太ももやお尻の引き締めに効果的です。',
    targetTags: ['四頭筋', '臀筋', 'ハムストリング'],
    targetMuscles: ['quadriceps', 'gluteal', 'hamstring'],
    mets: 5.0
  },
  'ランジ': { 
    image: '/exercises/squat.png', icon: '/icons/squat.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/3470.gif', 
    instructions: ['足を前後に大きく開く', '前の膝が90度になるまで腰を落とす', '後ろの膝は床スレスレまで下げる'],
    description: '足を前後に開き、深く腰を落とす動作です。お尻や太ももの筋肉をピンポイントで鍛えられます。',
    targetTags: ['四頭筋', '臀筋', 'ハムストリング'],
    targetMuscles: ['quadriceps', 'gluteal', 'hamstring'],
    mets: 5.0
  },
  'ヒップブリッジ': { 
    image: '', icon: '/icons/plank.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/3561.gif', 
    instructions: ['仰向けになり膝を立てる', 'お尻を高く持ち上げる', 'お尻の筋肉をキュッと締める'],
    description: '仰向けから腰を持ち上げる動作で、お尻（大臀筋）を強く刺激するトレーニングです。',
    targetTags: ['臀筋', 'ハムストリング'],
    targetMuscles: ['gluteal', 'hamstring'],
    mets: 3.0
  },
  'カーフレイズ': { 
    image: '/exercises/squat.png', icon: '/icons/squat.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/1373.gif', 
    instructions: ['壁などに手をつき姿勢を安定させる', 'かかとを高く上げる', 'ふくらはぎを意識する'],
    description: 'かかとを上下させることで、ふくらはぎを鍛える種目です。足首の引き締めにも効果的。',
    targetTags: ['ふくらはぎ'],
    targetMuscles: ['calves'],
    mets: 3.0
  },
  'プランク': { 
    image: '/exercises/plank.png', icon: '/icons/plank.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0276.gif', 
    instructions: ['肩の下に肘をつく', '頭からかかとまで一直線にする', 'お腹とお尻に力を入れる'],
    description: '体幹（コア）を固定し、腹筋だけでなく全身の筋肉を使って姿勢をキープするトレーニングです。',
    targetTags: ['腹筋', '肩', '背中'],
    targetMuscles: ['abs', 'front-deltoids', 'lower-back'],
    mets: 3.0
  },
  'クランチ': { 
    image: '/exercises/crunch.png', icon: '/icons/plank.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0274.gif', 
    instructions: ['仰向けになり膝を立てる', 'おへそを覗き込むように上体を起こす', '反動を使わず腹筋を意識する'],
    description: '腹直筋の上部をターゲットにした、基本的な腹筋運動です。おへそを見るように上体を丸めます。',
    targetTags: ['腹筋'],
    targetMuscles: ['abs'],
    mets: 3.0
  },
  '腹筋': { 
    image: '/exercises/crunch.png', icon: '/icons/plank.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0274.gif', 
    instructions: ['仰向けになり膝を立てる', 'おへそを覗き込むように上体を起こす', '反動を使わず腹筋を意識する'],
    description: '腹直筋をターゲットにした基本的な腹筋運動です。',
    targetTags: ['腹筋'],
    targetMuscles: ['abs'],
    mets: 3.0
  },
  'ロシアン・ツイスト': { 
    image: '', icon: '/icons/plank.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0687.gif', 
    instructions: ['体育座りから上体を少し後ろへ倒す', '両手を胸の前で組み、左右に大きく捻る', '腹斜筋を意識する'],
    description: '上体を少し倒した状態から体を左右に捻ることで、脇腹（腹斜筋）を鍛えてくびれを作るトレーニングです。',
    targetTags: ['腹筋', '腹斜筋'],
    targetMuscles: ['abs', 'obliques'],
    mets: 3.0
  },
  'バイシクルクランチ': { 
    image: '', icon: '/icons/plank.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0003.gif', 
    instructions: ['仰向けになり自転車をこぐように脚を動かす', '対角の肘と膝を近づける', '腹筋全体をねじるように意識'],
    description: '自転車を漕ぐような動作と上体の捻りを組み合わせ、腹直筋と腹斜筋を同時に鍛えます。',
    targetTags: ['腹筋', '腹斜筋'],
    targetMuscles: ['abs', 'obliques'],
    mets: 3.0
  },
  'レッグレイズ': { 
    image: '', icon: '/icons/plank.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0001.gif', 
    instructions: ['仰向けになり足をまっすぐ伸ばす', '両足を揃えて高く持ち上げる', 'ゆっくりと下ろす（床にはつけない）'],
    description: '仰向けで両足を上下させる運動です。特に下腹部のぽっこり解消に効果的です。',
    targetTags: ['下腹部', '腹筋'],
    targetMuscles: ['abs', 'quadriceps'],
    mets: 3.0
  },
  'マウンテンクライマー': { 
    image: '', icon: '/icons/plank.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0259.gif', 
    instructions: ['腕立て伏せの姿勢からスタート', '走るように左右の膝を胸に引き寄せる', '腰が上がらないように注意'],
    description: '腕立て伏せの姿勢から足を交互に素早く引き寄せる、全身を使う有酸素運動かつ体幹トレーニングです。',
    targetTags: ['腹筋', '全身', '四頭筋'],
    targetMuscles: ['abs', 'quadriceps', 'front-deltoids'],
    mets: 8.0
  },
  'バーピー': { 
    image: '', icon: '/icons/squat.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/1160.gif', 
    instructions: ['しゃがんで両手を床につく', '両足を後ろに伸ばし腕立て伏せの姿勢', '足を戻して立ち上がりジャンプ'],
    description: '全身を大きく動かす、究極の高強度脂肪燃焼トレーニング（HIIT）の一つです。',
    targetTags: ['全身', '心肺機能'],
    targetMuscles: ['quadriceps', 'gluteal', 'chest', 'front-deltoids', 'abs'],
    mets: 8.0
  },
  'ジャンピングジャック': { 
    image: '', icon: '/icons/squat.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/3220.gif', 
    instructions: ['手足を大きく開いてジャンプ', '着地はやさしく', 'リズミカルに繰り返す'],
    description: '上にジャンプしながら脚を横に開き、両手を頭の上で合わせてから、脚を揃える最初の位置に戻して、両腕も身体の横に戻します。\n\nこのエクササイズは、大きな筋肉群を全て動かす全身のトレーニングです。',
    targetTags: ['肩', '四頭筋', '内転筋', 'ふくらはぎ'],
    targetMuscles: ['front-deltoids', 'quadriceps', 'adductor', 'calves'],
    mets: 8.0
  },
  'ハイニーズ': { 
    image: '', icon: '/icons/squat.png', gifUrl: '', 
    instructions: ['その場で太ももを高く上げて走る', '腕を大きく振る', '着地はやさしく'],
    description: 'その場で太ももを高く上げるもも上げダッシュです。心肺機能を高める有酸素運動です。',
    targetTags: ['全身', '四頭筋'],
    targetMuscles: ['quadriceps', 'calves', 'abs'],
    mets: 8.0
  },
  'スーパーマン': { 
    image: '', icon: '/icons/plank.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0803.gif', 
    instructions: ['うつ伏せになり手足をまっすぐ伸ばす', '両手両足を同時に床から持ち上げる', '背中とお尻の筋肉を意識する'],
    description: 'うつ伏せの姿勢から手足を同時に持ち上げることで、背筋や腰、お尻を鍛えるトレーニングです。',
    targetTags: ['背中', '臀筋'],
    targetMuscles: ['upper-back', 'lower-back', 'gluteal'],
    mets: 3.0
  },
  'バックエクステンション': { 
    image: '', icon: '/icons/plank.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0803.gif', 
    instructions: ['うつ伏せになり両手を頭の後ろへ', '上体をゆっくり反らせて起こす', '背中の筋肉を意識する'],
    description: '主に脊柱起立筋（背中から腰にかけての筋肉）を鍛え、美しい姿勢を作るのに役立ちます。',
    targetTags: ['背中', '腰'],
    targetMuscles: ['upper-back', 'lower-back'],
    mets: 3.0
  },
  'シザーズ': { 
    image: '', icon: '/icons/plank.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0003.gif', 
    instructions: ['仰向けになり足を少し浮かせる', '左右の足を交互に上下に交差させる', '下腹部の筋肉を意識する'],
    description: '仰向けの状態で両足を少し浮かせ、ハサミのように交互に動かすことで下腹部を鍛えます。',
    targetTags: ['腹筋', '下腹部'],
    targetMuscles: ['abs'],
    mets: 3.0
  },
  'ストレッチ': { 
    image: '/exercises/stretch.png', icon: '/icons/squat.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/1512.gif', 
    instructions: ['反動をつけずにゆっくり伸ばす', '痛気持ちいいところでキープする', '自然な呼吸を続ける'],
    description: '筋肉の緊張をほぐし、血流を良くすることで疲労回復や柔軟性の向上を促します。',
    targetTags: ['全身', '柔軟性'],
    targetMuscles: ['quadriceps', 'hamstring', 'chest'],
    mets: 2.0
  }
};

export const getExerciseDetails = (name: string): ExerciseDetail => {
  const match = Object.keys(EXERCISE_LIBRARY).find(k => name.includes(k));
  if (match) return EXERCISE_LIBRARY[match];
  return { 
    image: '', 
    icon: '/icons/squat.png', 
    instructions: ['正しいフォームを意識して行いましょう', '無理のない範囲で動作を続けます'],
    description: 'このエクササイズは、正しいフォームで行うことが重要です。',
    targetTags: ['全身'],
    targetMuscles: [],
    mets: 4.0 // デフォルトのMETs
  };
};

/**
 * 種目名、時間（または回数）、体重から消費カロリーを計算する
 * @param exerciseName 種目名
 * @param durationStr '00:30' または 'x15' などの文字列
 * @param reps 回数（durationStrがない場合に使用）
 * @param weightKg 体重(kg) デフォルト60
 * @returns 消費カロリー (kcal)
 */
export const calculateCalories = (exerciseName: string, durationStr?: string, reps?: number, weightKg: number = 60): number => {
  const details = getExerciseDetails(exerciseName);
  const mets = details.mets || 4.0;
  
  let seconds = 0;
  
  if (durationStr && durationStr.includes(':')) {
    // "00:30" 形式のパース
    const parts = durationStr.split(':');
    if (parts.length === 2) {
      seconds = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    }
  } else if (durationStr && durationStr.startsWith('x')) {
    // "x15" 形式のパース (1回あたり約3秒と仮定)
    const repsCount = parseInt(durationStr.substring(1), 10);
    if (!isNaN(repsCount)) {
      seconds = repsCount * 3;
    }
  } else if (reps && reps > 0) {
    // reps が直接指定されている場合
    seconds = reps * 3;
  }
  
  // デフォルト: 最低でも30秒として計算
  if (seconds <= 0) {
    seconds = 30;
  }
  
  const hours = seconds / 3600;
  const calories = mets * weightKg * hours * 1.05;
  
  // 少数第1位で四捨五入して最低1kcalとする
  return Math.max(1, Math.round(calories * 10) / 10);
};
