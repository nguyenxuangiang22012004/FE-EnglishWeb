export interface DailyStatDTO {
    day: string;
    count: number;
}

export interface ProgressChartDTO {
    totalWords: number;
    mastered: number;
    learning: number;
    unknown: number;
    weekStats: DailyStatDTO[];
}

export interface StatsDTO {
    totalWords: number;
    masteredWords: number;
    consecutiveDays: number;
    studyGroups: number;
}

export interface AchievementsDTO {
    consecutiveDays: number;
    totalWordsLearned: number;
    quickSearchAccuracy: number;
}

export interface StudyGoalsDTO {
    dailyWordsGoal: number;
    dailyWordsLearned: number;
    totalWordsGoal: number;
    totalWordsLearned: number;
    streakGoal: number;
    currentStreak: number;
}

export interface DashboardResponseDTO {
    stats: StatsDTO;
    progressChart: ProgressChartDTO;
    achievements: AchievementsDTO;
    studyGoals: StudyGoalsDTO;
}

export interface UpdateGoalsRequestDTO {
    dailyWordsGoal?: number;
    totalWordsGoal?: number;
    streakGoal?: number;
}
