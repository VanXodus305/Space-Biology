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
      className="fixed top-0 w-full z-50 bg-[#0a0a0a]/92 backdrop-blur-xl border-b border-white/10"
    >
      <div className="flex justify-between items-center max-w-7xl mx-auto h-[4.5rem] px-6 md:px-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#262626] bg-[#141414] text-white transition-colors group-hover:border-[#e8e8e8]/40 group-hover:bg-[#1a1a1a] group-hover:text-white">
            <Atom className="w-5 h-5" aria-hidden />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-white tracking-tight">
              SpaceBio
            </span>
            <span className="text-xs text-[#a3a3a3] font-semibold uppercase tracking-widest">
              Lab
            </span>
          </div>
        </Link>

        <div className="absolute left-1/2 -translate-x-1/2 max-sm:hidden">
          <MusicPlayer />
        </div>

        <ul className="flex gap-1 rounded-full border border-[#262626] bg-[#111111] p-1">
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link href={link.path}>
                <motion.div
                  layout
                  className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? "text-[#e8e8e8]"
                      : "text-[#a3a3a3] hover:text-white"
                  }`}
                  onHoverStart={() => setHoveredLink(link.path)}
                  onHoverEnd={() => setHoveredLink(null)}
                  whileTap={{ scale: 0.97 }}
                >
                  {isActive(link.path) && (
                    <motion.div
                      layoutId="activeTab"
                      layout
                      className="absolute inset-0 rounded-full border border-white/10 bg-[#1c1c1c]"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}

                  {hoveredLink === link.path && !isActive(link.path) && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-white/[0.04]"
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
