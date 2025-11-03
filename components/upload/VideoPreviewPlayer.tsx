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
      <div className="w-full max-w-[360px] mx-auto aspect-[9/16] bg-gray-900 rounded-2xl flex items-center justify-center">
        <div className="text-center text-gray-400">
          <MdHd className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Video preview</p>
          <p className="text-xs mt-2">Vertical format (9:16)</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[360px] mx-auto rounded-2xl overflow-hidden bg-black relative shadow-2xl">
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        autoPlay={autoplay}
        muted
        className="w-full aspect-[9/16] object-cover"
        playsInline
      >
        Your browser does not support video playback.
      </video>

      {/* Duration overlay - Top right */}
      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white shadow-lg">
        {formatDuration(currentTime)} / {formatDuration(duration)}
      </div>

      {/* Trim indicators - Bottom with gradient overlay */}
      {(trimStart > 0 || (trimEnd && trimEnd < duration)) && (
        <div className="absolute bottom-20 left-3 right-3">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 backdrop-blur-md px-3 py-2 rounded-full text-xs font-semibold text-white shadow-xl flex items-center justify-center gap-2">
            <span>✂️</span>
            <span>
              Trimmed: {formatDuration(trimStart)} -{" "}
              {formatDuration(trimEnd || duration)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
