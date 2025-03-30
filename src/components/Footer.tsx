
import { Github, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full py-6 mt-10 border-t">
      <div className="container flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h3 className="font-semibold text-sm mb-1">How it works</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            VideoExtract scans the provided URL, identifies embedded video content, 
            and makes it available for download. We don't store the videos on our servers.
          </p>
        </div>
        
        <div className="flex flex-col items-center md:items-end text-center md:text-right">
          <div className="flex space-x-4 mb-2">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </a>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} VideoExtract. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
