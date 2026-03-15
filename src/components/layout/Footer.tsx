export const Footer: React.FC = () => {
  return (
    <footer
      id="footer"
      className="bg-gray-950 border-t border-slate-800 py-10 text-center text-slate-400 text-sm"
    >
      <p>Built with ❤️ for NASA Space Apps Challenge 2025 — Team Techlicious</p>
      <p className="mt-2 text-slate-500">
        © {new Date().getFullYear()} Team Techlicious. All rights reserved.
      </p>
    </footer>
  );
};
