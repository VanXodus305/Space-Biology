import Link from "next/link";

export const Footer: React.FC = () => {
  return (
    <footer
      id="footer"
      className="bg-slate-950 border-t border-slate-800/50 py-12 px-6"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="text-base font-bold text-white mb-1">
              SpaceBio Explorer
            </div>
            <p className="text-sm text-slate-500">
              NASA Space Apps Challenge 2025 &middot; Team Techlicious
            </p>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/explore"
              className="text-sm text-slate-400 hover:text-cyan-400 transition-colors"
            >
              Explore
            </Link>
            <Link
              href="/search"
              className="text-sm text-slate-400 hover:text-cyan-400 transition-colors"
            >
              Query
            </Link>
            <span className="text-sm text-slate-600">
              &copy; {new Date().getFullYear()}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
