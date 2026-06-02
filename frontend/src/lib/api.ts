import axios from 'axios';
import { toast } from '@/hooks/use-toast';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
});

let _getToken: (() => Promise<string | null>) | null = null;
let _pending: Array<() => void> = [];

export function registerTokenGetter(fn: () => Promise<string | null>) {
  _getToken = fn;
  _pending.forEach((resolve) => resolve());
  _pending = [];
}

function waitForGetter(timeoutMs = 3000): Promise<void> {
  if (_getToken) return Promise.resolve();
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, timeoutMs);
    _pending.push(() => { clearTimeout(timer); resolve(); });
  });
}

api.interceptors.request.use(async (config) => {
  await waitForGetter();
  if (_getToken) {
    const token = await _getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const data = error.response?.data;
    const status = error.response?.status;
    if (status === 401 || status === 403) return Promise.reject(error);
    const message = Array.isArray(data?.message)
      ? data.message.join(', ')
      : (data?.message ?? 'Something went wrong');
    toast.error(message);
    return Promise.reject(error);
  },
);

export const tournamentApi = {
  getAll: (status?: string) =>
    api.get('/tournaments', { params: status ? { status } : {} }),
  getById: (id: string) => api.get(`/tournaments/${id}`),
  create: (data: unknown) => api.post('/tournaments', data),
  update: (id: string, data: unknown) => api.patch(`/tournaments/${id}`, data),
  delete: (id: string) => api.delete(`/tournaments/${id}`),
  removeTeam: (id: string, teamId: string) => api.delete(`/tournaments/${id}/teams/${teamId}`),
  updateStatus: (id: string, status: string) => api.patch(`/tournaments/${id}`, { status }),
};

export const teamApi = {
  getAll: () => api.get('/teams'),
  getMine: () => api.get('/teams/mine'),
  getById: (id: string) => api.get(`/teams/${id}`),
  getMissingRoles: (id: string) => api.get(`/teams/${id}/missing-roles`),
  create: (data: unknown) => api.post('/teams', data),
  update: (id: string, data: unknown) => api.patch(`/teams/${id}`, data),
  addMember: (id: string, data: unknown) => api.post(`/teams/${id}/members`, data),
  updateMemberRole: (teamId: string, userId: string, role: string | null) =>
    api.patch(`/teams/${teamId}/members/${userId}/role`, { role }),
  removeMember: (teamId: string, userId: string) =>
    api.delete(`/teams/${teamId}/members/${userId}`),
  transferCaptain: (teamId: string, userId: string) =>
    api.patch(`/teams/${teamId}/captain`, { userId }),
  delete: (id: string) => api.delete(`/teams/${id}`),
};

export const registrationApi = {
  registerAsTeam: (data: unknown) => api.post('/registrations/team', data),
  registerAsSolo: (data: unknown) => api.post('/registrations/solo', data),
  getWantToJoin: (tournamentId: string) =>
    api.get(`/registrations/tournament/${tournamentId}/want-to-join`),
  getMyRegistrations: () => api.get('/registrations/me'),
  cancel: (id: string) => api.patch(`/registrations/${id}/cancel`),
};

export const userApi = {
  getMe: () => api.get('/users/me'),
  updateMe: (data: unknown) => api.patch('/users/me', data),
  updateMyRoles: (roles: string[]) =>
    api.patch('/users/me/roles', { volleyballRoles: roles }),
  search: (q: string) => api.get('/users/search', { params: { q } }),
  getAll: () => api.get('/users'),
  update: (id: string, data: unknown) => api.patch(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

export default api;
