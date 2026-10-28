import { BrowserRouter, Navigate, Route, Routes, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Categories from "./pages/Categories";
import Budgets from "./pages/Budgets";
import Profile from "./pages/Profile";
import AppLock from "./pages/AppLock";
import DashboardLayout from "./layouts/DashboardLayout";

function ProtectedRoute() {
  const token = localStorage.getItem("access_token");
  const hasPin = localStorage.getItem("app_pin");
  const isUnlocked = sessionStorage.getItem("app_unlocked") === "true";

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (hasPin && !isUnlocked) {
    return <AppLock />;
  }

  return <DashboardLayout><Outlet /></DashboardLayout>;
}

function App() {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const justUnlocked = params.get("unlocked") === "true";

    const navigationEntries = window.performance.getEntriesByType("navigation");
    const isReload = navigationEntries.length > 0 && navigationEntries[0].type === "reload";

    if (isReload && !justUnlocked) {
      sessionStorage.removeItem("app_unlocked");
    }
  }, [location]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute key={location.pathname} />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/budgets" element={<Budgets />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

export default AppWrapper;