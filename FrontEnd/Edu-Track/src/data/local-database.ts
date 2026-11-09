import { buildSeed, type DB, type User } from "@/data/seed";

const DB_KEY = "edutrack-db-v1";
const AUTH_KEY = "edutrack-auth";

let db: DB = buildSeed();
let loaded = false;
let sessionId: string | null | undefined;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) db = JSON.parse(raw) as DB;
  } catch {
    db = buildSeed();
  }
}

function readSessionId(): string | null {
  if (typeof window === "undefined") return null;
  if (sessionId === undefined) sessionId = localStorage.getItem(AUTH_KEY);
  return sessionId;
}

export function getDb(): DB {
  load();
  return db;
}

export function getSession(): User | null {
  const id = readSessionId();
  if (!id) return null;
  return getDb().users.find((user) => user.id === id) ?? null;
}

export function subscribe(listener: () => void): () => void {
  load();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function updateDb(updater: (current: DB) => DB): DB {
  load();
  db = updater(db);
  if (typeof window !== "undefined") localStorage.setItem(DB_KEY, JSON.stringify(db));
  notify();
  return db;
}

export function resetDb() {
  updateDb(() => buildSeed());
}

export function setSession(user: User | null) {
  sessionId = user?.id ?? null;
  if (typeof window !== "undefined") {
    if (sessionId) localStorage.setItem(AUTH_KEY, sessionId);
    else localStorage.removeItem(AUTH_KEY);
  }
  notify();
}

export const uid = () => Math.random().toString(36).slice(2, 9);
