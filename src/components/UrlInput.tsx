
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Upload } from "lucide-react";
import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";

interface UrlInputProps {
  onExtract: (url: string, isFile?: boolean) => void;
  isLoading: boolean;
}

export function UrlInput({ onExtract, isLoading }: UrlInputProps) {
  const [url, setUrl] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast({
        title: "URL is required",
        description: "Please enter a valid webpage URL",
        variant: "destructive",
      });
      return;
    }
    
    // Basic URL validation
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      setUrl(`https://${url}`);
    }
    
    onExtract(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type !== "text/html") {
      toast({
        title: "Invalid file type",
        description: "Please upload an HTML file",
        variant: "destructive",
      });
      return;
    }
    
    // Here we would handle the file, but for now just notify
    toast({
      title: "File received",
      description: `Processing ${file.name}`,
    });
    
    // In real implementation we'd read the file and extract videos
    onExtract(file.name, true);
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-card rounded-lg p-6 shadow-md animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Paste webpage URL here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full h-12 text-base pl-4 pr-10 rounded-lg border-2 border-input focus:border-primary focus:ring-primary"
              disabled={isLoading}
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
          <Button
            type="submit"
            className={`h-12 px-6 font-medium transition-all ${
              isLoading ? "animate-pulse-gentle" : ""
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Extracting..." : "Extract Videos"}
          </Button>
        </div>
        
        <div className="flex items-center justify-center">
          <div className="border-t flex-grow border-border"></div>
          <span className="px-4 text-sm text-muted-foreground">OR</span>
          <div className="border-t flex-grow border-border"></div>
        </div>
        
        <div className="flex justify-center">
          <div className="relative">
            <input
              type="file"
              id="file-upload"
              className="sr-only"
              onChange={handleFileUpload}
              accept=".html,.htm"
              disabled={isLoading}
            />
            <label
              htmlFor="file-upload"
              className="flex items-center gap-2 text-sm bg-muted hover:bg-muted/80 text-muted-foreground px-4 py-2 rounded-md cursor-pointer transition-colors"
            >
              <Upload size={16} />
              Upload HTML file
            </label>
          </div>
        </div>
      </form>
    </div>
  );
}
