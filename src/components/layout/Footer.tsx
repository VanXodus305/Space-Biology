import Link from "next/link";

export const Footer: React.FC = () => {
  return (
    <footer
      id="footer"
      className="bg-[#0a0a0a] border-t border-[#262626] py-12 px-6"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="text-base font-bold text-white mb-1">
              SpaceBio Explorer
            </div>
            <p className="text-sm text-[#666666]">
              NASA Space Apps Challenge 2025 &middot; Team Techlicious
            </p>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/explore"
              className="text-sm text-[#a3a3a3] hover:text-white transition-colors"
            >
              Explore
            </Link>
            <Link
              href="/search"
              className="text-sm text-[#a3a3a3] hover:text-white transition-colors"
            >
              Query
            </Link>
            <span className="text-sm text-[#666666]">
              &copy; {new Date().getFullYear()}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
