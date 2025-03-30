
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      className="rounded-full transition-all duration-300"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <SunIcon className="h-5 w-5 text-accent" />
      ) : (
        <MoonIcon className="h-5 w-5 text-accent" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
