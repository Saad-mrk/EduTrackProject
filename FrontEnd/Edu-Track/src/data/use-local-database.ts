import { useSyncExternalStore } from "react";
import { getDb, getSession, subscribe } from "@/data/local-database";
import { buildSeed, type User } from "@/data/seed";

const serverDb = buildSeed();
const serverSession: User | null = null;

export function useLocalDatabase() {
  const db = useSyncExternalStore(subscribe, getDb, () => serverDb);
  const session = useSyncExternalStore(subscribe, getSession, () => serverSession);
  return { db, session };
}
