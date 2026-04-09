import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";

// ============================================================
// CLIENTE HTTP CENTRAL
// ============================================================

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

// ── Request interceptor: adjunta access token ────────────────
api.interceptors.request.use((config) => {
  const token = Cookies.get("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor: auto-refresh en 401 ───────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (v: unknown) => void;
  reject: (e: unknown) => void;
}> = [];

function processQueue(error: unknown, token?: string) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers!.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = Cookies.get("refreshToken");
    if (!refreshToken) {
      clearAuth();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh`,
        { refreshToken },
      );
      Cookies.set("accessToken", data.accessToken, {
        secure: true,
        sameSite: "Strict",
      });
      Cookies.set("refreshToken", data.refreshToken, {
        secure: true,
        sameSite: "Strict",
      });
      api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
      processQueue(null, data.accessToken);
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      clearAuth();
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

function clearAuth() {
  Cookies.remove("accessToken");
  Cookies.remove("refreshToken");
}

export default api;

// ── Helpers de tipos ─────────────────────────────────────────
export const authApi = {
  register: (data: {
    name: string;
    email: string;
    password: string;
    churchName?: string;
    inviteToken?: string;
  }) => api.post("/api/v1/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/api/v1/auth/login", data),
  logout: (refreshToken: string) =>
    api.post("/api/v1/auth/logout", { refreshToken }),
};

export const songsApi = {
  list: (search?: string) => api.get("/api/v1/songs", { params: { search } }),
  get: (id: string) => api.get(`/api/v1/songs/${id}`),
  create: (data: object) => api.post("/api/v1/songs", data),
  update: (id: string, data: object) => api.patch(`/api/v1/songs/${id}`, data),
  delete: (id: string) => api.delete(`/api/v1/songs/${id}`),
  transpose: (id: string, key: string) =>
    api.get(`/api/v1/songs/${id}/transpose`, { params: { key } }),
  addVersion: (id: string, data: object) =>
    api.post(`/api/v1/songs/${id}/versions`, data),
};

export const meetingsApi = {
  list: (upcoming?: boolean) =>
    api.get("/api/v1/meetings", { params: { upcoming } }),
  get: (id: string) => api.get(`/api/v1/meetings/${id}`),
  create: (data: object) => api.post("/api/v1/meetings", data),
  update: (id: string, data: object) =>
    api.patch(`/api/v1/meetings/${id}`, data),
  delete: (id: string) => api.delete(`/api/v1/meetings/${id}`),
  addSong: (meetingId: string, data: object) =>
    api.post(`/api/v1/meetings/${meetingId}/songs`, data),
  removeSong: (meetingId: string, meetingSongId: string) =>
    api.delete(`/api/v1/meetings/${meetingId}/songs/${meetingSongId}`),
  reorderSongs: (meetingId: string, orderedSongIds: string[]) =>
    api.patch(`/api/v1/meetings/${meetingId}/songs/reorder`, {
      orderedSongIds,
    }),
  generateShare: (meetingId: string) =>
    api.post(`/api/v1/meetings/${meetingId}/share`),
  assign: (
    meetingId: string,
    data: { userId: string; instrumentId: string; notes?: string },
  ) => api.post(`/api/v1/meetings/${meetingId}/assignments`, data),
  unassign: (meetingId: string, assignmentId: string) =>
    api.delete(`/api/v1/meetings/${meetingId}/assignments/${assignmentId}`),
};

export const churchApi = {
  getMe: () => api.get("/api/v1/churches/me"),
  getStats: () => api.get("/api/v1/churches/me/stats"),
  getMembers: () => api.get("/api/v1/churches/me/members"),
  invite: (email: string, role: string) =>
    api.post("/api/v1/churches/me/members", { email, role }),
  createInviteLink: (email: string, role: string) =>
    api.post("/api/v1/churches/me/invites", { email, role }),
  getInvitePublic: (token: string) =>
    api.get(`/api/v1/churches/invites/${token}/public`),
  updateMemberRole: (memberId: string, role: string) =>
    api.patch(`/api/v1/churches/me/members/${memberId}/role`, { role }),
  removeMember: (memberId: string) =>
    api.delete(`/api/v1/churches/me/members/${memberId}`),
};

export const subscriptionsApi = {
  get: () => api.get("/api/v1/subscriptions"),
  checkout: (plan: string) =>
    api.post("/api/v1/subscriptions/checkout", { plan }),
  portal: () => api.post("/api/v1/subscriptions/portal"),
};

export const instrumentsApi = {
  list: () => api.get("/api/v1/instruments"),
};

export const publicMeetingsApi = {
  getByToken: (token: string) => api.get(`/api/v1/public/meetings/${token}`),
};
