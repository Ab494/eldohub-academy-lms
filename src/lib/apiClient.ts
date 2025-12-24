// API client configuration for connecting frontend to backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

type RequestOptions = RequestInit & { headers?: Record<string, string> };

class APIClient {
  baseURL: string;
  token: string | null;

  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('accessToken');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('accessToken', token);
  }

  setRefreshToken(token: string) {
    localStorage.setItem('refreshToken', token);
  }

  getToken() {
    return this.token || localStorage.getItem('accessToken');
  }

  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.token = null;
  }

  async request(endpoint: string, options: RequestOptions = {}) {
    const optHeaders = options.headers as Record<string, string> | undefined;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(optHeaders || {}),
    };

    const token = this.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle token refresh if 401
    if (response.status === 401 && token) {
      const refreshToken = this.getRefreshToken();
      if (refreshToken) {
        const refreshResponse = await fetch(`${this.baseURL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const { data } = await refreshResponse.json();
          this.setToken(data.accessToken);
          this.setRefreshToken(data.refreshToken);

          // Retry original request with new token
          headers.Authorization = `Bearer ${data.accessToken}`;
          return fetch(`${this.baseURL}${endpoint}`, {
            ...options,
            headers,
          });
        } else {
          this.clearTokens();
        }
      }
    }

    return response;
  }

  async get(endpoint: string) {
    const response = await this.request(endpoint, { method: 'GET' });
    return this.handleResponse(response);
  }

  async post(endpoint: string, data?: any) {
    const response = await this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse(response);
  }

  async put(endpoint: string, data?: any) {
    const response = await this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse(response);
  }

  async patch(endpoint: string, data?: any) {
    const response = await this.request(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse(response);
  }

  async delete(endpoint: string) {
    const response = await this.request(endpoint, { method: 'DELETE' });
    return this.handleResponse(response);
  }

  async handleResponse(response: Response) {
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw {
        status: response.status,
        message: data?.message || 'An error occurred',
        data,
      };
    }

    return data;
  }
}

export const apiClient = new APIClient();

// Auth endpoints
export const authAPI = {
  register: (userData: any) => apiClient.post('/auth/register', userData),
  login: (email: string, password: string) => apiClient.post('/auth/login', { email, password }),
  logout: () => apiClient.post('/auth/logout', {}),
  getCurrentUser: () => apiClient.get('/auth/me'),
  updateProfile: (data: any) => apiClient.put('/auth/profile', data),
  changePassword: (oldPassword: string, newPassword: string) =>
    apiClient.post('/auth/change-password', { oldPassword, newPassword }),
};

// Course endpoints
export const courseAPI = {
  getAllCourses: (params: Record<string, any> = {}) => apiClient.get(`/courses?${new URLSearchParams(params)}`),
  getCourseById: (courseId: string) => apiClient.get(`/courses/${courseId}`),
  createCourse: (data: any) => apiClient.post('/courses', data),
  updateCourse: (courseId: string, data: any) => apiClient.put(`/courses/${courseId}`, data),
  publishCourse: (courseId: string) => apiClient.post(`/courses/${courseId}/publish`, {}),
  deleteCourse: (courseId: string) => apiClient.delete(`/courses/${courseId}`),
  getInstructorCourses: (params: Record<string, any> = {}) =>
    apiClient.get(`/courses/instructor/my-courses?${new URLSearchParams(params)}`),
};

// Module endpoints
export const moduleAPI = {
  createModule: (courseId: string, data: any) => apiClient.post(`/courses/${courseId}/modules`, data),
  getCourseModules: (courseId: string) => apiClient.get(`/courses/${courseId}/modules`),
  updateModule: (courseId: string, moduleId: string, data: any) =>
    apiClient.put(`/courses/${courseId}/modules/${moduleId}`, data),
  deleteModule: (courseId: string, moduleId: string) =>
    apiClient.delete(`/courses/${courseId}/modules/${moduleId}`),
};

// Lesson endpoints
export const lessonAPI = {
  createLesson: (courseId: string, moduleId: string, data: any) =>
    apiClient.post(`/courses/${courseId}/modules/${moduleId}/lessons`, data),
  getLesson: (courseId: string, moduleId: string, lessonId: string) =>
    apiClient.get(`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`),
  updateLesson: (courseId: string, moduleId: string, lessonId: string, data: any) =>
    apiClient.put(`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, data),
  deleteLesson: (courseId: string, moduleId: string, lessonId: string) =>
    apiClient.delete(`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`),
};

// Enrollment endpoints
export const enrollmentAPI = {
  enrollCourse: (courseId: string) => apiClient.post(`/enrollments/${courseId}/enroll`, {}),
  getMyEnrollments: (params: Record<string, any> = {}) =>
    apiClient.get(`/enrollments/my/enrollments?${new URLSearchParams(params)}`),
  getCourseEnrollments: (courseId: string, params: Record<string, any> = {}) =>
    apiClient.get(`/enrollments/${courseId}/enrollments?${new URLSearchParams(params)}`),
  markLessonComplete: (courseId: string, lessonId: string) =>
    apiClient.post(`/enrollments/${courseId}/lessons/${lessonId}/complete`, {}),
  getProgress: (courseId: string) => apiClient.get(`/enrollments/${courseId}/progress`),
};

// Quiz endpoints
export const quizAPI = {
  createQuiz: (courseId: string, lessonId: string, data: any) =>
    apiClient.post(`/courses/${courseId}/quizzes/${lessonId}`, data),
  submitQuizAttempt: (courseId: string, quizId: string, data: any) =>
    apiClient.post(`/courses/${courseId}/quizzes/${quizId}/submit`, data),
  getQuizAttempts: (courseId: string, quizId: string) =>
    apiClient.get(`/courses/${courseId}/quizzes/${quizId}/attempts`),
  getBestAttempt: (courseId: string, quizId: string) =>
    apiClient.get(`/courses/${courseId}/quizzes/${quizId}/best-attempt`),
};

// Assignment endpoints
export const assignmentAPI = {
  createAssignment: (courseId: string, lessonId: string, data: any) =>
    apiClient.post(`/courses/${courseId}/assignments/${lessonId}`, data),
  submitAssignment: (courseId: string, assignmentId: string, data: any) =>
    apiClient.post(`/courses/${courseId}/assignments/${assignmentId}/submit`, data),
  gradeSubmission: (courseId: string, submissionId: string, data: any) =>
    apiClient.post(`/courses/${courseId}/assignments/submissions/${submissionId}/grade`, data),
  getSubmission: (courseId: string, submissionId: string) =>
    apiClient.get(`/courses/${courseId}/assignments/submissions/${submissionId}`),
  getAssignmentSubmissions: (courseId: string, assignmentId: string, params: Record<string, any> = {}) =>
    apiClient.get(
      `/courses/${courseId}/assignments/${assignmentId}/submissions?${new URLSearchParams(params)}`
    ),
  getMySubmissions: (courseId: string, params: Record<string, any> = {}) =>
    apiClient.get(`/courses/${courseId}/assignments/my/submissions/${courseId}?${new URLSearchParams(params)}`),
};

// User endpoints (Admin only)
export const userAPI = {
  getAllUsers: (params: Record<string, any> = {}) => apiClient.get(`/users?${new URLSearchParams(params)}`),
  getUserById: (userId: string) => apiClient.get(`/users/${userId}`),
  updateUserRole: (userId: string, role: string) => apiClient.patch(`/users/${userId}/role`, { role }),
  updateUserStatus: (userId: string, isActive: boolean) => apiClient.patch(`/users/${userId}/status`, { isActive }),
  deleteUser: (userId: string) => apiClient.delete(`/users/${userId}`),
};

// Admin stats endpoints
export const adminAPI = {
  getUserStats: () => apiClient.get('/admin/stats/users'),
  getCourseStats: () => apiClient.get('/admin/stats/courses'),
  getApprovalStats: () => apiClient.get('/admin/stats/approvals'),
  getRevenueStats: () => apiClient.get('/admin/stats/revenue'),
  getDashboardStats: () => apiClient.get('/admin/stats/dashboard'),
  getAllCourses: (params: Record<string, any> = {}) => apiClient.get(`/admin/courses?${new URLSearchParams(params)}`),
};

// Certificate endpoints
export const certificateAPI = {
  generateCertificate: (enrollmentId: string) =>
    apiClient.post(`/certificates/${enrollmentId}/generate`, {}),
  getCertificate: (certificateId: string) => apiClient.get(`/certificates/${certificateId}`),
  getMyCertificates: (params: Record<string, any> = {}) =>
    apiClient.get(`/certificates/my/certificates?${new URLSearchParams(params)}`),
};

// Export default
export default apiClient;
