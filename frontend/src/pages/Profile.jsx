import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLogOut, FiShield, FiAlertTriangle } from "react-icons/fi";
import "./Profile.css";
import ThemeToggle from "../components/ThemeToggle";
import { logoutUser } from "../services/authService";

const API_BASE_URL = "http://127.0.0.1:8000/api/v1";

function getAccessToken() {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    ""
  );
}

async function readResponse(response) {
  if (response.status === 204) return null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return response.json();
  return null;
}

function Profile() {
  const navigate = useNavigate();
  
  const [name, setName] = useState("");
  const [savedName, setSavedName] = useState("");
  const [email, setEmail] = useState("");

  // Security PIN States
  const [savedPin, setSavedPin] = useState(localStorage.getItem("app_pin") || "");
  const [newPin, setNewPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinSuccess, setPinSuccess] = useState("");
  
  // Modal States
  const [showRemovePinConfirm, setShowRemovePinConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [notice, setNotice] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [pendingPasswordData, setPendingPasswordData] = useState(null);

  const showNotice = useCallback((text, type = "success") => {
    setNotice({ text, type });
  }, []);

  const dismissNotice = useCallback(() => setNotice(null), []);

  useEffect(() => {
    if (!notice) return undefined;
    const timeoutId = window.setTimeout(() => setNotice(null), 5000);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  const loadProfile = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setLoadingProfile(false);
      showNotice("Please log in again to view your profile.", "error");
      return;
    }
    setLoadingProfile(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      const data = await readResponse(response);

      if (!response.ok) throw new Error(data?.detail || "Unable to load your profile.");

      const userName = data.full_name || data.name || "";
      const userEmail = data.email || "";

      setName(userName);
      setSavedName(userName);
      setEmail(userEmail);

      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({
        ...storedUser,
        ...data,
        name: userName,
        full_name: userName,
        email: userEmail,
      }));
    } catch (error) {
      showNotice(error.message || "Could not connect to the backend.", "error");
    } finally {
      setLoadingProfile(false);
    }
  }, [showNotice]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  // --- PIN HANDLING ---
  const handlePinSubmit = (e) => {
    e.preventDefault();
    setPinError("");
    setPinSuccess("");

    if (newPin.length !== 4 && newPin.length !== 6) {
      setPinError("PIN must be exactly 4 or 6 digits.");
      return;
    }

    if (!/^\d+$/.test(newPin)) {
      setPinError("PIN can only contain numbers.");
      return;
    }

    localStorage.setItem("app_pin", newPin);
    setSavedPin(newPin);
    setPinSuccess("Security PIN updated successfully.");
    setNewPin("");
    showNotice("Security PIN has been saved.", "success");
  };

  const executeRemovePin = () => {
    localStorage.removeItem("app_pin");
    setSavedPin("");
    setShowRemovePinConfirm(false);
    showNotice("Security PIN removed.", "info");
  };

  // --- PROFILE UPDATE ---
  async function handleProfileSubmit(event) {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) return showNotice("Please enter your name.", "error");
    if (trimmedName.length > 100) return showNotice("Name must be 100 characters or fewer.", "error");
    if (trimmedName === savedName) return showNotice("Your name has not changed.", "info");

    const token = getAccessToken();
    if (!token) return showNotice("Please log in again.", "error");

    setSavingProfile(true);
    dismissNotice();

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ full_name: trimmedName }),
      });
      const data = await readResponse(response);

      if (!response.ok) throw new Error(data?.detail || "Unable to update your name.");
      const updatedName = data?.full_name || trimmedName;
      setName(updatedName);
      setSavedName(updatedName);

      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({
        ...storedUser, ...data, name: updatedName, full_name: updatedName, email: data?.email || email,
      }));

      showNotice("Your name has been updated successfully.", "success");
    } catch (error) {
      showNotice(error.message || "Unable to update your name.", "error");
    } finally {
      setSavingProfile(false);
    }
  }

  // --- PASSWORD UPDATE ---
  function handlePasswordSubmit(event) {
    event.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) return showNotice("Please fill in all password fields.", "error");
    if (newPassword.length < 8) return showNotice("Your new password must contain at least 8 characters.", "error");
    if (newPassword !== confirmPassword) return showNotice("The new passwords do not match.", "error");
    if (currentPassword === newPassword) return showNotice("Your new password must differ from your current password.", "error");

    setPendingPasswordData({ currentPassword, newPassword });
    setShowPasswordConfirm(true);
  }

  async function confirmPasswordChange() {
    setShowPasswordConfirm(false);
    const data = pendingPasswordData;
    setPendingPasswordData(null);
    if (!data) return;

    const token = getAccessToken();
    if (!token) return showNotice("Session expired. Log in again.", "error");

    setChangingPassword(true);
    dismissNotice();

    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ current_password: data.currentPassword, new_password: data.newPassword }),
      });
      const responseData = await readResponse(response);

      if (!response.ok) throw new Error(responseData?.detail || "Unable to update your password.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showNotice("Your password has been updated successfully.", "success");
    } catch (error) {
      showNotice(error.message || "Unable to update your password.", "error");
    } finally {
      setChangingPassword(false);
    }
  }

  // --- LOGOUT ---
  const executeLogout = () => {
    setShowLogoutConfirm(false);
    logoutUser();
    navigate("/login", { replace: true });
  };

  const initials = name.trim()
    ? name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()
    : "U";

  return (
    <main className="profile-page">
      <header className="profile-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <span className="profile-eyebrow">ACCOUNT SETTINGS</span>
          <h1>My Profile</h1>
          <p>Manage your personal information and account security.</p>
        </div>
        <ThemeToggle />
      </header>

      {notice && (
        <div
          className={`profile-notice ${notice.type}`}
          role={notice.type === "error" ? "alert" : "status"}
          style={{
            position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)", zIndex: 99999,
            width: "min(560px, calc(100vw - 32px))", padding: "14px 16px", borderRadius: "14px",
            background: notice.type === "error" ? "#fff1f2" : "#ecfdf5",
            color: notice.type === "error" ? "#9f1239" : "#065f46",
            border: `1px solid ${notice.type === "error" ? "#fecdd3" : "#a7f3d0"}`,
            display: "flex", alignItems: "center", gap: "12px"
          }}
        >
          <span>{notice.type === "error" ? "!" : "✓"}</span>
          <span style={{ flex: 1 }}>{notice.text}</span>
          <button onClick={dismissNotice} style={{ border: "none", background: "transparent", fontSize: "20px", cursor: "pointer" }}>×</button>
        </div>
      )}

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutConfirm && (
        <div
          className="ios-dialog-overlay"
          style={{
            position: "fixed", inset: 0, zIndex: 100000, display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0, 0, 0, 0.45)", backdropFilter: "blur(4px)", animation: "fadeIn 0.2s ease",
          }}
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="ios-dialog"
            role="alertdialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(320px, calc(100vw - 48px))",
              background: "var(--card-background, #fff)",
              backdropFilter: "blur(20px)",
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
              textAlign: "center",
              animation: "iosDialogIn 0.25s cubic-bezier(0.32, 0.72, 0, 1)",
            }}
          >
            <div style={{ padding: "24px 20px 18px" }}>
              <div
                style={{
                  width: "48px", height: "48px", margin: "0 auto 14px", borderRadius: "50%",
                  background: "var(--danger-light-bg, #fff1f2)", color: "var(--danger-color, #be123c)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px",
                }}
              >
                <FiLogOut />
              </div>
              <h3 style={{ margin: "0 0 6px", fontSize: "17px", fontWeight: 600, color: "var(--text-primary, #111827)" }}>
                Logout?
              </h3>
              <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.5, color: "var(--text-secondary, #6b7280)" }}>
                Are you sure you want to log out of your account?
              </p>
            </div>

            <div style={{ display: "flex", borderTop: "1px solid var(--border-color, #e5e7eb)" }}>
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  flex: 1, padding: "14px 8px", border: "none", background: "transparent",
                  fontSize: "17px", color: "var(--text-secondary, #6b7280)", cursor: "pointer",
                  borderRight: "1px solid var(--border-color, #e5e7eb)",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeLogout}
                style={{
                  flex: 1, padding: "14px 8px", border: "none", background: "transparent",
                  fontSize: "17px", fontWeight: 600, color: "var(--danger-color, #be123c)", cursor: "pointer",
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REMOVE PIN CONFIRMATION MODAL */}
      {showRemovePinConfirm && (
        <div
          className="ios-dialog-overlay"
          style={{
            position: "fixed", inset: 0, zIndex: 100000, display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0, 0, 0, 0.45)", backdropFilter: "blur(4px)", animation: "fadeIn 0.2s ease",
          }}
          onClick={() => setShowRemovePinConfirm(false)}
        >
          <div
            className="ios-dialog"
            role="alertdialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(320px, calc(100vw - 48px))",
              background: "var(--card-background, #fff)",
              backdropFilter: "blur(20px)",
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
              textAlign: "center",
              animation: "iosDialogIn 0.25s cubic-bezier(0.32, 0.72, 0, 1)",
            }}
          >
            <div style={{ padding: "24px 20px 18px" }}>
              <div
                style={{
                  width: "48px", height: "48px", margin: "0 auto 14px", borderRadius: "50%",
                  background: "var(--danger-light-bg, #fff1f2)", color: "var(--danger-color, #be123c)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px",
                }}
              >
                <FiAlertTriangle />
              </div>
              <h3 style={{ margin: "0 0 6px", fontSize: "17px", fontWeight: 600, color: "var(--text-primary, #111827)" }}>
                Remove Security PIN?
              </h3>
              <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.5, color: "var(--text-secondary, #6b7280)" }}>
                Removing your PIN means anyone with access to this device can open the app. Are you sure?
              </p>
            </div>

            <div style={{ display: "flex", borderTop: "1px solid var(--border-color, #e5e7eb)" }}>
              <button
                type="button"
                onClick={() => setShowRemovePinConfirm(false)}
                style={{
                  flex: 1, padding: "14px 8px", border: "none", background: "transparent",
                  fontSize: "17px", color: "var(--text-secondary, #6b7280)", cursor: "pointer",
                  borderRight: "1px solid var(--border-color, #e5e7eb)",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeRemovePin}
                style={{
                  flex: 1, padding: "14px 8px", border: "none", background: "transparent",
                  fontSize: "17px", fontWeight: 600, color: "var(--danger-color, #be123c)", cursor: "pointer",
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {showPasswordConfirm && (
        <div
          className="ios-dialog-overlay"
          style={{
            position: "fixed", inset: 0, zIndex: 100000, display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0, 0, 0, 0.45)", backdropFilter: "blur(4px)", animation: "fadeIn 0.2s ease",
          }}
          onClick={() => setShowPasswordConfirm(false)}
        >
          <div
            className="ios-dialog"
            role="alertdialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(320px, calc(100vw - 48px))",
              background: "var(--card-background, #fff)",
              backdropFilter: "blur(20px)",
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
              textAlign: "center",
              animation: "iosDialogIn 0.25s cubic-bezier(0.32, 0.72, 0, 1)",
            }}
          >
            <div style={{ padding: "22px 20px 18px" }}>
              <div
                style={{
                  width: "48px", height: "48px", margin: "0 auto 14px", borderRadius: "50%",
                  background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px",
                }}
              >
                🔒
              </div>
              <h3 style={{ margin: "0 0 6px", fontSize: "17px", fontWeight: 600, color: "var(--text-primary, #111827)" }}>
                Change Password
              </h3>
              <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.5, color: "var(--text-secondary, #6b7280)" }}>
                Are you sure you want to update your password? You'll need to use the new password for future logins.
              </p>
            </div>
            <div style={{ display: "flex", borderTop: "1px solid var(--border-color, #e5e7eb)" }}>
              <button
                type="button"
                onClick={() => setShowPasswordConfirm(false)}
                style={{
                  flex: 1, padding: "14px 8px", border: "none", background: "transparent",
                  fontSize: "17px", color: "var(--text-secondary, #6b7280)", cursor: "pointer",
                  borderRight: "1px solid var(--border-color, #e5e7eb)",
                }}
              >
                No
              </button>
              <button
                type="button"
                onClick={confirmPasswordChange}
                style={{
                  flex: 1, padding: "14px 8px", border: "none", background: "transparent",
                  fontSize: "17px", fontWeight: 600, color: "var(--primary-color, #4f46e5)", cursor: "pointer",
                }}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="profile-overview">
        <div className="profile-avatar">{loadingProfile ? "…" : initials}</div>
        <div className="profile-overview-info">
          <h2>{loadingProfile ? "Loading profile…" : name || "Your Name"}</h2>
          <p>{loadingProfile ? "Please wait" : email || "No email found"}</p>
          <span className="profile-status"><span className="profile-status-dot" />Personal Expense Tracker</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="profile-overview-badge"><span>✦</span> My Account</div>
          <button 
            onClick={() => setShowLogoutConfirm(true)} 
            className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition" 
            style={{ borderColor: "var(--danger-color)", color: "var(--danger-color)", backgroundColor: "var(--danger-light-bg)" }} 
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--danger-color)"; e.currentTarget.style.color = "white"; }} 
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--danger-light-bg)"; e.currentTarget.style.color = "var(--danger-color)"; }}
          >
            <FiLogOut size={16} /> Logout
          </button>
        </div>
      </section>

      <div className="profile-content-grid">
        <section className="profile-card">
          <div className="profile-card-heading">
            <div className="profile-heading-icon">♙</div>
            <div>
              <h2>Personal Information</h2>
              <p>Update your name and view your registered email.</p>
            </div>
          </div>
          <form onSubmit={handleProfileSubmit}>
            <div className="profile-form-field">
              <label htmlFor="profile-name">Full Name</label>
              <input id="profile-name" type="text" value={name} onChange={(e) => setName(e.target.value)} disabled={loadingProfile || savingProfile} required />
            </div>
            <div className="profile-form-field">
              <label htmlFor="profile-email">Email Address</label>
              <input id="profile-email" type="email" value={email} readOnly disabled={loadingProfile} />
              <small id="profile-email-help">Your registered email address cannot be edited here.</small>
            </div>
            <div className="profile-form-footer">
              <p>Your updated name will be saved to your account.</p>
              <button className="profile-primary-button" type="submit" disabled={loadingProfile || savingProfile || name.trim() === savedName}>
                {savingProfile ? "Saving…" : "Save Name"} <span>→</span>
              </button>
            </div>
          </form>
          <button className="profile-reload-button" type="button" onClick={loadProfile} disabled={loadingProfile || savingProfile}>
            {loadingProfile ? "Loading…" : "↻ Refresh profile"}
          </button>
        </section>

        {/* SECURITY PIN SECTION */}
        <section className="profile-card">
          <div className="profile-card-heading">
            <div className="profile-heading-icon" style={{ background: "var(--primary-light-bg)", color: "var(--primary-color)" }}>
              <FiShield />
            </div>
            <div>
              <h2>App Security PIN</h2>
              <p>Set a 4 or 6-digit PIN to secure your app.</p>
            </div>
          </div>

          {savedPin ? (
            <div style={{ marginBottom: "20px", padding: "16px", background: "var(--success-light-bg)", color: "var(--success-color)", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong style={{ display: "block", fontSize: "14px" }}>PIN is currently active</strong>
                <span style={{ fontSize: "13px" }}>You will need this PIN to open the app.</span>
              </div>
              <button 
                onClick={() => setShowRemovePinConfirm(true)} 
                style={{ background: "transparent", border: "1px solid var(--danger-color)", color: "var(--danger-color)", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--danger-light-bg)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                Remove PIN
              </button>
            </div>
          ) : (
            <div style={{ marginBottom: "20px", padding: "16px", background: "var(--danger-light-bg)", color: "var(--danger-color)", borderRadius: "12px" }}>
              <strong style={{ display: "block", fontSize: "14px" }}>No PIN set</strong>
              <span style={{ fontSize: "13px" }}>Your app is not protected by a PIN.</span>
            </div>
          )}

          <form onSubmit={handlePinSubmit}>
            <div className="profile-form-field">
              <label htmlFor="new-pin">{savedPin ? "Change PIN" : "Create PIN"}</label>
              <input
                id="new-pin"
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 4 or 6 digit PIN"
                style={{ letterSpacing: "0.5em", fontSize: "18px", textAlign: "center" }}
              />
            </div>
            {pinError && <p style={{ color: "var(--danger-color)", fontSize: "13px", marginBottom: "10px" }}>{pinError}</p>}
            {pinSuccess && <p style={{ color: "var(--success-color)", fontSize: "13px", marginBottom: "10px" }}>{pinSuccess}</p>}
            
            <button className="profile-primary-button" type="submit" style={{ width: "100%" }}>
              Save PIN <span>→</span>
            </button>
          </form>
        </section>

        <section className="profile-card profile-security-card">
          <div className="profile-card-heading">
            <div className="profile-heading-icon security-icon">♧</div>
            <div>
              <h2>Account Security</h2>
              <p>Change your account password securely.</p>
            </div>
          </div>
          <div className="profile-security-note">
            <span className="profile-security-symbol">✓</span>
            <div>
              <strong>Protect your account</strong>
              <p>Your current password must be verified before a new password can be saved.</p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit}>
            <div className="profile-form-field">
              <label htmlFor="current-password">Current Password</label>
              <input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            </div>
            <div className="profile-form-field">
              <label htmlFor="new-password">New Password</label>
              <input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={8} required />
            </div>
            <div className="profile-form-field">
              <label htmlFor="confirm-password">Confirm New Password</label>
              <input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={8} required />
            </div>
            <button className="profile-primary-button profile-password-button" type="submit" disabled={changingPassword}>
              {changingPassword ? "Updating…" : "Update Password"} <span>→</span>
            </button>
          </form>
        </section>
      </div>

      <footer className="profile-footer">
        <span>Personal Expense Tracker</span>
        <span>Manage your money. Your way.</span>
      </footer>
    </main>
  );
}

export default Profile;