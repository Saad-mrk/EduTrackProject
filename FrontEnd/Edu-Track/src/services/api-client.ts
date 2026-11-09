export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export const endpoints = {
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    session: "/auth/session",
  },
  users: {
    list: "/users",
    create: "/users",
    update: (id: string) => `/users/${id}`,
    remove: (id: string) => `/users/${id}`,
  },
  classes: {
    list: "/classes",
  },
  subjects: {
    list: "/subjects",
    create: "/subjects",
    remove: (id: string) => `/subjects/${id}`,
  },
  grades: {
    list: "/grades",
    save: "/grades/bulk",
  },
  attendance: {
    list: "/absences",
    record: "/absences",
    decide: (id: string) => `/absences/${id}/decision`,
    justify: (id: string) => `/absences/${id}/justification`,
  },
  notifications: {
    list: "/notifications",
    update: (id: string) => `/notifications/${id}`,
    markAllRead: "/notifications/read-all",
  },
  timetable: {
    list: "/timetable/sessions",
    save: "/timetable/sessions",
    remove: (id: string) => `/timetable/sessions/${id}`,
  },
  settings: {
    get: "/settings",
    update: "/settings",
  },
  analytics: {
    absences: "/analytics/absences",
  },
} as const;

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiRequestOptions {
  method?: HttpMethod;
  body?: unknown;
  signal?: AbortSignal;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  throw new Error(`API not implemented: ${options.method ?? "GET"} ${API_BASE_URL}${path}`);
}
