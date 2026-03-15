"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Zap } from "lucide-react";
import { MusicPlayer } from "@/components/ui/MusicPlayer";
import { useState } from "react";
import { usePathname } from "next/navigation";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { name: "Home", path: "/", icon: "🏠" },
    { name: "Explore", path: "/explore", icon: "🚀" },
    { name: "Search", path: "/search", icon: "🔍" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 w-full z-50 bg-gradient-to-b from-gray-950 via-gray-950/98 to-transparent backdrop-blur-xl border-b border-slate-800/50"
    >
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-sky-500/50 to-transparent"></div>

      <div className="flex justify-between items-center max-w-7xl mx-auto py-4 px-6 md:px-8">
        <Link href="/" passHref>
          <motion.div
            className="group cursor-pointer flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-sky-500 to-blue-500 rounded-lg blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-sky-500 to-blue-600 p-2 rounded-lg">
                <Zap className="w-5 h-5 text-white" aria-hidden />
              </div>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
                SpaceBio
              </h1>
              <p className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">
                Explorer
              </p>
            </div>
          </motion.div>
        </Link>

        <div className="absolute left-1/2 -translate-x-1/2 max-sm:hidden">
          <MusicPlayer />
        </div>

        <ul className="flex gap-2 md:gap-4">
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link href={link.path}>
                <motion.div
                  className={`relative px-4 py-2 rounded-xl text-sm md:text-base font-medium transition-all ${
                    isActive(link.path)
                      ? "text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                  onHoverStart={() => setHoveredLink(link.path)}
                  onHoverEnd={() => setHoveredLink(null)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isActive(link.path) && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-sky-500/15 border border-sky-500/30 rounded-xl"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}

                  {hoveredLink === link.path && !isActive(link.path) && (
                    <motion.div
                      className="absolute inset-0 bg-sky-500/10 border border-sky-500/20 rounded-xl"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}

                  <span className="relative z-10 flex items-center gap-2">
                    <span className="text-base">{link.icon}</span>
                    <span className="max-sm:hidden">{link.name}</span>
                  </span>
                </motion.div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-sky-500/40 to-transparent blur-sm"></div>
    </motion.nav>
  );
};
