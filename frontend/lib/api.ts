import axios from "axios";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: async (data: {
    username: string;
    email: string;
    password: string;
  }) => {
    const response = await api.post("/auth/register", data);
    if (response.data.token) {
      Cookies.set("token", response.data.token, { expires: 30 });
    }
    return response.data;
  },
  login: async (data: { email: string; password: string }) => {
    const response = await api.post("/auth/login", data);
    if (response.data.token) {
      Cookies.set("token", response.data.token, { expires: 30 });
    }
    return response.data;
  },
  logout: async () => {
    await api.post("/auth/logout");
    Cookies.remove("token");
  },
  getCurrentUser: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
};

// Channels API
export const channelsAPI = {
  getAll: async () => {
    const response = await api.get("/channels");
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/channels/${id}`);
    return response.data;
  },
  create: async (data: {
    name: string;
    description?: string;
    isPrivate?: boolean;
    members?: string[];
  }) => {
    const response = await api.post("/channels", data);
    return response.data;
  },
  join: async (id: string) => {
    const response = await api.post(`/channels/${id}/join`);
    return response.data;
  },
  leave: async (id: string) => {
    const response = await api.post(`/channels/${id}/leave`);
    return response.data;
  },
  getMessages: async (id: string, page: number = 1, limit: number = 50) => {
    const response = await api.get(`/channels/${id}/messages`, {
      params: { page, limit },
    });
    return response.data;
  },
  search: async (query: string) => {
    const response = await api.get(`/channels/search/${query}`);
    return response.data;
  },
  invite: async (id: string, userId: string) => {
    const response = await api.post(`/channels/${id}/invite`, { userId });
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/channels/${id}`);
    return response.data;
  },
};

// Messages API
export const messagesAPI = {
  create: async (data: { content: string; channelId: string }) => {
    const response = await api.post("/messages", {
      content: data.content,
      channelId: data.channelId,
    });
    return response.data;
  },
  update: async (id: string, content: string) => {
    const response = await api.put(`/messages/${id}`, { content });
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/messages/${id}`);
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getAll: async () => {
    const response = await api.get("/users");
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  search: async (query: string) => {
    const response = await api.get(`/users/search/${query}`);
    return response.data;
  },
};

// Invites API
export const invitesAPI = {
  send: async (channelId: string, userId: string) => {
    const response = await api.post("/invites/send", { channelId, userId });
    return response.data;
  },
  getPending: async () => {
    const response = await api.get("/invites/pending");
    return response.data;
  },
  accept: async (inviteId: string) => {
    const response = await api.post(`/invites/${inviteId}/accept`);
    return response.data;
  },
  reject: async (inviteId: string) => {
    const response = await api.post(`/invites/${inviteId}/reject`);
    return response.data;
  },
};

export default api;
