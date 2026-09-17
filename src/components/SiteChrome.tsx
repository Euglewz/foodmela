"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

function isManagerAppPath(pathname: string | null): boolean {
  return pathname === "/app" || Boolean(pathname?.startsWith("/app/"));
}

// The manager app (/app) is a standalone installed window, so it skips the public site's header and footer.
export default function SiteChrome({
  navbar,
  footer,
  overlay,
  children,
}: {
  navbar: ReactNode;
  footer: ReactNode;
  overlay: ReactNode;
  children: ReactNode;
}) {
  if (isManagerAppPath(usePathname())) {
    return <div className="flex flex-1 flex-col">{children}</div>;
  }

  return (
    <>
      {navbar}
      <main className="flex flex-1 flex-col">{children}</main>
      {footer}
      {overlay}
    </>
  );
}
