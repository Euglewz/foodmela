"use client";

import { useEffect } from "react";

export default function RegisterAppServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/app-sw.js", { scope: "/app" }).catch(() => {});
  }, []);
  return null;
}
