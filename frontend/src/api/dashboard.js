import api from './axios';

export const dashboardAPI = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
  
  getTrends: async (days = 30) => {
    const response = await api.get('/dashboard/trends', { params: { days } });
    return response.data;
  },
  
  getSourcePerformance: async () => {
    const response = await api.get('/dashboard/source-performance');
    return response.data;
  },
  
  getUserPerformance: async () => {
    const response = await api.get('/dashboard/user-performance');
    return response.data;
  },
  
  getLeadAging: async () => {
    const response = await api.get('/dashboard/lead-aging');
    return response.data;
  },
};