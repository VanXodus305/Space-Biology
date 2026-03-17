"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, Music } from "lucide-react";

export const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.2);
  const [showVolume, setShowVolume] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [trackAvailable, setTrackAvailable] = useState<boolean | null>(null);
  const [autoplayAttempted, setAutoplayAttempted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const collapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tryAutoplay = useCallback(() => {
    if (!audioRef.current || autoplayAttempted) return;
    setAutoplayAttempted(true);
    audioRef.current.play().then(() => {
      setIsPlaying(true);
    }).catch(() => {
      const startOnInteraction = () => {
        if (audioRef.current && !audioRef.current.paused) return;
        audioRef.current?.play().then(() => setIsPlaying(true)).catch(() => {});
        document.removeEventListener("click", startOnInteraction);
        document.removeEventListener("keydown", startOnInteraction);
      };
      document.addEventListener("click", startOnInteraction, { once: true });
      document.addEventListener("keydown", startOnInteraction, { once: true });
    });
  }, [autoplayAttempted]);

  useEffect(() => {
    const audio = new Audio("/track.mp3");
    audio.loop = true;
    audio.volume = volume;

    audio.addEventListener("canplaythrough", () => {
      setTrackAvailable(true);
      audioRef.current = audio;
      tryAutoplay();
    });
    audio.addEventListener("error", () => setTrackAvailable(false));

    audioRef.current = audio;

    return () => {
      audio.pause();
      document.removeEventListener("click", () => {});
      document.removeEventListener("keydown", () => {});
      audioRef.current = null;
    };
  }, [tryAutoplay]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current || trackAvailable !== true) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const handleMouseEnter = () => {
    if (collapseTimer.current) {
      clearTimeout(collapseTimer.current);
      collapseTimer.current = null;
    }
    setExpanded(true);
  };

  const handleMouseLeave = () => {
    collapseTimer.current = setTimeout(() => {
      setExpanded(false);
      setShowVolume(false);
    }, 400);
  };

  if (trackAvailable === false) return null;

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => !expanded && setExpanded(true)}
      className="relative"
    >
      <AnimatePresence mode="wait" initial={false}>
        {expanded ? (
          <motion.div
            key="expanded"
            initial={{ width: 36, opacity: 0.8 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 36, opacity: 0.8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#111111] border border-[#262626] rounded-full overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.02)]"
          >
            <button
              onClick={togglePlay}
              className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-md text-[#a3a3a3] hover:text-[#22d3ee] hover:bg-[#1c1c1c] transition-colors focus:outline-none focus:ring-1 focus:ring-[#22d3ee]"
              aria-label={isPlaying ? "Pause music" : "Play music"}
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5" />
              ) : (
                <Play className="w-3.5 h-3.5 ml-0.5" />
              )}
            </button>

            <div className="w-px h-4 bg-[#262626] flex-shrink-0" />

            <AnimatePresence mode="wait">
              {isPlaying ? (
                <motion.div
                  key="playing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5"
                >
                  <div className="flex gap-px items-end h-3">
                    {[0, 1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        className="w-0.5 bg-[#22d3ee] rounded-full"
                        animate={{ height: ["3px", "12px", "3px"] }}
                        transition={{
                          duration: 0.5,
                          repeat: Infinity,
                          delay: i * 0.12,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-[#a3a3a3] font-medium whitespace-nowrap">
                    Playing
                  </span>
                </motion.div>
              ) : (
                <motion.span
                  key="paused"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[10px] text-[#666666] font-medium whitespace-nowrap"
                >
                  Paused
                </motion.span>
              )}
            </AnimatePresence>

            <div className="w-px h-4 bg-[#262626] flex-shrink-0" />

            <div
              className="relative flex items-center"
              onMouseEnter={() => setShowVolume(true)}
              onMouseLeave={() => setShowVolume(false)}
            >
              <span className="text-[#666666] cursor-pointer" aria-hidden>
                {volume === 0 ? (
                  <VolumeX className="w-3.5 h-3.5" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </span>

              <AnimatePresence>
                {showVolume && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-[#141414] border border-[#333] rounded-2xl p-3 shadow-lg z-50"
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="text-[10px] text-[#666666] font-medium">
                        {Math.round(volume * 100)}%
                      </span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-24 h-1 bg-[#262626] rounded-full appearance-none cursor-pointer focus:outline-none"
                        style={{
                          background: `linear-gradient(to right, #ffffff 0%, #ffffff ${volume * 100}%, #404040 ${volume * 100}%, #404040 100%)`,
                        }}
                        aria-label="Volume control"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex h-10 items-center justify-center gap-2 rounded-full border border-[#262626] bg-[#111111] px-3 cursor-pointer transition-colors hover:border-[#22d3ee]/40 hover:bg-[#151515]"
            role="button"
            tabIndex={0}
            aria-label="Open music player"
            onKeyDown={(e) => e.key === "Enter" && setExpanded(true)}
          >
            {isPlaying ? (
              <div className="flex gap-px items-end h-3">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-0.5 bg-[#22d3ee] rounded-full"
                    animate={{ height: ["2px", "10px", "2px"] }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            ) : (
              <>
                <Music className="w-3.5 h-3.5 text-[#666666]" />
                <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#666666]">
                  Audio
                </span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
