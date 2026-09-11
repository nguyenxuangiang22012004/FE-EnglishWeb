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

/** Format phân trang tinh gọn */
export interface PageResponse<T> {
  content: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
  totalElements?: number;
}
