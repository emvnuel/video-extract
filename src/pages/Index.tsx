import { useState } from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Header } from "@/components/Header";
import { UrlInput } from "@/components/UrlInput";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { Footer } from "@/components/Footer";
import { Video } from "@/components/VideoCard";
import { Toaster } from "sonner";

const Index = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleExtract = async (url: string, isFile = false) => {
    setIsLoading(true);
    
    try {
      if (isFile) {
        // Handle file upload
        const formData = new FormData();
        formData.append('file', new File([url], 'upload.html', { type: 'text/html' }));
        
        const response = await fetch('http://localhost:8000/api/extract/file', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Failed to extract videos from file');
        }
        
        const data = await response.json();
        setVideos(data);
      } else {
        // Handle URL extraction
        const response = await fetch(`http://localhost:8000/api/extract?url=${encodeURIComponent(url)}`);
        
        if (!response.ok) {
          throw new Error('Failed to extract videos from URL');
        }
        
        const data = await response.json();
        setVideos(data);
      }
    } catch (error) {
      console.error('Error extracting videos:', error);
      // You might want to show an error toast here
    } finally {
      setIsLoading(false);
    }
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
