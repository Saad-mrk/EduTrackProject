import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { useNotificationsViewModel } from "@/viewmodels/use-notifications-view-model";

export const Route = createFileRoute("/_app/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications – EduTrack" },
      { name: "description", content: "Centre de notifications" },
      { property: "og:title", content: "Notifications – EduTrack" },
      { property: "og:description", content: "Vos notifications" },
    ],
  }),
  component: Notifs,
});

function Notifs() {
  const { notifications, toggle, markAllRead } = useNotificationsViewModel();

  return (
    <>
      <PageHeader
        title="Notifications"
        action={
          <Button variant="outline" onClick={markAllRead}>
            Tout marquer comme lu
          </Button>
        }
      />
      <Panel>
        <ul className="divide-y">
          {notifications.map((notification) => (
            <li key={notification.id}>
              <button
                className="flex w-full items-center gap-3 py-3 text-left text-sm"
                onClick={() => toggle(notification.id)}
              >
                <span
                  className={`h-2 w-2 rounded-full ${notification.read ? "bg-muted" : "bg-primary"}`}
                />
                <span
                  className={`flex-1 ${notification.read ? "text-muted-foreground" : "font-medium"}`}
                >
                  {notification.title}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(notification.date).toLocaleDateString("fr-FR")}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
