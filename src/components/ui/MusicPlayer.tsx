"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

export const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.2); // 20% default
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
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-sky-500/30 rounded-full blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>

      <div className="relative flex items-center gap-3 px-4 py-2 bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-full shadow-xl shadow-sky-500/10">
        <div className="relative w-10 h-10 flex items-center justify-center">
          <motion.div
            animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
            transition={
              isPlaying
                ? { duration: 3, repeat: Infinity, ease: "linear" }
                : { duration: 0.5 }
            }
            className="absolute w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 via-blue-500 to-violet-400 shadow-lg"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-600"></div>
            </div>
            <div className="absolute inset-0 rounded-full overflow-hidden opacity-40">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-full h-px bg-white"
                  style={{
                    top: "50%",
                    transform: `rotate(${i * 45}deg)`,
                    transformOrigin: "center",
                  }}
                />
              ))}
            </div>
          </motion.div>

          <motion.button
            onClick={togglePlay}
            className="relative z-10 w-10 h-10 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-gray-950 rounded-full"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label={isPlaying ? "Pause music" : "Play music"}
          >
            <AnimatePresence mode="wait">
              {isPlaying ? (
                <motion.span
                  key="pause"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  <Pause className="w-5 h-5 text-white drop-shadow-lg" />
                </motion.span>
              ) : (
                <motion.span
                  key="play"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="ml-0.5"
                >
                  <Play className="w-5 h-5 text-white drop-shadow-lg fill-white" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        <div className="w-px h-6 bg-gradient-to-b from-transparent via-slate-600 to-transparent"></div>

        <div
          className="relative flex items-center gap-2"
          onMouseEnter={() => setShowVolume(true)}
          onMouseLeave={() => setShowVolume(false)}
        >
          <span className="text-slate-400" aria-hidden>
            {volume === 0 ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </span>

          <span className="text-xs font-semibold text-slate-400 w-8 text-center">
            {Math.round(volume * 100)}%
          </span>

          <AnimatePresence>
            {showVolume && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.9 }}
                className="absolute left-1/2 -translate-x-1/2 top-full mt-3 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-4 shadow-xl shadow-sky-500/10"
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">
                    Volume
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-28 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer focus:outline-none"
                    style={{
                      background: `linear-gradient(to right, rgb(14, 165, 233) 0%, rgb(56, 189, 248) ${volume * 100}%, rgb(51, 65, 85) ${volume * 100}%, rgb(51, 65, 85) 100%)`,
                    }}
                    aria-label="Volume control"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-px h-6 bg-gradient-to-b from-transparent via-slate-600 to-transparent"></div>

        <div className="flex items-center gap-2 min-w-[100px]">
          <AnimatePresence mode="wait">
            {isPlaying ? (
              <motion.div
                key="playing"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2"
              >
                <div className="flex gap-0.5 items-end h-4">
                  {[0, 1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-gradient-to-t from-sky-500 to-blue-400 rounded-full"
                      animate={{ height: ["6px", "16px", "6px"] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.15,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </div>
                <span className="text-xs text-slate-300 whitespace-nowrap font-semibold">
                  Now Playing
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="paused"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2"
              >
                <span className="text-xs text-slate-500 whitespace-nowrap font-medium">
                  Paused
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
