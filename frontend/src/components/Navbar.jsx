import { Link } from "react-router-dom";
import {
  FiCreditCard,
  FiUser,
  FiMenu,
} from "react-icons/fi";
import ThemeToggle from "./ThemeToggle";

function Navbar({ onMenuClick }) {
  return (
    <header 
      className="sticky top-0 z-40 flex h-[72px] items-center justify-between border-b px-4 sm:px-6 lg:px-8 transition-colors duration-300"
      style={{ 
        backgroundColor: "var(--card-background)", 
        borderColor: "var(--border-color)" 
      }}
    >
      {/* Left Side: Logo & Mobile Menu */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-xl p-2 transition lg:hidden"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-main)"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          aria-label="Toggle navigation"
        >
          <FiMenu size={22} />
        </button>

        <Link to="/dashboard" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm shadow-violet-500/30">
            <FiCreditCard size={22} />
          </span>

          <span 
            className="text-lg font-extrabold tracking-tight sm:text-xl"
            style={{ color: "var(--text-primary)" }}
          >
            Expense<span className="text-violet-600">Tracker</span>
          </span>
        </Link>
      </div>

      {/* Right Side: Theme & Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Profile Link */}
        <Link
          to="/profile"
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--primary-light-bg)";
            e.currentTarget.style.color = "var(--primary-color)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
        >
          <FiUser size={18} />
          <span className="hidden sm:inline">My Profile</span>
        </Link>
      </div>
    </header>
  );
}

export default Navbar;