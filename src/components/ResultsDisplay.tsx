
import { useState } from "react";
import { Video, VideoCard } from "./VideoCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownAZ, ArrowUpDown, Filter, Loader, Play } from "lucide-react";

interface ResultsDisplayProps {
  videos: Video[];
  isLoading: boolean;
}

type SortOption = "relevance" | "resolution" | "size" | "title";

export function ResultsDisplay({ videos, isLoading }: ResultsDisplayProps) {
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  
  const handleSortChange = (value: string) => {
    setSortBy(value as SortOption);
  };
  
  // Function to sort videos based on the selected option
  const sortedVideos = [...videos].sort((a, b) => {
    switch (sortBy) {
      case "title":
        return a.title.localeCompare(b.title);
      case "resolution":
        // Very simple resolution comparison logic - in a real app would be more sophisticated
        return (b.resolution || "").localeCompare(a.resolution || "");
      case "size":
        // Simple size comparison assuming format is "X.X MB" - in a real app would be more sophisticated
        return (b.fileSize || "").localeCompare(a.fileSize || "");
      default:
        return 0;
    }
  });

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12">
        <Loader className="h-8 w-8 text-primary animate-spin mb-4" />
        <p className="text-lg font-medium">Extracting videos from page...</p>
        <p className="text-muted-foreground mt-2">This may take a moment</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12">
        <Play className="h-10 w-10 text-muted-foreground mb-4" />
        <p className="text-lg font-medium">No videos found yet</p>
        <p className="text-muted-foreground mt-2">
          Enter a URL above to extract videos
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">
          {videos.length} {videos.length === 1 ? "Video" : "Videos"} Found
        </h2>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground mr-2">Sort by:</span>
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="resolution">Resolution</SelectItem>
              <SelectItem value="size">File Size</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedVideos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
      
      {videos.length > 9 && (
        <div className="flex justify-center pt-4">
          <Button variant="outline">
            Load More Videos
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
