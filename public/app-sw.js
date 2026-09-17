// Service worker for the Food Mela Manager app. Nothing is cached: orders and menus must always be live.

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

// Clicking a "new order" notification brings the app window forward on the orders screen.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "/app/orders", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      const appWindow = windows.find((w) => new URL(w.url).pathname.startsWith("/app"));
      if (appWindow) return appWindow.focus().then((w) => w.navigate(target));
      return self.clients.openWindow(target);
    }),
  );
});
