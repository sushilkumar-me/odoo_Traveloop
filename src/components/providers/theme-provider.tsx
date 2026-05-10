"use client";

import { ThemeProvider as NextThemes } from "next-themes";
import { useMounted } from "./use-mounted";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mounted = useMounted();

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <NextThemes attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemes>
  );
}