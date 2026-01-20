"use client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      window.localStorage.setItem("accessToken", token);
    } else {
      window.localStorage.removeItem("accessToken");
    }
  }
}

export function getAccessToken() {
  if (accessToken) return accessToken;
  if (typeof window !== "undefined") {
    accessToken = window.localStorage.getItem("accessToken");
  }
  return accessToken;
}

async function request(path: string, options: RequestInit & { auth?: boolean } = {}) {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (options.auth) {
    const token = getAccessToken();
    if (token) {
      (headers as any).Authorization = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (res.status === 401 && options.auth) {
    const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (refreshRes.ok) {
      const refreshData = await refreshRes.json();
      if (refreshData.accessToken) {
        setAccessToken(refreshData.accessToken);
        return request(path, { ...options, auth: true });
      }
    }
  }

  return res;
}

export const api = {
  async register(email: string, password: string) {
    const res = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    return res;
  },

  async login(email: string, password: string) {
    const res = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.accessToken) {
        setAccessToken(data.accessToken);
      }
      return { ok: true, data };
    }
    return { ok: false, error: await res.json().catch(() => ({})) };
  },

  async logout() {
    await request("/auth/logout", { method: "POST" });
    setAccessToken(null);
  },

  async getTasks(params: { page?: number; pageSize?: number; status?: string; search?: string }) {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.pageSize) query.set("pageSize", String(params.pageSize));
    if (params.status) query.set("status", params.status);
    if (params.search) query.set("search", params.search);

    const res = await request(`/tasks?${query.toString()}`, { auth: true });
    return res;
  },

  async createTask(payload: { title: string; description?: string }) {
    const res = await request("/tasks", {
      method: "POST",
      body: JSON.stringify(payload),
      auth: true,
    });
    return res;
  },

  async updateTask(id: number, payload: { title?: string; description?: string; status?: string }) {
    const res = await request(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
      auth: true,
    });
    return res;
  },

  async deleteTask(id: number) {
    const res = await request(`/tasks/${id}`, {
      method: "DELETE",
      auth: true,
    });
    return res;
  },

  async toggleTask(id: number) {
    const res = await request(`/tasks/${id}/toggle`, {
      method: "POST",
      auth: true,
    });
    return res;
  },
};


