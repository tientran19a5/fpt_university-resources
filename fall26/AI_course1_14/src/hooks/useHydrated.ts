import { useEffect, useState } from "react";

/**
 * Custom hook to safely render client-only persisted Zustand state
 * and prevent SSR hydration mismatch errors in Next.js App Router.
 */
export function useHydrated(): boolean {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}
