export const STORAGE_KEYS = {
    PROFILE: 'kinnikun_profile',
    WORKOUTS: 'kinnikun_workouts',
    MEALS: 'kinnikun_meals',
    STREAK: 'kinnikun_streak',
    WEIGHT_LOGS: 'kinnikun_weight_logs'
};

export type Profile = {
    name: string;
    gender: 'male' | 'female';
    age: number;
    trainerName: string;
    height: number;
    weight: number;
    activity: 'low' | 'normal' | 'high';
    goal: 'lose-fat' | 'gain-muscle' | 'maintain' | string;
    dob?: string;
    targetWeight?: number;
    targetAreas?: string[];
    environment?: string;
    exerciseTypes?: string[];
    workoutLevel?: string;
    physicalIssues?: string[];
    frequency?: string;
    estimatedDays?: number;
    targetCalories?: number;
    targetProtein?: number;
    targetFat?: number;
    targetCarb?: number;
    [key: string]: any;
};

export type WorkoutItem = {
    id?: string;
    date: string;
    category: string;
    exercise: string;
    weight: number;
    reps: number;
    sets: number;
    volume?: number;
    calories?: number;
    duration?: number;
};

export type MealItem = {
    id?: string;
    date: string;
    timing: string;
    name: string;
    amount?: number;
    calories: number;
    protein: number;
    fat: number;
    carb: number;
};

export type WeightLog = {
    date: string;
    weight: number;
};

// --- Profile ---
export function getProfile(): Profile {
    if (typeof window === 'undefined') return {} as Profile;
    const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!data) {
        return {
            name: 'ゲストユーザー',
            gender: 'male',
            age: 28,
            trainerName: '筋虎',
            height: 172,
            weight: 68.5,
            activity: 'low',
            goal: 'lose-fat',
            targetCalories: 2000,
            targetProtein: 137,
            targetFat: 44,
            targetCarb: 264
        };
    }
    return JSON.parse(data);
}

export function calculateGoals(p: Partial<Profile>) {
    const weight = Number(p.weight);
    const height = Number(p.height);
    const age = Number(p.age);
    
    let bmr = 0;
    if (p.gender === 'male') {
        bmr = 13.397 * weight + 4.799 * height - 5.677 * age + 88.362;
    } else {
        bmr = 9.247 * weight + 3.098 * height - 4.33 * age + 447.593;
    }

    let tdee = 0;
    switch (p.activity) {
        case 'low': tdee = bmr * 1.2; break;
        case 'normal': tdee = bmr * 1.55; break;
        case 'high': tdee = bmr * 1.85; break;
        default: tdee = bmr * 1.2;
    }

    let targetCalories = 0;
    switch (p.goal) {
        case 'lose-fat':
        case 'ダイエット・減量':
        case '減量':
            targetCalories = tdee - 500;
            const pWeightLose = weight * 2.2;
            const pCalLose = pWeightLose * 4;
            const fCalLose = targetCalories * 0.20;
            const cCalLose = targetCalories - pCalLose - fCalLose;
            return {
                targetCalories: Math.round(targetCalories),
                targetProtein: Math.max(Math.round(pWeightLose), 40),
                targetFat: Math.max(Math.round(fCalLose / 9), 20),
                targetCarb: Math.max(Math.round(cCalLose / 4), 50)
            };

        case 'gain-muscle':
        case '筋肥大・バルクアップ':
        case '増量':
            targetCalories = tdee + 350;
            const pWeightGain = weight * 2.0;
            const pCalGain = pWeightGain * 4;
            const fCalGain = targetCalories * 0.22;
            const cCalGain = targetCalories - pCalGain - fCalGain;
            return {
                targetCalories: Math.round(targetCalories),
                targetProtein: Math.max(Math.round(pWeightGain), 40),
                targetFat: Math.max(Math.round(fCalGain / 9), 20),
                targetCarb: Math.max(Math.round(cCalGain / 4), 50)
            };

        case 'maintain':
        case '健康維持・体力アップ':
        case '現状維持':
        default:
            targetCalories = tdee;
            const pCalMain = targetCalories * 0.20;
            const fCalMain = targetCalories * 0.25;
            const cCalMain = targetCalories * 0.55;
            return {
                targetCalories: Math.round(targetCalories),
                targetProtein: Math.max(Math.round(pCalMain / 4), 40),
                targetFat: Math.max(Math.round(fCalMain / 9), 20),
                targetCarb: Math.max(Math.round(cCalMain / 4), 50)
            };
    }
}

