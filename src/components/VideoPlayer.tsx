import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Play, Pause, Volume2, VolumeX, Maximize2, AlertTriangle, Tv, RefreshCw } from "lucide-react";
import { motion } from "motion/react";

interface VideoPlayerProps {
  url: string;
  name: string;
  logo: string;
  group: string;
}

export default function VideoPlayer({ url, name, logo, group }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Lock orientation to landscape when entering fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen =
        document.fullscreenElement === containerRef.current ||
        (document as any).webkitFullscreenElement === containerRef.current ||
        document.fullscreenElement === videoRef.current ||
        (document as any).webkitFullscreenElement === videoRef.current;

      if (isFullscreen) {
        if (screen.orientation && typeof (screen.orientation as any).lock === "function") {
          (screen.orientation as any).lock("landscape").catch((err: any) => {
            console.warn("Screen orientation lock failed:", err);
          });
        }
      } else {
        if (screen.orientation && typeof (screen.orientation as any).unlock === "function") {
          (screen.orientation as any).unlock();
        }
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Restart/Reload stream helper
  const loadStream = () => {
    const video = videoRef.current;
    if (!video) return;

    setIsLoading(true);
    setIsError(false);
    setIsPlaying(false);

    // Clean up existing Hls instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        maxMaxBufferLength: 10,
        enableWorker: true,
        lowLatencyMode: true,
      });
      hlsRef.current = hls;

      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        video.play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Auto play might have been blocked, set state to paused
            setIsPlaying(false);
          });
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        console.warn("HLS.js warning/error:", data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error("Fatal network error in HLS playback. Attempting recovery...");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error("Fatal media error. Attempting recovery...");
              hls.recoverMediaError();
              break;
            default:
              console.error("Unrecoverable playback error.");
              setIsError(true);
              setIsLoading(false);
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // For Safari and iOS
      video.src = url;
      video.addEventListener("loadedmetadata", () => {
        setIsLoading(false);
        video.play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      });
      video.addEventListener("error", () => {
        setIsError(true);
        setIsLoading(false);
      });
    } else {
      setIsError(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStream();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [url]);

  // Adjust volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (videoRef.current) {
      videoRef.current.volume = v;
      videoRef.current.muted = v === 0;
    }
    setIsMuted(v === 0);
  };

  // Toggle Play
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    const nextMuted = !isMuted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
    if (nextMuted) {
      setVolume(0);
    } else {
      setVolume(1);
      video.volume = 1;
    }
  };

  // Fullscreen
  const toggleFullscreen = () => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    const requestFS =
      container.requestFullscreen ||
      (container as any).webkitRequestFullscreen ||
      (container as any).mozRequestFullScreen ||
      (container as any).msRequestFullscreen;

    if (requestFS) {
      requestFS.call(container);
    } else {
      const videoRequestFS =
        video.requestFullscreen ||
        (video as any).webkitRequestFullscreen ||
        (video as any).mozRequestFullScreen ||
        (video as any).msRequestFullscreen;
      if (videoRequestFS) {
        videoRequestFS.call(video);
      }
    }
  };

  // Handle Controls Timeout
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (showControls && isPlaying) {
      timeoutId = setTimeout(() => {
        setShowControls(false);
      }, 3500);
    }
    return () => clearTimeout(timeoutId);
  }, [showControls, isPlaying]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full max-w-full max-h-full rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-2xl group flex flex-col justify-center items-center"
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full h-full object-fill cursor-pointer"
        onClick={togglePlay}
        playsInline
      />

      {/* Watermark / Channel Info Floating badge */}
      <div className="absolute top-4 left-4 z-40 flex items-center gap-2.5 bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-white select-none">
        {logo ? (
          <img
            src={logo}
            alt=""
            referrerPolicy="no-referrer"
            className="w-5 h-5 rounded-md object-cover bg-white"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <Tv className="w-4 h-4 text-emerald-400" />
        )}
        <div className="flex flex-col ml-0.5">
          <span className="text-xs font-semibold tracking-wide font-sans">{name}</span>
          <span className="text-[9px] text-zinc-400 uppercase font-mono font-medium -mt-0.5">{group}</span>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-30 flex flex-col justify-center items-center bg-zinc-950/85 backdrop-blur-sm transition-all duration-300">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin"></div>
            <Tv className="absolute w-6 h-6 text-emerald-400 animate-pulse" />
          </div>
          <p className="mt-4 text-sm font-medium tracking-wide text-zinc-300 animate-pulse font-sans">
            Loading Live Stream...
          </p>
        </div>
      )}

      {/* Error / Offline Overlay */}
      {isError && (
        <div className="absolute inset-0 z-30 flex flex-col justify-center items-center bg-zinc-950 px-6 text-center">
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl mb-4">
            <AlertTriangle className="w-10 h-10 text-amber-500 animate-bounce" />
          </div>
          <h4 className="text-emerald-50 text-base font-bold font-sans tracking-wide">Live Stream Offline</h4>
          <p className="text-zinc-400 text-xs mt-1.5 max-w-md">
            This stream is currently offline, unavailable in your region, or the link has expired. 
          </p>
          <button
            onClick={loadStream}
            className="mt-4 flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all text-black font-semibold text-xs py-2 px-4 rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry Connection
          </button>
        </div>
      )}

      {/* Custom Controls Bar */}
      <div
        className={`absolute bottom-0 inset-x-0 z-40 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end gap-3 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="p-2 rounded-lg hover:bg-white/10 active:scale-95 transition-all text-white cursor-pointer"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
            </button>

            {/* Mute/Volume Button */}
            <div className="flex items-center gap-2 group/volume">
              <button
                onClick={toggleMute}
                className="p-2 rounded-lg hover:bg-white/10 active:scale-95 transition-all text-white cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 rounded-lg bg-zinc-700 accent-emerald-400 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Indicator */}
            <div className="flex items-center gap-1.5 bg-red-600/90 text-[10px] text-white font-extrabold uppercase font-mono px-2 py-0.5 rounded-md tracking-wider animate-pulse shadow-sm">
              <span className="w-1 h-1 bg-white rounded-full"></span>
              Live
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg hover:bg-white/10 active:scale-95 transition-all text-white cursor-pointer"
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
