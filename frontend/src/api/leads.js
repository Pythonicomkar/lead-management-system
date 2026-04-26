import api from './axios';

export const leadsAPI = {
  createLead: (data) => api.post('/leads/', data).then(r => r.data),
  getLeads: (filters = {}, page = 1, pageSize = 20) => 
    api.post('/leads/list', filters, { params: { page, page_size: pageSize } }).then(r => r.data),
  getLead: (id) => api.get(`/leads/${id}`).then(r => r.data),
  updateLead: (id, data) => api.put(`/leads/${id}`, data).then(r => r.data),
  updateStatus: (id, status) => api.patch(`/leads/${id}/status`, { status }).then(r => r.data),
  deleteLead: (id) => api.delete(`/leads/${id}`),
  getTags: () => api.get('/tags/').then(r => r.data),
};