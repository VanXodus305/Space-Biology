"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Atom } from "lucide-react";
import { MusicPlayer } from "@/components/ui/MusicPlayer";
import { useState } from "react";
import { usePathname } from "next/navigation";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Explore", path: "/explore" },
    { name: "Query", path: "/search" },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 w-full z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800"
    >
      <div className="flex justify-between items-center max-w-7xl mx-auto h-16 px-6 md:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="bg-cyan-600 p-2 rounded-lg">
            <Atom className="w-5 h-5 text-white" aria-hidden />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-white tracking-tight">
              SpaceBio
            </span>
            <span className="text-xs text-cyan-400 font-semibold uppercase tracking-widest">
              Lab
            </span>
          </div>
        </Link>

        <div className="absolute left-1/2 -translate-x-1/2 max-sm:hidden">
          <MusicPlayer />
        </div>

        <ul className="flex gap-1">
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link href={link.path}>
                <motion.div
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? "text-cyan-400"
                      : "text-slate-400 hover:text-white"
                  }`}
                  onHoverStart={() => setHoveredLink(link.path)}
                  onHoverEnd={() => setHoveredLink(null)}
                  whileTap={{ scale: 0.97 }}
                >
                  {isActive(link.path) && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-cyan-950/60 border border-cyan-800/50 rounded-lg"
                      transition={{
                        type: "spring",
                        bounce: 0.15,
                        duration: 0.5,
                      }}
                    />
                  )}

                  {hoveredLink === link.path && !isActive(link.path) && (
                    <motion.div
                      className="absolute inset-0 bg-slate-800/60 rounded-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    />
                  )}

                  <span className="relative z-10">{link.name}</span>
                </motion.div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </motion.nav>
  );
};
