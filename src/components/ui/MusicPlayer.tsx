"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

export const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.2);
  const [showVolume, setShowVolume] = useState(false);
  const [trackAvailable, setTrackAvailable] = useState<boolean | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio("/track.mp3");
    audio.loop = true;
    audio.volume = volume;

    audio.addEventListener("canplaythrough", () => setTrackAvailable(true));
    audio.addEventListener("error", () => setTrackAvailable(false));

    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

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

  if (trackAvailable === false) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-md">
      <button
        onClick={togglePlay}
        className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-600"
        aria-label={isPlaying ? "Pause music" : "Play music"}
      >
        {isPlaying ? (
          <Pause className="w-3.5 h-3.5" />
        ) : (
          <Play className="w-3.5 h-3.5 ml-0.5" />
        )}
      </button>

      <div className="w-px h-4 bg-slate-700" />

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
                  className="w-0.5 bg-cyan-500 rounded-full"
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
            <span className="text-[10px] text-slate-400 font-medium">
              Playing
            </span>
          </motion.div>
        ) : (
          <motion.span
            key="paused"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-[10px] text-slate-500 font-medium"
          >
            Paused
          </motion.span>
        )}
      </AnimatePresence>

      <div className="w-px h-4 bg-slate-700" />

      <div
        className="relative flex items-center"
        onMouseEnter={() => setShowVolume(true)}
        onMouseLeave={() => setShowVolume(false)}
      >
        <span className="text-slate-500 cursor-pointer" aria-hidden>
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
              className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-slate-900 border border-slate-700 rounded-md p-3 shadow-lg"
            >
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-slate-500 font-medium">
                  {Math.round(volume * 100)}%
                </span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-24 h-1 bg-slate-700 rounded-full appearance-none cursor-pointer focus:outline-none"
                  style={{
                    background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${volume * 100}%, #334155 ${volume * 100}%, #334155 100%)`,
                  }}
                  aria-label="Volume control"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
