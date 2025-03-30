
import { useState } from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Header } from "@/components/Header";
import { UrlInput } from "@/components/UrlInput";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { Footer } from "@/components/Footer";
import { Video } from "@/components/VideoCard";
import { Toaster } from "sonner";

// Mock data for demo purposes
const mockVideos: Video[] = [
  {
    id: "1",
    title: "Introduction to Video Extraction",
    thumbnail: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    source: "https://example.com/intro",
    resolution: "1080p",
    fileSize: "24.5 MB",
    format: "MP4",
    url: "#video1"
  },
  {
    id: "2",
    title: "Advanced Techniques for Web Scraping",
    thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    source: "https://example.com/advanced",
    resolution: "720p",
    fileSize: "18.2 MB",
    format: "MP4",
    url: "#video2"
  },
  {
    id: "3",
    title: "How to Extract Videos Efficiently",
    thumbnail: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    source: "https://example.com/efficiency",
    resolution: "4K",
    fileSize: "156 MB",
    format: "MKV",
    url: "#video3"
  }
];

const Index = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleExtract = async (url: string, isFile = false) => {
    setIsLoading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setVideos(mockVideos);
      setIsLoading(false);
    }, 2000);
    
    // In a real app, you'd fetch the videos from the URL here
    console.log(`Extracting videos from ${isFile ? "file" : "URL"}: ${url}`);
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col w-full">
        <Header />
        
        <main className="flex-grow container py-8 px-4">
          <div className="flex flex-col items-center space-y-10">
            <div className="w-full space-y-6 max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Extract Videos from Any Website
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Simply paste the URL of a webpage containing videos, and we'll find and prepare them for download.
              </p>
            </div>
            
            <UrlInput onExtract={handleExtract} isLoading={isLoading} />
            
            <div className="w-full max-w-6xl mx-auto">
              <ResultsDisplay videos={videos} isLoading={isLoading} />
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
      <Toaster richColors />
    </ThemeProvider>
  );
};

export default Index;
