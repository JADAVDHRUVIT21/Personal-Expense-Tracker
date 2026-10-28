import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiCreditCard,
  FiTag,
  FiTarget,
  FiUser,
  FiX,
  FiLogOut,
} from "react-icons/fi";
import { logoutUser } from "../services/authService";

const navigationItems = [
  { label: "Dashboard", path: "/dashboard", icon: FiGrid },
  { label: "Expenses", path: "/expenses", icon: FiCreditCard },
  { label: "Categories", path: "/categories", icon: FiTag },
  { label: "Budgets", path: "/budgets", icon: FiTarget },
];

function Sidebar({ isOpen = false, onClose }) {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logoutUser();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed bottom-0 left-0 top-[72px] z-50 flex w-[260px] flex-col border-r px-4 py-6 transition-transform duration-300 lg:sticky lg:top-[72px] lg:z-10 lg:h-[calc(100vh-72px)] lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          backgroundColor: "var(--card-background)",
          borderColor: "var(--border-color)",
        }}
      >
        <div className="mb-7 flex items-center justify-between px-3">
          <span 
            className="text-xs font-bold uppercase tracking-[0.16em]"
            style={{ color: "var(--text-secondary)" }}
          >
            Workspace
          </span>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 transition-colors lg:hidden"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-main)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            aria-label="Close sidebar"
          >
            <FiX size={19} />
          </button>
        </div>

        <nav className="flex flex-col gap-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                      : "hover:bg-violet-50 hover:text-violet-700"
                  }`
                }
                style={({ isActive }) => ({
                  color: isActive ? "#ffffff" : "var(--text-secondary)"
                })}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-2 border-t pt-5" style={{ borderColor: "var(--border-color)" }}>
          <span 
            className="px-3 pb-2 text-xs font-bold uppercase tracking-[0.16em]"
            style={{ color: "var(--text-secondary)" }}
          >
            Account
          </span>
          
          <NavLink
            to="/profile"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                  : "hover:bg-violet-50 hover:text-violet-700"
              }`
            }
            style={({ isActive }) => ({
              color: isActive ? "#ffffff" : "var(--text-secondary)"
            })}
          >
            <FiUser size={19} />
            <span>My Profile</span>
          </NavLink>

          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200"
            style={{ color: "var(--danger-color)" }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--danger-light-bg)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
            <FiLogOut size={19} className="transition-transform group-hover:-translate-x-1" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-[100000] flex items-center justify-center p-4 transition-colors duration-300"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.45)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            aria-describedby="logout-desc"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(320px, calc(100vw - 48px))",
              backgroundColor: "var(--card-background)",
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
              textAlign: "center",
              animation: "iosModalIn 0.25s cubic-bezier(0.32, 0.72, 0, 1)",
            }}
          >
            <div className="px-5 pt-6 pb-5">
              <div
                className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full"
                style={{
                  backgroundColor: "var(--danger-light-bg)",
                  color: "var(--danger-color)",
                }}
              >
                <FiLogOut size={24} />
              </div>
              <h3
                id="logout-title"
                className="text-[17px] font-semibold mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                Logout?
              </h3>
              <p
                id="logout-desc"
                className="text-[13px] leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                Are you sure you want to log out of your account?
              </p>
            </div>

            <div
              className="flex border-t"
              style={{ borderColor: "var(--border-color)" }}
            >
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3.5 text-[17px] font-medium transition"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-main)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                Cancel
              </button>
              <div
                className="w-[1px]"
                style={{ backgroundColor: "var(--border-color)" }}
              />
              <button
                type="button"
                onClick={confirmLogout}
                className="flex-1 py-3.5 text-[17px] font-semibold transition"
                style={{ color: "var(--danger-color)" }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--danger-light-bg)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes iosModalIn {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}
      </style>
    </>
  );
}

export default Sidebar;