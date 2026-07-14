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
  },
  // ===== ダンベル種目 =====
  'ダンベルカール': {
    image: '', icon: '/icons/pushup.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0293.gif',
    instructions: ['肘を体側に固定する', '反動を使わずゆっくり持ち上げる', '上腕二頭筋の収縮を感じる'],
    description: '上腕二頭筋（力こぶ）を集中的に鍛えるダンベル種目。肘を固定して丁寧に行うのがポイントです。',
    targetTags: ['上腕二頭筋', '腕'],
    targetMuscles: ['biceps'],
    mets: 3.5
  },
  'ダンベルフライ': {
    image: '', icon: '/icons/pushup.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0294.gif',
    instructions: ['肩甲骨を寄せて胸を張る', '大きな円を描くように腕を広げる', '胸のストレッチを感じながら戻す'],
    description: '大胸筋を広い可動域でストレッチさせる種目。胸の内側まで効かせることができます。',
    targetTags: ['大胸筋', '胸'],
    targetMuscles: ['chest'],
    mets: 4.0
  },
  'ダンベルベンチプレス': {
    image: '', icon: '/icons/pushup.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0289.gif',
    instructions: ['肩甲骨を寄せて胸を張る', 'ダンベルを胸の横に下ろす', '大胸筋を意識して押し上げる'],
    description: '大胸筋・三角筋・上腕三頭筋を鍛えるダンベルプレス。バーベルより可動域が広く筋肉への刺激が強い。',
    targetTags: ['大胸筋', '肩', '三頭筋'],
    targetMuscles: ['chest', 'front-deltoids', 'triceps'],
    mets: 4.5
  },
  'インクラインダンベルプレス': {
    image: '', icon: '/icons/pushup.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0314.gif',
    instructions: ['ベンチを30〜45度に傾ける', '大胸筋上部を意識する', 'ゆっくり下ろしてしっかり押し上げる'],
    description: '大胸筋上部をターゲットにしたインクラインプレス。立体的な胸を作るのに効果的です。',
    targetTags: ['大胸筋上部', '肩'],
    targetMuscles: ['chest', 'front-deltoids'],
    mets: 4.5
  },
  'ダンベルショルダープレス': {
    image: '', icon: '/icons/pushup.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0405.gif',
    instructions: ['ダンベルを耳の横に構える', '真上に向かって押し上げる', '三角筋を意識してゆっくり下ろす'],
    description: '三角筋（肩）を全体的に鍛えるダンベルショルダープレス。肩幅を広くする効果があります。',
    targetTags: ['三角筋', '肩'],
    targetMuscles: ['front-deltoids'],
    mets: 4.0
  },
  'ハンマーカール': {
    image: '', icon: '/icons/pushup.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0303.gif',
    instructions: ['親指を上に向けたニュートラルグリップで持つ', '肘を固定して持ち上げる', '上腕筋・腕橈骨筋を意識する'],
    description: '上腕筋と腕橈骨筋を鍛え、腕の厚みと太さを作るカール種目です。',
    targetTags: ['上腕二頭筋', '前腕'],
    targetMuscles: ['biceps'],
    mets: 3.5
  },
  'コンセントレーションカール': {
    image: '', icon: '/icons/pushup.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0285.gif',
    instructions: ['座った状態で肘を太ももの内側に固定', '反動なしでゆっくり持ち上げる', '力こぶのピークで1秒キープ'],
    description: '上腕二頭筋を孤立させて鍛える集中カール。力こぶのピークをしっかり作るのに効果的です。',
    targetTags: ['上腕二頭筋'],
    targetMuscles: ['biceps'],
    mets: 3.5
  },
  'ダンベルデッドリフト': {
    image: '', icon: '/icons/squat.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0085.gif',
    instructions: ['背中をまっすぐに保つ', '股関節を曲げるイメージで前傾', 'ハムストリングと背中を意識して引き上げる'],
    description: 'ダンベルを使ったデッドリフト。背中・ハムストリング・臀筋を同時に鍛えます。',
    targetTags: ['背中', 'ハムストリング', '臀筋'],
    targetMuscles: ['upper-back', 'lower-back', 'hamstring', 'gluteal'],
    mets: 5.5
  },
  // ===== バーベル種目 =====
  'バーベルベンチプレス': {
    image: '', icon: '/icons/pushup.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0025.gif',
    instructions: ['肩甲骨をベンチに押しつける', 'バーを乳頭線に下ろす', '大胸筋を絞るように押し上げる'],
    description: '筋トレBIG3の一つ。大胸筋・三角筋前部・上腕三頭筋を同時に鍛える最強の胸トレ種目。',
    targetTags: ['大胸筋', '三角筋', '三頭筋'],
    targetMuscles: ['chest', 'front-deltoids', 'triceps'],
    mets: 5.0
  },
  'インクラインベンチプレス': {
    image: '', icon: '/icons/pushup.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0031.gif',
    instructions: ['ベンチを30〜45度に傾ける', '肩甲骨を寄せる', '大胸筋上部を意識して押す'],
    description: '大胸筋上部を重点的に鍛えるインクラインベンチプレス。デクライン・フラットと組み合わせると効果的。',
    targetTags: ['大胸筋上部', '肩'],
    targetMuscles: ['chest', 'front-deltoids'],
    mets: 5.0
  },
  'バーベルスクワット': {
    image: '', icon: '/icons/squat.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0043.gif',
    instructions: ['バーを僧帽筋上部に乗せる', '足幅は肩幅に、つま先は少し外向き', '膝がつま先と同じ方向を向くようにしゃがむ'],
    description: '筋トレBIG3の一つ。下半身全体を鍛える最強種目。大腿四頭筋・ハムストリング・大臀筋に効きます。',
    targetTags: ['四頭筋', '臀筋', 'ハムストリング'],
    targetMuscles: ['quadriceps', 'gluteal', 'hamstring'],
    mets: 6.0
  },
  'デッドリフト': {
    image: '', icon: '/icons/squat.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0085.gif',
    instructions: ['足幅は腰幅、バーはすねに近い位置', '背中をまっすぐ保ち股関節から折る', '全身の筋肉を使って引き上げる'],
    description: '筋トレBIG3の一つ。背中・ハム・臀筋・脚の全身を一度に鍛える最強コンパウンド種目。',
    targetTags: ['背中', 'ハムストリング', '臀筋', '脚'],
    targetMuscles: ['upper-back', 'lower-back', 'hamstring', 'gluteal'],
    mets: 6.0
  },
  'ベントオーバーロウ': {
    image: '', icon: '/icons/pushup.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0027.gif',
    instructions: ['上体を45度前傾させる', '肩甲骨を寄せながらバーを引く', '広背筋と僧帽筋を意識する'],
    description: '広背筋と僧帽筋中部を鍛え、背中の厚みを作るコンパウンド種目。',
    targetTags: ['広背筋', '僧帽筋', '背中'],
    targetMuscles: ['upper-back', 'lower-back'],
    mets: 5.0
  },
  // ===== マシン種目 =====
  'チェストプレス': {
    image: '', icon: '/icons/pushup.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0586.gif',
    instructions: ['シートの高さを合わせる', '肩甲骨を寄せて胸を張る', '大胸筋を意識してゆっくり押す'],
    description: 'マシンを使い安全に大胸筋を鍛えるチェストプレス。初心者でも正しいフォームで行いやすい種目。',
    targetTags: ['大胸筋', '三角筋'],
    targetMuscles: ['chest', 'front-deltoids'],
    mets: 4.0
  },
  'ラットプルダウン': {
    image: '', icon: '/icons/pushup.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0186.gif',
    instructions: ['肩甲骨を下に引き下げる意識で', 'バーを胸の前に引き寄せる', '広背筋を絞るように収縮させる'],
    description: '広背筋を中心に背中の広がりを作るマシン種目。懸垂が難しい初心者にも最適。',
    targetTags: ['広背筋', '背中'],
    targetMuscles: ['upper-back'],
    mets: 4.0
  },
  'レッグプレス': {
    image: '', icon: '/icons/squat.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0578.gif',
    instructions: ['足幅は肩幅程度に置く', '膝を完全に伸ばしきらない', '太ももとお尻の筋肉を意識して押す'],
    description: 'マシンを使い脚全体を安全に鍛える種目。スクワットより腰への負担が少なく高重量を扱えます。',
    targetTags: ['四頭筋', '臀筋', '脚全体'],
    targetMuscles: ['quadriceps', 'gluteal', 'hamstring'],
    mets: 5.0
  },
  'レッグエクステンション': {
    image: '', icon: '/icons/squat.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0583.gif',
    instructions: ['膝関節を完全に伸ばす', '大腿四頭筋を収縮させる', 'ゆっくり下ろして伸ばしすぎない'],
    description: '大腿四頭筋（前もも）をアイソレートして鍛えるマシン種目。太ももの引き締めに効果的。',
    targetTags: ['四頭筋', '前もも'],
    targetMuscles: ['quadriceps'],
    mets: 3.5
  },
  'レッグカール': {
    image: '', icon: '/icons/squat.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0576.gif',
    instructions: ['うつ伏せでパッドを足首に合わせる', 'ハムストリングを意識して膝を曲げる', 'ゆっくりと戻す'],
    description: 'ハムストリングスをアイソレートして鍛えるマシン種目。もも裏の引き締めに効果的です。',
    targetTags: ['ハムストリング', 'もも裏'],
    targetMuscles: ['hamstring'],
    mets: 3.5
  },
  'ペックデックフライ': {
    image: '', icon: '/icons/pushup.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0585.gif',
    instructions: ['肘を少し曲げた状態をキープ', '胸の前で腕を閉じる', '大胸筋の収縮を感じる'],
    description: '大胸筋を集中的に収縮させるフライマシン。胸の内側を仕上げるのに効果的です。',
    targetTags: ['大胸筋'],
    targetMuscles: ['chest'],
    mets: 3.5
  },
  'シーテッドロウ': {
    image: '', icon: '/icons/pushup.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0171.gif',
    instructions: ['背筋を伸ばして座る', '肘を引き体の横に近づける', '背中全体の筋肉を意識する'],
    description: 'シーテッドケーブルロウ。背中全体（広背筋・僧帽筋）を鍛えるコンパウンド種目。',
    targetTags: ['広背筋', '僧帽筋', '背中'],
    targetMuscles: ['upper-back', 'lower-back'],
    mets: 4.0
  },
  // ===== 腹筋ローラー種目 =====
  'ニーロールアウト': {
    image: '', icon: '/icons/plank.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0276.gif',
    instructions: ['膝をついて腹筋ローラーを前に押し出す', '腰を反らさずお腹を丸める', '腹筋の力でゆっくり引き戻す'],
    description: '腹筋ローラーの基本種目。腹直筋・腹斜筋・体幹全体に高強度な刺激を与えます。',
    targetTags: ['腹筋', '体幹'],
    targetMuscles: ['abs'],
    mets: 4.0
  },
  'サイドロールアウト': {
    image: '', icon: '/icons/plank.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0276.gif',
    instructions: ['斜め方向に転がして脇腹を刺激', '左右均等に行う', 'お腹を意識しながらゆっくり戻す'],
    description: '腹斜筋・脇腹を重点的に鍛えるサイドロールアウト。くびれ作りに効果的です。',
    targetTags: ['腹斜筋', '脇腹', 'くびれ'],
    targetMuscles: ['abs', 'obliques'],
    mets: 4.0
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
