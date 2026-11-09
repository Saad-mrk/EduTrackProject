import { useLocalDatabase } from "@/data/use-local-database";
import { notificationsService } from "@/services/notifications.service";

export function useNotificationsViewModel() {
  const { db } = useLocalDatabase();
  return {
    notifications: db.notifications,
    toggle: (id: string) => notificationsService.toggle(id),
    markAllRead: () => notificationsService.markAllRead(),
  };
}
