import axios, { AxiosError } from 'axios';
import type {
  Student,
  StudentFormData,
  StudentPagination,
  StudentStats,
  FilterParams,
  AIQueryResponse,
  AIStatusResponse,
} from '../types/student';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const studentApi = {
  getStudents: async (params?: FilterParams): Promise<StudentPagination> => {
    const response = await apiClient.get<StudentPagination>('/students', { params });
    return response.data;
  },

  getStudentById: async (id: number): Promise<Student> => {
    const response = await apiClient.get<Student>(`/students/${id}`);
    return response.data;
  },

  createStudent: async (data: StudentFormData): Promise<Student> => {
    const response = await apiClient.post<Student>('/students', data);
    return response.data;
  },

  updateStudent: async (id: number, data: StudentFormData): Promise<Student> => {
    const response = await apiClient.put<Student>(`/students/${id}`, data);
    return response.data;
  },

  patchStudent: async (id: number, data: Partial<StudentFormData>): Promise<Student> => {
    const response = await apiClient.patch<Student>(`/students/${id}`, data);
    return response.data;
  },

  deleteStudent: async (id: number): Promise<{ message: string; id: number }> => {
    const response = await apiClient.delete<{ message: string; id: number }>(`/students/${id}`);
    return response.data;
  },

  getStudentStats: async (): Promise<StudentStats> => {
    const response = await apiClient.get<StudentStats>('/students/stats');
    return response.data;
  },

  askAI: async (query: string): Promise<AIQueryResponse> => {
    const response = await apiClient.post<AIQueryResponse>('/ai/query', { query });
    return response.data;
  },

  getAIStatus: async (): Promise<AIStatusResponse> => {
    const response = await apiClient.get<AIStatusResponse>('/ai/status');
    return response.data;
  },

  checkHealth: async () => {
    const response = await apiClient.get('/health/ready');
    return response.data;
  },
};

export const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ detail?: string | { msg?: string }[] }>;
    if (axiosError.response?.data?.detail) {
      const detail = axiosError.response.data.detail;
      if (typeof detail === 'string') return detail;
      if (Array.isArray(detail) && detail.length > 0 && detail[0].msg) {
        return detail[0].msg;
      }
    }
    if (axiosError.message) return axiosError.message;
  }
  return 'An unexpected error occurred. Please try again.';
};
