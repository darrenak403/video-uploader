"use client";

import {useRef, useEffect, useState} from "react";
import {MdHd} from "react-icons/md";
import {formatDuration} from "@/lib/utils";

interface VideoPreviewPlayerProps {
  videoUrl: string | null;
  trimStart?: number;
  trimEnd?: number;
  autoplay?: boolean;
  onTimeUpdate?: (currentTime: number) => void;
}

export default function VideoPreviewPlayer({
  videoUrl,
  trimStart = 0,
  trimEnd,
  autoplay = true,
  onTimeUpdate,
}: VideoPreviewPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      if (trimStart > 0) {
        video.currentTime = trimStart;
      }
    };

    const handleTimeUpdate = () => {
      const time = video.currentTime;
      setCurrentTime(time);
      onTimeUpdate?.(time);

      // Handle trim end
      if (trimEnd && time >= trimEnd) {
        video.pause();
        video.currentTime = trimStart;
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, [trimStart, trimEnd, onTimeUpdate]);

  if (!videoUrl) {
    return (
      <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-400">
          <MdHd className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Video preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg overflow-hidden bg-black relative">
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        autoPlay={autoplay}
        muted
        className="w-full aspect-video"
        playsInline
      >
        Your browser does not support video playback.
      </video>

      {/* HD Badge */}
      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-white flex items-center gap-1">
        <MdHd />
        <span>HD</span>
      </div>

      {/* Duration overlay */}
      <div className="absolute bottom-16 right-4 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-xs text-white">
        {formatDuration(currentTime)} / {formatDuration(duration)}
      </div>

      {/* Trim indicators */}
      {(trimStart > 0 || (trimEnd && trimEnd < duration)) && (
        <div className="absolute bottom-16 left-4 bg-yellow-500/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-black">
          ✂️ Đã cắt: {formatDuration(trimStart)} -{" "}
          {formatDuration(trimEnd || duration)}
        </div>
      )}
    </div>
  );
}
