export interface Student {
  id: number;
  full_name: string;
  email: string;
  date_of_birth: string;
  age: number;
  phone_number: string;
  course: string;
  address?: string | null;
  enrollment_date: string;
  created_at: string;
  updated_at: string;
}

export interface StudentFormData {
  full_name: string;
  email: string;
  date_of_birth: string;
  phone_number: string;
  course: string;
  address?: string;
  enrollment_date: string;
}

export interface StudentPagination {
  items: Student[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CourseStat {
  course: string;
  count: number;
}

export interface TrendStat {
  period: string;
  count: number;
}

export interface StudentStats {
  total_students: number;
  by_course: CourseStat[];
  enrollment_trends: TrendStat[];
  age_distribution: Record<string, number>;
  recent_students: Student[];
}

export interface FilterParams {
  page?: number;
  page_size?: number;
  search?: string;
  course?: string;
  enrollment_start?: string;
  enrollment_end?: string;
  dob_start?: string;
  dob_end?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface AIQueryResponse {
  answer: string;
  intent?: string;
  grounded_data?: any;
  ai_enabled: boolean;
  model: string;
}

export interface AIStatusResponse {
  provider: string;
  configured: boolean;
  model: string;
  mode: string;
}
