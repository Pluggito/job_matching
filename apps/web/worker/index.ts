/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

// Push event listener: triggered by Web Push protocol
self.addEventListener("push", (event: ExtendableEvent) => {
  const pushEvent = event as any;
  if (!pushEvent.data) return;

  try {
    const data = pushEvent.data.json();
    const title = data.title || "Staff Guru Notification";
    const options: any = {
      body: data.body || "",
      icon: data.icon || "/icons/icon-192x192.png",
      badge: data.badge || "/icons/icon-192x192.png",
      data: {
        url: data.url || "/dashboard",
      },
      tag: data.tag || "staff-guru",
      renotify: true,
      vibrate: [200, 100, 200],
    };

    pushEvent.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error("[ServiceWorker] Failed to display push notification:", err);
  }
});

// Notification click listener: navigates user to target URL
self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Focus if window already open
      for (const client of clientList) {
        if ("focus" in client && client.url.includes(urlToOpen)) {
          return client.focus();
        }
      }
      // Otherwise open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

export {};
