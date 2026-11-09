import { getDb, updateDb } from "@/data/local-database";
import { buildTimetable, type Session } from "@/data/timetable";

export interface TimetableService {
  list(): Session[];
  save(session: Session): void;
  remove(id: string): void;
}

function currentSessions(): Session[] {
  const db = getDb();
  return db.sessions ?? buildTimetable(db);
}

export const timetableService: TimetableService = {
  list: currentSessions,
  save(session) {
    updateDb((db) => {
      const base = db.sessions ?? buildTimetable(db);
      const exists = base.some((candidate) => candidate.id === session.id);
      return {
        ...db,
        sessions: exists
          ? base.map((candidate) => (candidate.id === session.id ? session : candidate))
          : [...base, session],
      };
    });
  },
  remove(id) {
    updateDb((db) => {
      const base = db.sessions ?? buildTimetable(db);
      return { ...db, sessions: base.filter((candidate) => candidate.id !== id) };
    });
  },
};
