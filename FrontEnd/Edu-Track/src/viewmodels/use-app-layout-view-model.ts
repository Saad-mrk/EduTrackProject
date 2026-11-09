import {
  BarChart3,
  Bell,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLocalDatabase } from "@/data/use-local-database";
import type { Role } from "@/models";
import { authService } from "@/services/auth.service";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  roles: Role[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    to: "/dashboard",
    label: "Tableau de bord",
    icon: LayoutDashboard,
    roles: ["ADMIN", "TEACHER", "STUDENT", "PARENT"],
  },
  { to: "/utilisateurs", label: "Utilisateurs", icon: Users, roles: ["ADMIN"] },
  { to: "/matieres", label: "Classes & Matières", icon: BookOpen, roles: ["ADMIN"] },
  { to: "/notes", label: "Saisie des notes", icon: ClipboardList, roles: ["TEACHER"] },
  { to: "/appel", label: "Appel & Justificatifs", icon: CalendarCheck, roles: ["TEACHER"] },
  { to: "/mes-notes", label: "Notes", icon: GraduationCap, roles: ["STUDENT", "PARENT"] },
  { to: "/mes-absences", label: "Absences", icon: FileText, roles: ["STUDENT", "PARENT"] },
  {
    to: "/emploi-du-temps",
    label: "Emploi du temps",
    icon: CalendarDays,
    roles: ["ADMIN", "TEACHER", "STUDENT", "PARENT"],
  },
  {
    to: "/analyse-absences",
    label: "Analyse des absences",
    icon: BarChart3,
    roles: ["ADMIN", "TEACHER"],
  },
  {
    to: "/notifications",
    label: "Notifications",
    icon: Bell,
    roles: ["ADMIN", "TEACHER", "STUDENT", "PARENT"],
  },
];

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrateur",
  TEACHER: "Enseignant",
  STUDENT: "Étudiant",
  PARENT: "Parent",
};

export function useAppLayoutViewModel() {
  const { db, session } = useLocalDatabase();
  const unread = db.notifications.filter((notification) => !notification.read).length;
  const items = session ? NAV_ITEMS.filter((item) => item.roles.includes(session.role)) : [];
  return {
    user: session,
    unread,
    items,
    roleLabel: session ? ROLE_LABELS[session.role] : "",
    logout: () => authService.logout(),
  };
}
