import { getDb, updateDb } from "@/data/local-database";
import type { Notif } from "@/models";

export interface NotificationsService {
  list(): Notif[];
  toggle(id: string): void;
  markAllRead(): void;
}

export const notificationsService: NotificationsService = {
  list: () => getDb().notifications,
  toggle(id) {
    updateDb((db) => ({
      ...db,
      notifications: db.notifications.map((notification) =>
        notification.id === id ? { ...notification, read: !notification.read } : notification,
      ),
    }));
  },
  markAllRead() {
    updateDb((db) => ({
      ...db,
      notifications: db.notifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    }));
  },
};
