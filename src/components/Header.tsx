
import { ThemeToggle } from "./ThemeToggle";
import { Film } from "lucide-react";

export function Header() {
  return (
    <header className="w-full py-4 px-6 flex justify-between items-center border-b">
      <div className="flex items-center gap-3">
        <Film className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center">
            VideoExtract
          </h1>
          <p className="text-sm text-muted-foreground">
            Grab videos from any webpage in seconds
          </p>
        </div>
      </div>
      <ThemeToggle />
    </header>
  );
}
