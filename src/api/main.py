from fastapi import FastAPI, HTTPException, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse, Response
from typing import List, Optional
import yt_dlp
import tempfile
import os
import uuid
import re
from urllib.parse import urlparse
import mimetypes
from datetime import datetime
import logging
import requests
import aiohttp
import asyncio

app = FastAPI(
    title="Video Extractor API",
    description="API for extracting videos from web pages using yt-dlp",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VideoInfo:
    def __init__(self, info_dict: dict):
        self.id = info_dict.get('id', str(uuid.uuid4()))
        self.title = info_dict.get('title', 'Untitled Video')
        # Get the URL from either the direct URL or the formats list
        self.url = info_dict.get('url', '')
        if not self.url and 'formats' in info_dict:
            # Try to get the best format URL
            formats = info_dict['formats']
            if formats:
                # Sort formats by quality (prefer video+audio)
                formats.sort(key=lambda x: (
                    x.get('acodec', 'none') != 'none' and x.get('vcodec', 'none') != 'none',
                    x.get('height', 0),
                    x.get('filesize', 0)
                ), reverse=True)
                self.url = formats[0].get('url', '')
        
        self.thumbnail = info_dict.get('thumbnail', '')
        self.duration = info_dict.get('duration', 0)
        self.width = info_dict.get('width', 0)
        self.height = info_dict.get('height', 0)
        self.ext = info_dict.get('ext', 'mp4')
        self.filesize = info_dict.get('filesize_approx', info_dict.get('filesize', 0))
        self.resolution = f"{self.width}x{self.height}" if self.width and self.height else ""
        
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'url': self.url,
            'thumbnail': self.thumbnail,
            'duration': self.duration,
            'resolution': self.resolution,
            'format': self.ext.upper(),
            'fileSize': self.format_filesize(),
            'source': self.get_domain()
        }
    
    def format_filesize(self):
        if not self.filesize:
            return "Unknown size"
        size = int(self.filesize)
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024:
                return f"{size:.1f} {unit}"
            size /= 1024
        return f"{size:.1f} TB"
    
    def get_domain(self):
        if not self.url:
            return ""
        parsed = urlparse(self.url)
        return f"{parsed.scheme}://{parsed.netloc}"

def is_valid_url(url: str) -> bool:
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except ValueError:
        return False

def extract_videos_from_url(url: str) -> List[dict]:
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'extract_flat': False,  # Changed to False to get full video info
        'force_generic_extractor': False,  # Changed to False to get full video info
        'format': 'best',  # Get the best quality
    }
    
    videos = []
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
            if 'entries' in info:
                # This is a playlist or list of videos
                for entry in info['entries']:
                    if entry:
                        video_info = VideoInfo(entry)
                        if video_info.url:  # Only add videos with valid URLs
                            videos.append(video_info.to_dict())
            else:
                # Single video
                video_info = VideoInfo(info)
                if video_info.url:  # Only add videos with valid URLs
                    videos.append(video_info.to_dict())
                
    except yt_dlp.utils.DownloadError as e:
        logger.error(f"Error extracting videos from {url}: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Could not extract videos: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error processing {url}: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred")
    
    return videos

@app.get("/api/extract", response_model=List[dict])
async def extract_videos(url: str = Query(..., description="URL of the webpage to extract videos from")):
    """
    Extract video information from a given URL
    """
    if not is_valid_url(url):
        raise HTTPException(status_code=400, detail="Invalid URL provided")
    
    try:
        videos = extract_videos_from_url(url)
        return videos
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/download")
async def download_video(url: str = Query(..., description="URL of the video to download")):
    """
    Download a video directly from a URL
    """
    if not is_valid_url(url):
        raise HTTPException(status_code=400, detail="Invalid URL provided")
    
    try:
        logger.info(f"Starting download for URL: {url}")
        
        # Common browser headers to bypass restrictions
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'video',
            'Sec-Fetch-Mode': 'no-cors',
            'Sec-Fetch-Site': 'cross-site',
            'Sec-Fetch-User': '?1',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Range': 'bytes=0-',
            'Referer': urlparse(url).scheme + '://' + urlparse(url).netloc
        }

        async with aiohttp.ClientSession() as session:
            logger.info("Created aiohttp session")
            try:
                async with session.get(url, headers=headers) as response:
                    logger.info(f"Got response with status: {response.status}")
                    
                    # Accept both 200 and 206 status codes (206 is for partial content)
                    if response.status not in [200, 206]:
                        try:
                            error_text = await response.text()
                            logger.error(f"Failed to fetch video. Status: {response.status}, Response: {error_text}")
                            raise HTTPException(status_code=400, detail=f"Failed to fetch video: {error_text}")
                        except UnicodeDecodeError:
                            # If we can't decode the response as text, just use the status code
                            logger.error(f"Failed to fetch video. Status: {response.status}")
                            raise HTTPException(status_code=400, detail=f"Failed to fetch video: HTTP {response.status}")
                    
                    # Get the filename from the URL or use a default
                    filename = url.split('/')[-1]
                    if not filename or '.' not in filename:
                        filename = f"video_{datetime.now().timestamp()}.mp4"
                    logger.info(f"Using filename: {filename}")
                    
                    # Get the video content
                    logger.info("Reading video content...")
                    content = await response.read()
                    logger.info(f"Read {len(content)} bytes of content")
                    
                    # Get content type from response headers
                    content_type = response.headers.get('Content-Type', 'application/octet-stream')
                    logger.info(f"Content type: {content_type}")
                    
                    return Response(
                        content=content,
                        media_type=content_type,
                        headers={
                            "Content-Disposition": f"attachment; filename={filename}",
                            "Content-Length": str(len(content))
                        }
                    )
            except aiohttp.ClientError as e:
                logger.error(f"Network error during download: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Network error: {str(e)}")
            
    except Exception as e:
        logger.error(f"Download error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)