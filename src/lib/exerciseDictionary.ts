export const EXERCISE_LIBRARY: Record<string, { image: string, icon: string, instructions: string[], images?: string[], gifUrl?: string }> = {
  'プッシュアップ': { image: '/exercises/pushup.png', icon: '/icons/pushup.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/3294.gif', instructions: ['手は肩幅よりやや広めに開く', '体は一直線に保つ', '胸が床スレスレになるまで下げる'] },
  '腕立て伏せ': { image: '/exercises/pushup.png', icon: '/icons/pushup.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/3294.gif', instructions: ['手は肩幅よりやや広めに開く', '体は一直線に保つ', '胸が床スレスレになるまで下げる'] },
  'スクワット': { image: '/exercises/squat.png', icon: '/icons/squat.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0043.gif', instructions: ['足は肩幅に開く', 'お尻を後ろに引くようにしゃがむ', '膝が爪先より前に出すぎないように'] },
  'プランク': { image: '/exercises/plank.png', icon: '/icons/plank.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0276.gif', instructions: ['肩の下に肘をつく', '頭からかかとまで一直線にする', 'お腹とお尻に力を入れる'] },
  'クランチ': { image: '/exercises/crunch.png', icon: '/icons/plank.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0274.gif', instructions: ['仰向けになり膝を立てる', 'おへそを覗き込むように上体を起こす', '反動を使わず腹筋を意識する'] },
  '腹筋': { image: '/exercises/crunch.png', icon: '/icons/plank.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0274.gif', instructions: ['仰向けになり膝を立てる', 'おへそを覗き込むように上体を起こす', '反動を使わず腹筋を意識する'] },
  'ストレッチ': { image: '/exercises/stretch.png', icon: '/icons/squat.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0296.gif', instructions: ['反動をつけずにゆっくり伸ばす', '痛気持ちいいところでキープする', '自然な呼吸を続ける'] },
  'ランジ': { image: '/exercises/squat.png', icon: '/icons/squat.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0063.gif', instructions: ['足を前後に大きく開く', '前の膝が90度になるまで腰を落とす', '後ろの膝は床スレスレまで下げる'] },
  'ジャンプ': { image: '', icon: '/icons/squat.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/3220.gif', instructions: ['着地はやさしく', 'リズミカルに繰り返す'] },
  'ジャンピングジャック': { image: '', icon: '/icons/squat.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/3220.gif', instructions: ['着地はやさしく', 'リズミカルに繰り返す'] },
  'ロシアン・ツイスト': { image: '', icon: '/icons/plank.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0239.gif', instructions: ['正しいフォームを意識して行いましょう', '無理のない範囲で動作を続けます'] },
  'レッグレイズ': { image: '', icon: '/icons/plank.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0165.gif', instructions: ['正しいフォームを意識して行いましょう', '無理のない範囲で動作を続けます'] },
  'マウンテンクライマー': { image: '', icon: '/icons/plank.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0259.gif', instructions: ['正しいフォームを意識して行いましょう', '無理のない範囲で動作を続けます'] },
  'バーピー': { image: '', icon: '/icons/squat.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0116.gif', instructions: ['正しいフォームを意識して行いましょう', '無理のない範囲で動作を続けます'] },
  'ヒップブリッジ': { image: '', icon: '/icons/plank.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0040.gif', instructions: ['正しいフォームを意識して行いましょう', '無理のない範囲で動作を続けます'] },
  'シザーズ': { image: '', icon: '/icons/plank.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/0274.gif', instructions: ['正しいフォームを意識して行いましょう', '無理のない範囲で動作を続けます'] }, // fallback to crunch
  'ヒップキック': { image: '', icon: '/icons/squat.png', gifUrl: 'https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/3220.gif', instructions: ['正しいフォームを意識して行いましょう', '無理のない範囲で動作を続けます'] },
};

export const getExerciseDetails = (name: string) => {
  const match = Object.keys(EXERCISE_LIBRARY).find(k => name.includes(k));
  if (match) return EXERCISE_LIBRARY[match];
  return { image: '', icon: '/icons/squat.png', instructions: ['正しいフォームを意識して行いましょう', '無理のない範囲で動作を続けます'] };
};
