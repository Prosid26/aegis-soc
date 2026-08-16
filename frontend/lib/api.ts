import axios from 'axios';

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      // Redirect to login page (implementation depends on your router)
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await apiClient.post('/auth/login', { username, password });
    // Store token and user info
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user || {}));
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

// Events API
export const eventsAPI = {
  getEvents: async (params?: { skip?: number; limit?: number }) => {
    const response = await apiClient.get('/events/', { params });
    return response.data;
  },
  createEvent: async (eventData: any) => {
    const response = await apiClient.post('/events/', eventData);
    return response.data;
  },
};

// Incidents API
export const incidentsAPI = {
  getIncidents: async (params?: { skip?: number; limit?: number }) => {
    const response = await apiClient.get('/incidents/', { params });
    return response.data;
  },
  getIncidentById: async (id: number) => {
    const response = await apiClient.get(`/incidents/${id}`);
    return response.data;
  },
  // Note: Incident creation happens via detection engine, not direct API
};

// MITRE API
export const mitreAPI = {
  getTechniques: async (params?: { skip?: number; limit?: number }) => {
    const response = await apiClient.get('/mitre/techniques/', { params });
    return response.data;
  },
  getTechniqueById: async (id: number) => {
    const response = await apiClient.get(`/mitre/techniques/${id}`);
    return response.data;
  },
  getTechniquesForDetectionRule: async (ruleId: string) => {
    const response = await apiClient.get(`/mitre/detections/${ruleId}`);
    return response.data;
  },
};

// AI API
export const aiAPI = {
  analyzeIncident: async (incidentId: number) => {
    const response = await apiClient.post(`/ai/incidents/${incidentId}/analyze`);
    return response.data;
  },
  // Additional AI endpoints if needed
};

// Detection API (for manual rule execution if needed)
export const detectionAPI = {
  runAllRules: async () => {
    const response = await apiClient.post('/detection/run');
    return response.data;
  },
  runBruteForce: async (timeWindowMinutes: number = 5, threshold: number = 10) => {
    const response = await apiClient.post('/detection/brute-force', {
      time_window_minutes: timeWindowMinutes,
      threshold: threshold,
    });
    return response.data;
  },
  // Add other detection rule endpoints as needed
};

// Health check
export const healthAPI = {
  checkHealth: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },
};

// Utility functions
export const authUtils = {
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('access_token');
  },
  getToken: (): string | null => {
    return localStorage.getItem('access_token');
  },
  getUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

export default apiClient;