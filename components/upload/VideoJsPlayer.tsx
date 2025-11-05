"use client";

import React, {useEffect, useRef} from "react";

interface VideoJsPlayerProps {
  videoUrl: string | null;
  trimStart?: number;
  trimEnd?: number;
  autoplay?: boolean;
  muted?: boolean;
  poster?: string;
  aspectRatio?: "9/16" | "16/9" | string;
  onTimeUpdate?: (time: number) => void;
}

export default function VideoJsPlayer({
  videoUrl,
  trimStart = 0,
  trimEnd,
  autoplay = true,
  muted = true,
  poster,
  aspectRatio = "9/16",
  onTimeUpdate,
}: VideoJsPlayerProps) {
  const videoNodeRef = useRef<HTMLVideoElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any | null>(null);

  useEffect(() => {
    // Only run in browser
    if (typeof window === "undefined") return;

    let mounted = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let VideoJS: any = null;

    const init = async () => {
      try {
        // dynamic import to avoid SSR issues
        const mod = await import("video.js");
        VideoJS = mod?.default || mod;
        // CSS is imported in globals.css
        // await import("video.js/dist/video-js.css");

        if (!mounted || !videoNodeRef.current) return;

        // dispose existing
        if (playerRef.current) {
          try {
            playerRef.current.dispose();
          } catch {
            // ignore
          }
          playerRef.current = null;
        }

        const options = {
          controls: true,
          autoplay: autoplay,
          muted: muted,
          preload: "auto",
          fluid: false,
          poster: poster || undefined,
        };

        playerRef.current = VideoJS(videoNodeRef.current, options, function () {
          // ready callback
        });

        // set source
        if (videoUrl) {
          playerRef.current.src({src: videoUrl});
        }

        // Seek to trimStart when metadata loaded
        playerRef.current.on("loadedmetadata", () => {
          if (typeof trimStart === "number" && trimStart > 0) {
            try {
              playerRef.current.currentTime(trimStart);
            } catch {
              // ignore
            }
          }
        });

        // Time update handler
        playerRef.current.on("timeupdate", () => {
          const t = playerRef.current.currentTime();
          onTimeUpdate?.(t);

          if (typeof trimEnd === "number" && trimEnd > 0 && t >= trimEnd) {
            // Pause and jump to trimStart or loop
            playerRef.current.pause();
            try {
              playerRef.current.currentTime(trimStart || 0);
            } catch {
              // ignore
            }
          }
        });
      } catch {
        // if import or init fails, we silently fail back to native <video>
        // console.error("Video.js init failed");
      }
    };

    init();

    return () => {
      mounted = false;
      if (playerRef.current) {
        try {
          playerRef.current.dispose();
        } catch {
          // ignore
        }
        playerRef.current = null;
      }
    };
  }, [videoUrl, trimStart, trimEnd, autoplay, muted, poster, onTimeUpdate]);

  // Styling wrapper: for vertical (9/16) we keep same max width as previous player
  const wrapperClass =
    aspectRatio === "9/16"
      ? "w-full max-w-[360px] mx-auto rounded-2xl overflow-hidden bg-black relative shadow-2xl"
      : "w-full rounded-2xl overflow-hidden bg-black relative";

  return (
    <div className={wrapperClass}>
      {/* video.js will decorate this video element */}
      <video
        ref={videoNodeRef}
        className="video-js vjs-big-play-centered w-full h-full"
        playsInline
      />
      {/* duration/time overlay will be provided by UploadModal logic via onTimeUpdate */}
    </div>
  );
}
