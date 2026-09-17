import type { Metadata, Viewport } from "next";
import RegisterAppServiceWorker from "@/components/manager-app/RegisterAppServiceWorker";

export const metadata: Metadata = {
  title: "Food Mela Manager",
  manifest: "/manager-app.webmanifest",
  icons: { icon: "/app-icons/icon-192.png" },
};

export const viewport: Viewport = {
  themeColor: "#832229",
};

export default function ManagerAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RegisterAppServiceWorker />
      {children}
    </>
  );
}
