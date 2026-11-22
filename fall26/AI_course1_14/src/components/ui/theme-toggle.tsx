"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 text-slate-500 rounded-lg"
        aria-label="Chuyển đổi giao diện sáng/tối"
      >
        <span className="h-4 w-4" />
      </Button>
    );
  }

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-sky-500"
      aria-label={theme === "dark" ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
      title={theme === "dark" ? "Giao diện: Tối (Click để chuyển sáng)" : "Giao diện: Sáng (Click để chuyển tối)"}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-amber-400 transition-all rotate-0 scale-100" />
      ) : (
        <Moon className="h-4 w-4 text-slate-700 transition-all rotate-0 scale-100" />
      )}
      <span className="sr-only">Chuyển đổi giao diện sáng/tối</span>
    </Button>
  );
}
