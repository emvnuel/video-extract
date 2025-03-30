
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Download, Film, ExternalLink } from "lucide-react";
import { toast } from "sonner";

// Define the video interface
export interface Video {
  id: string;
  title: string;
  thumbnail?: string;
  source: string;
  resolution?: string;
  fileSize?: string;
  format?: string;
  url: string;
}

interface VideoCardProps {
  video: Video;
}

export function VideoCard({ video }: VideoCardProps) {
  const handleDownload = () => {
    toast.success("Download started", {
      description: `Downloading ${video.title}`,
    });
    
    // In a real app, this would initiate the actual download
    // window.location.href = video.url;
  };

  const handleOpenSource = () => {
    window.open(video.source, "_blank", "noopener,noreferrer");
  };

  return (
    <Card className="overflow-hidden card-hover">
      <div className="relative aspect-video bg-muted">
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Film className="h-12 w-12 text-muted-foreground opacity-50" />
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-medium line-clamp-2" title={video.title}>
            {video.title}
          </h3>
          
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {video.resolution && (
              <span className="bg-muted px-2 py-1 rounded-md">
                {video.resolution}
              </span>
            )}
            {video.fileSize && (
              <span className="bg-muted px-2 py-1 rounded-md">
                {video.fileSize}
              </span>
            )}
            {video.format && (
              <span className="bg-muted px-2 py-1 rounded-md">
                {video.format}
              </span>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between gap-2">
        <Button 
          className="flex-1" 
          onClick={handleDownload}
          size="sm"
        >
          <Download className="h-4 w-4 mr-1" />
          Download
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleOpenSource}
          title="View source page"
        >
          <ExternalLink className="h-4 w-4" />
          <span className="sr-only">View source</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
