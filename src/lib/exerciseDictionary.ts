export interface ExerciseDetail {
  image: string;
  icon: string;
  instructions: string[];
  images?: string[];
  gifUrl?: string;
  description?: string;
  targetTags?: string[];
  targetMuscles?: string[];
}

export const EXERCISE_LIBRARY: Record<string, ExerciseDetail> = {
  'プッシュアップ': { 
    image: '/exercises/pushup.png', icon: '/icons/pushup.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/3294.gif', 
    instructions: ['手は肩幅よりやや広めに開く', '体は一直線に保つ', '胸が床スレスレになるまで下げる'],
    description: '腕立て伏せです。胸や腕、肩などの上半身を全体的に鍛えることができる基本的な自重トレーニングです。',
    targetTags: ['胸部', '肩', '腕'],
    targetMuscles: ['chest', 'front-deltoids', 'triceps']
  },
  '腕立て伏せ': { 
    image: '/exercises/pushup.png', icon: '/icons/pushup.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/3294.gif', 
    instructions: ['手は肩幅よりやや広めに開く', '体は一直線に保つ', '胸が床スレスレになるまで下げる'],
    description: '腕立て伏せです。胸や腕、肩などの上半身を全体的に鍛えることができる基本的な自重トレーニングです。',
    targetTags: ['胸部', '肩', '腕'],
    targetMuscles: ['chest', 'front-deltoids', 'triceps']
  },
  'ダイアモンドプッシュアップ': { 
    image: '/exercises/pushup.png', icon: '/icons/pushup.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0283.gif', 
    instructions: ['両手でひし形を作る', '脇を締めて腕を曲げる', '上腕三頭筋を意識する'],
    description: '両手でひし形（ダイアモンド）を作り、腕立て伏せを行います。特に上腕三頭筋（二の腕）に強く効くトレーニングです。',
    targetTags: ['腕', '胸部'],
    targetMuscles: ['triceps', 'chest']
  },
  'パイクプッシュアップ': { 
    image: '/exercises/pushup.png', icon: '/icons/pushup.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/3294.gif', 
    instructions: ['お尻を高く上げ「く」の字になる', '頭を両手の間に下ろす', '肩周りの筋肉を意識する'],
    description: 'お尻を高く上げて行う腕立て伏せです。主に肩（三角筋）を鍛えるのに非常に効果的です。',
    targetTags: ['肩', '腕'],
    targetMuscles: ['front-deltoids', 'triceps']
  },
  'ベンチディップス': { 
    image: '/exercises/pushup.png', icon: '/icons/pushup.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0129.gif', 
    instructions: ['椅子や段差に手を後ろ手につく', '肘が90度になるまで腰を下ろす', '二の腕を意識して押し上げる'],
    description: '椅子などの段差を利用し、上腕三頭筋（二の腕）を集中的に鍛える種目です。',
    targetTags: ['腕', '肩'],
    targetMuscles: ['triceps', 'front-deltoids']
  },
  'スクワット': { 
    image: '/exercises/squat.png', icon: '/icons/squat.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0043.gif', 
    instructions: ['足は肩幅に開く', 'お尻を後ろに引くようにしゃがむ', '膝が爪先より前に出すぎないように'],
    description: '下半身全体を鍛える「筋トレの王様」です。太ももやお尻の引き締めに効果的です。',
    targetTags: ['四頭筋', '臀筋', 'ハムストリング'],
    targetMuscles: ['quadriceps', 'gluteal', 'hamstring']
  },
  'ランジ': { 
    image: '/exercises/squat.png', icon: '/icons/squat.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0063.gif', 
    instructions: ['足を前後に大きく開く', '前の膝が90度になるまで腰を落とす', '後ろの膝は床スレスレまで下げる'],
    description: '足を前後に開き、深く腰を落とす動作です。お尻や太ももの筋肉をピンポイントで鍛えられます。',
    targetTags: ['四頭筋', '臀筋', 'ハムストリング'],
    targetMuscles: ['quadriceps', 'gluteal', 'hamstring']
  },
  'ヒップブリッジ': { 
    image: '', icon: '/icons/plank.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/3561.gif', 
    instructions: ['仰向けになり膝を立てる', 'お尻を高く持ち上げる', 'お尻の筋肉をキュッと締める'],
    description: '仰向けから腰を持ち上げる動作で、お尻（大臀筋）を強く刺激するトレーニングです。',
    targetTags: ['臀筋', 'ハムストリング'],
    targetMuscles: ['gluteal', 'hamstring']
  },
  'カーフレイズ': { 
    image: '/exercises/squat.png', icon: '/icons/squat.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0043.gif', 
    instructions: ['壁などに手をつき姿勢を安定させる', 'かかとを高く上げる', 'ふくらはぎを意識する'],
    description: 'かかとを上下させることで、ふくらはぎを鍛える種目です。足首の引き締めにも効果的。',
    targetTags: ['ふくらはぎ'],
    targetMuscles: ['calves']
  },
  'プランク': { 
    image: '/exercises/plank.png', icon: '/icons/plank.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0276.gif', 
    instructions: ['肩の下に肘をつく', '頭からかかとまで一直線にする', 'お腹とお尻に力を入れる'],
    description: '体幹（コア）を固定し、腹筋だけでなく全身の筋肉を使って姿勢をキープするトレーニングです。',
    targetTags: ['腹筋', '肩', '背中'],
    targetMuscles: ['abs', 'front-deltoids', 'lower-back']
  },
  'クランチ': { 
    image: '/exercises/crunch.png', icon: '/icons/plank.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0274.gif', 
    instructions: ['仰向けになり膝を立てる', 'おへそを覗き込むように上体を起こす', '反動を使わず腹筋を意識する'],
    description: '腹直筋の上部をターゲットにした、基本的な腹筋運動です。おへそを見るように上体を丸めます。',
    targetTags: ['腹筋'],
    targetMuscles: ['abs']
  },
  '腹筋': { 
    image: '/exercises/crunch.png', icon: '/icons/plank.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0274.gif', 
    instructions: ['仰向けになり膝を立てる', 'おへそを覗き込むように上体を起こす', '反動を使わず腹筋を意識する'],
    description: '腹直筋をターゲットにした基本的な腹筋運動です。',
    targetTags: ['腹筋'],
    targetMuscles: ['abs']
  },
  'ロシアン・ツイスト': { 
    image: '', icon: '/icons/plank.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0687.gif', 
    instructions: ['体育座りから上体を少し後ろへ倒す', '両手を胸の前で組み、左右に大きく捻る', '腹斜筋を意識する'],
    description: '上体を少し倒した状態から体を左右に捻ることで、脇腹（腹斜筋）を鍛えてくびれを作るトレーニングです。',
    targetTags: ['腹筋', '腹斜筋'],
    targetMuscles: ['abs', 'obliques']
  },
  'バイシクルクランチ': { 
    image: '', icon: '/icons/plank.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0003.gif', 
    instructions: ['仰向けになり自転車をこぐように脚を動かす', '対角の肘と膝を近づける', '腹筋全体をねじるように意識'],
    description: '自転車を漕ぐような動作と上体の捻りを組み合わせ、腹直筋と腹斜筋を同時に鍛えます。',
    targetTags: ['腹筋', '腹斜筋'],
    targetMuscles: ['abs', 'obliques']
  },
  'レッグレイズ': { 
    image: '', icon: '/icons/plank.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0001.gif', 
    instructions: ['仰向けになり足をまっすぐ伸ばす', '両足を揃えて高く持ち上げる', 'ゆっくりと下ろす（床にはつけない）'],
    description: '仰向けで両足を上下させる運動です。特に下腹部のぽっこり解消に効果的です。',
    targetTags: ['下腹部', '腹筋'],
    targetMuscles: ['abs', 'quadriceps']
  },
  'マウンテンクライマー': { 
    image: '', icon: '/icons/plank.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0259.gif', 
    instructions: ['腕立て伏せの姿勢からスタート', '走るように左右の膝を胸に引き寄せる', '腰が上がらないように注意'],
    description: '腕立て伏せの姿勢から足を交互に素早く引き寄せる、全身を使う有酸素運動かつ体幹トレーニングです。',
    targetTags: ['腹筋', '全身', '四頭筋'],
    targetMuscles: ['abs', 'quadriceps', 'front-deltoids']
  },
  'バーピー': { 
    image: '', icon: '/icons/squat.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0116.gif', 
    instructions: ['しゃがんで両手を床につく', '両足を後ろに伸ばし腕立て伏せの姿勢', '足を戻して立ち上がりジャンプ'],
    description: '全身を大きく動かす、究極の高強度脂肪燃焼トレーニング（HIIT）の一つです。',
    targetTags: ['全身', '心肺機能'],
    targetMuscles: ['quadriceps', 'gluteal', 'chest', 'front-deltoids', 'abs']
  },
  'ジャンピングジャック': { 
    image: '', icon: '/icons/squat.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/3220.gif', 
    instructions: ['手足を大きく開いてジャンプ', '着地はやさしく', 'リズミカルに繰り返す'],
    description: '上にジャンプしながら脚を横に開き、両手を頭の上で合わせてから、脚を揃える最初の位置に戻して、両腕も身体の横に戻します。\n\nこのエクササイズは、大きな筋肉群を全て動かす全身のトレーニングです。',
    targetTags: ['肩', '四頭筋', '内転筋', 'ふくらはぎ'],
    targetMuscles: ['front-deltoids', 'quadriceps', 'adductor', 'calves']
  },
  'ハイニーズ': { 
    image: '', icon: '/icons/squat.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/3220.gif', 
    instructions: ['その場で太ももを高く上げて走る', '腕を大きく振る', '着地はやさしく'],
    description: 'その場で太ももを高く上げるもも上げダッシュです。心肺機能を高める有酸素運動です。',
    targetTags: ['全身', '四頭筋'],
    targetMuscles: ['quadriceps', 'calves', 'abs']
  },
  'スーパーマン': { 
    image: '', icon: '/icons/plank.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0803.gif', 
    instructions: ['うつ伏せになり手足をまっすぐ伸ばす', '両手両足を同時に床から持ち上げる', '背中とお尻の筋肉を意識する'],
    description: 'うつ伏せの姿勢から手足を同時に持ち上げることで、背筋や腰、お尻を鍛えるトレーニングです。',
    targetTags: ['背中', '臀筋'],
    targetMuscles: ['upper-back', 'lower-back', 'gluteal']
  },
  'バックエクステンション': { 
    image: '', icon: '/icons/plank.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0803.gif', 
    instructions: ['うつ伏せになり両手を頭の後ろへ', '上体をゆっくり反らせて起こす', '背中の筋肉を意識する'],
    description: '主に脊柱起立筋（背中から腰にかけての筋肉）を鍛え、美しい姿勢を作るのに役立ちます。',
    targetTags: ['背中', '腰'],
    targetMuscles: ['upper-back', 'lower-back']
  },
  'シザーズ': { 
    image: '', icon: '/icons/plank.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0003.gif', 
    instructions: ['仰向けになり足を少し浮かせる', '左右の足を交互に上下に交差させる', '下腹部の筋肉を意識する'],
    description: '仰向けの状態で両足を少し浮かせ、ハサミのように交互に動かすことで下腹部を鍛えます。',
    targetTags: ['腹筋', '下腹部'],
    targetMuscles: ['abs']
  },
  'ストレッチ': { 
    image: '/exercises/stretch.png', icon: '/icons/squat.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/1512.gif', 
    instructions: ['反動をつけずにゆっくり伸ばす', '痛気持ちいいところでキープする', '自然な呼吸を続ける'],
    description: '筋肉の緊張をほぐし、血流を良くすることで疲労回復や柔軟性の向上を促します。',
    targetTags: ['全身', '柔軟性'],
    targetMuscles: ['quadriceps', 'hamstring', 'chest']
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
    targetMuscles: []
  };
};
