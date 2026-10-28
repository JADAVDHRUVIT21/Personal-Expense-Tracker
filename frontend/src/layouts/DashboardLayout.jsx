import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    /* Changed bg-slate-50 to use the CSS variable for dark mode support */
    <div 
      className="min-h-screen" 
      style={{ backgroundColor: "var(--bg-main)", color: "var(--text-primary)" }}
    >
      <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

      <div className="flex min-h-[calc(100vh-72px)]">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
        />

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;