// Configuration de l'API client
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Types pour les réponses API
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Configuration par défaut pour fetch
const defaultHeaders = {
  'Content-Type': 'application/json',
};

// Fonction utilitaire pour les appels API
export const apiCall = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Récupérer le token depuis localStorage ou cookies
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Fonctions spécifiques pour l'authentification
export const authApi = {
  // Vérifier le statut d'authentification
  checkStatus: () => apiCall('/auth/status'),
  
  // Obtenir le profil utilisateur
  getMe: () => apiCall('/auth/me'),
  
  // Connexion
  login: (credentials: { email: string; password: string }) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  
  // Inscription
  register: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) =>
    apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  
  // Déconnexion
  logout: () => apiCall('/auth/logout', { method: 'POST' }),
  
  // Changer le mot de passe
  changePassword: (passwords: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) =>
    apiCall('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwords),
    }),
};

// Fonctions pour les projets
export const projectsApi = {
  getAll: (params?: Record<string, string>) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiCall(`/projects${queryString}`);
  },
  
  getById: (id: string) => apiCall(`/projects/${id}`),
  
  create: (projectData: any) =>
    apiCall('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    }),
  
  update: (id: string, projectData: any) =>
    apiCall(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    }),
  
  delete: (id: string) =>
    apiCall(`/projects/${id}`, { method: 'DELETE' }),
  
  like: (id: string) =>
    apiCall(`/projects/${id}/like`, { method: 'POST' }),
};

// Fonctions pour les contacts
export const contactApi = {
  create: (contactData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    company?: string;
    subject: string;
    projectType?: string;
    budget?: string;
    timeline?: string;
    message: string;
    gdprConsent: boolean;
  }) =>
    apiCall('/contact', {
      method: 'POST',
      body: JSON.stringify(contactData),
    }),
  
  getAll: (params?: Record<string, string>) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiCall(`/contact${queryString}`);
  },
  
  getById: (id: string) => apiCall(`/contact/${id}`),
  
  reply: (id: string, replyData: { message: string; method?: string }) =>
    apiCall(`/contact/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify(replyData),
    }),
};

// Fonctions pour les rendez-vous
export const appointmentsApi = {
  create: (appointmentData: any) =>
    apiCall('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    }),
  
  getAll: (params?: Record<string, string>) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiCall(`/appointments${queryString}`);
  },
  
  getById: (id: string) => apiCall(`/appointments/${id}`),
  
  confirm: (id: string, token: string) =>
    apiCall(`/appointments/${id}/confirm`, {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),
  
  cancel: (id: string, token: string, reason?: string) =>
    apiCall(`/appointments/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ token, reason }),
    }),
  
  getAvailableSlots: (date: string, duration?: number) => {
    const params = new URLSearchParams({ date });
    if (duration) params.append('duration', duration.toString());
    return apiCall(`/appointments/available-slots?${params.toString()}`);
  },
};

// Fonctions pour le blog
export const blogApi = {
  getAll: (params?: Record<string, string>) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiCall(`/blog${queryString}`);
  },
  
  getById: (id: string) => apiCall(`/blog/${id}`),
  
  getPopular: (limit?: number) => {
    const params = limit ? `?limit=${limit}` : '';
    return apiCall(`/blog/popular${params}`);
  },
  
  search: (query: string, limit?: number) => {
    const params = new URLSearchParams({ q: query });
    if (limit) params.append('limit', limit.toString());
    return apiCall(`/blog/search?${params.toString()}`);
  },
  
  like: (id: string) =>
    apiCall(`/blog/${id}/like`, { method: 'POST' }),
  
  addComment: (id: string, commentData: {
    author: { name: string; email: string; website?: string };
    content: string;
  }) =>
    apiCall(`/blog/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify(commentData),
    }),
};

// Fonctions pour la newsletter
export const newsletterApi = {
  subscribe: (subscriptionData: {
    email: string;
    firstName?: string;
    lastName?: string;
    interests?: string[];
    gdprConsent: boolean;
  }) =>
    apiCall('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscriptionData),
    }),
  
  confirm: (token: string) => apiCall(`/newsletter/confirm/${token}`),
  
  unsubscribe: (token: string) => apiCall(`/newsletter/unsubscribe/${token}`),
};

// Fonction utilitaire pour gérer les erreurs API
export const handleApiError = (error: any) => {
  console.error('API Error:', error);
  
  if (error.message?.includes('401')) {
    // Token expiré ou invalide
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
  }
  
  return error.message || 'Une erreur est survenue';
};

// Export de l'URL de base pour les cas spéciaux
export { API_BASE_URL };