export function saveProfile(profile: Partial<Profile>): Profile {
    const calculated = calculateGoals(profile);
    const updatedProfile = { ...profile, ...calculated } as Profile;
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updatedProfile));
    }
    return updatedProfile;
}

// --- Workouts ---
export function getWorkouts(dateStr: string | null = null): WorkoutItem[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.WORKOUTS);
    const list: WorkoutItem[] = data ? JSON.parse(data) : [];
    if (dateStr) {
        return list.filter(item => item.date === dateStr);
    }
    return list;
}

export function saveWorkout(workoutItem: WorkoutItem): WorkoutItem {
    const list = getWorkouts();
    if (!workoutItem.id) {
        workoutItem.id = 'wo_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    }
    workoutItem.volume = workoutItem.weight * workoutItem.reps * workoutItem.sets;
    if (workoutItem.calories !== undefined && workoutItem.calories !== null) {
        workoutItem.calories = Number(workoutItem.calories) || 0;
    }
    
    const existingIndex = list.findIndex(w => w.id === workoutItem.id);
    if (existingIndex >= 0) {
        list[existingIndex] = workoutItem;
    } else {
        list.push(workoutItem);
    }
    
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(list));
    }
    return workoutItem;
}

export function deleteWorkout(id: string) {
    const list = getWorkouts();
    const filtered = list.filter(item => item.id !== id);
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(filtered));
    }
}

// --- Meals ---
export function getMeals(dateStr: string | null = null): MealItem[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.MEALS);
    const list: MealItem[] = data ? JSON.parse(data) : [];
    if (dateStr) {
        return list.filter(item => item.date === dateStr);
    }
    return list;
}

export function saveMeal(mealItem: MealItem): MealItem {
    const list = getMeals();
    if (!mealItem.id) {
        mealItem.id = 'meal_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    }
    mealItem.calories = Number(mealItem.calories) || 0;
    mealItem.protein = Number(mealItem.protein) || 0;
    mealItem.fat = Number(mealItem.fat) || 0;
    mealItem.carb = Number(mealItem.carb) || 0;
    
    list.push(mealItem);
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(list));
    }
    return mealItem;
}

export function deleteMeal(id: string) {
    const list = getMeals();
    const filtered = list.filter(item => item.id !== id);
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(filtered));
    }
}

// --- Streak ---
export function calculateCurrentStreak(): number {
    if (typeof window === 'undefined') return 0;
    const workouts = getWorkouts();
    const meals = getMeals();
    
    const activeDates = new Set<string>();
    workouts.forEach(w => activeDates.add(w.date));
    meals.forEach(m => activeDates.add(m.date));
    
    const sortedDates = Array.from(activeDates).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    if (sortedDates.length === 0) return 0;
    
    const today = new Date();
    const getFormatted = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    const todayStr = getFormatted(today);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getFormatted(yesterday);
    
    if (!activeDates.has(todayStr) && !activeDates.has(yesterdayStr)) {
        return 0;
    }
    
    let streak = 0;
    let checkDate = new Date(activeDates.has(todayStr) ? today : yesterday);
    
    while (true) {
        const dStr = getFormatted(checkDate);
        if (activeDates.has(dStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }
    
    return streak;
}

// --- Weight Logs ---
export function getWeightLogs(): WeightLog[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.WEIGHT_LOGS);
    if (!data) return [];
    return JSON.parse(data);
}

export function saveWeightLog(log: WeightLog) {
    if (typeof window === 'undefined') return;
    const logs = getWeightLogs();
    const existingIndex = logs.findIndex(l => l.date === log.date);
    if (existingIndex >= 0) {
        logs[existingIndex].weight = log.weight;
    } else {
        logs.push(log);
    }
    logs.sort((a, b) => a.date.localeCompare(b.date));
    localStorage.setItem(STORAGE_KEYS.WEIGHT_LOGS, JSON.stringify(logs));
}
