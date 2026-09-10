// Types cho Admin Panel

export interface AdminUserSummary {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface AdminStatsDTO {
  totalUsers: number;
  totalCourses: number;
  totalFlashcardSets: number;
  newUsersToday: number;
  activeUsersToday: number;
  recentUsers: AdminUserSummary[];
}

export interface AdminUserDTO {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  currentStreak: number;
  createdAt: string;
  updatedAt: string;
}

/** Spring Data Page response format */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}
