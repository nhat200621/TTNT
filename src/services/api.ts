import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to get token from localStorage
const getToken = () => localStorage.getItem('token');

api.interceptors.request.use(config => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const productApi = {
  getAll: () => api.get('/products'),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  getStock: (id: string) => api.get(`/products/${id}/stock`),
};

export const categoryApi = {
  getAll: () => api.get('/categories'),
  create: (data: any) => api.post('/categories', data),
  update: (id: string, data: any) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

export const supplierApi = {
  getAll: () => api.get('/suppliers'),
  create: (data: any) => api.post('/suppliers', data),
  update: (id: string, data: any) => api.put(`/suppliers/${id}`, data),
  delete: (id: string) => api.delete(`/suppliers/${id}`),
};

export const purchaseApi = {
  getAll: () => api.get('/purchases'),
  create: (data: any) => api.post('/purchases', data),
};

export const saleApi = {
  getAll: () => api.get('/sales'),
  create: (data: any) => api.post('/sales', data),
  getDetails: (id: string) => api.get(`/sales/${id}`),
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getCharts: () => api.get('/dashboard/charts'),
};

export const storeApi = {
  getTypes: () => api.get('/stores/types'),
  getCurrent: () => api.get('/stores/current'),
  createCurrent: (data: any) => api.post('/stores/current', data),
  getStore: (id: string) => api.get(`/stores/${id}`),
  updateStore: (id: string, data: any) => api.put(`/stores/${id}`, data),
};

export const analyticsApi = {
  getProductAnalytics: (productId: string, overrideNewExpiry?: string) => {
    let url = `/analytics/products/${productId}`;
    if (overrideNewExpiry) url += `?overrideNewExpiry=${overrideNewExpiry}`;
    return api.get(url);
  },
  // Hoàn thiện theo Requirement mới: Lấy đề xuất dựa trên Store Settings
  getNewProductRecommendations: () => api.get('/analytics/new-products/recommend'),
  // Tính toán nhập thử cho mặt hàng mới chọn từ Dataset
  calculateNewProductTrial: (data: any) => api.post('/analytics/new-products/calculate', data),

  startTrial: (productId: string, trialDays: number, datasetId?: string) =>
    api.post(`/analytics/products/${productId}/trial`, { trialDays, datasetId }),
};

export const aiChatApi = {
  sendMessage: (data: any) => api.post('/ai-chat/message', data),
  getConversation: (id: string) => api.get(`/ai-chat/conversations/${id}`),
  deleteConversation: (id: string) => api.delete(`/ai-chat/conversations/${id}`),
};

export const adminApi = {
  getUsers: () => api.get('/admin/users'),
  updateUserStatus: (id: string, isActive: boolean) => api.patch(`/admin/users/${id}/status`, { isActive }),
  updateUserRole: (id: string, role: string) => api.patch(`/admin/users/${id}/role`, { role }),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),

  getStoreTypes: () => api.get('/admin/store-types'),
  createStoreType: (data: any) => api.post('/admin/store-types', data),
  updateStoreType: (id: string, data: any) => api.put(`/admin/store-types/${id}`, data),
  deleteStoreType: (id: string) => api.delete(`/admin/store-types/${id}`),

  getParameters: (type?: string) => api.get(`/admin/parameters${type ? `?type=${type}` : ''}`),
  createParameter: (data: any) => api.post('/admin/parameters', data),
  updateParameter: (id: string, data: any) => api.put(`/admin/parameters/${id}`, data),
  deleteParameter: (id: string) => api.delete(`/admin/parameters/${id}`),

  getSeasons: () => api.get('/admin/seasons'),
  createSeason: (data: any) => api.post('/admin/seasons', data),
  updateSeason: (id: string, data: any) => api.put(`/admin/seasons/${id}`, data),
  deleteSeason: (id: string) => api.delete(`/admin/seasons/${id}`),

  getProductDatasets: () => api.get('/admin/product-datasets'),
  createProductDataset: (data: any) => api.post('/admin/product-datasets', data),
  updateProductDataset: (id: string, data: any) => api.put(`/admin/product-datasets/${id}`, data),
  deleteProductDataset: (id: string) => api.delete(`/admin/product-datasets/${id}`),

  getLogs: (calculationType?: string, productId?: string) =>
    api.get(`/admin/calculation-logs?${calculationType ? `calculationType=${calculationType}&` : ''}${productId ? `productId=${productId}` : ''}`),
};

export default api;
