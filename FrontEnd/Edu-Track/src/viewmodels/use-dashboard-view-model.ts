import { useLocalDatabase } from "@/data/use-local-database";
import type { User } from "@/models";
import {
  dashboardService,
  type AdminOverview,
  type StudentOverview,
  type TeacherOverview,
} from "@/services/dashboard.service";

export type DashboardViewModel =
  | { kind: "admin"; overview: AdminOverview }
  | { kind: "teacher"; user: User; overview: TeacherOverview }
  | { kind: "student"; user: User; overview: StudentOverview };

export function useDashboardViewModel(): DashboardViewModel | null {
  const { session } = useLocalDatabase();
  if (!session) return null;
  if (session.role === "ADMIN") {
    return { kind: "admin", overview: dashboardService.admin() };
  }
  if (session.role === "TEACHER") {
    return {
      kind: "teacher",
      user: session,
      overview: dashboardService.teacher(session),
    };
  }
  const overview = dashboardService.student(session);
  return overview ? { kind: "student", user: session, overview } : null;
}
