import { useState, useEffect } from "react";
import { FiDelete, FiUser } from "react-icons/fi";

export default function AppLock() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  
  // Get saved PIN from localStorage
  const savedPin = localStorage.getItem("app_pin");
  
  // Get user info for the avatar
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user.full_name || user.name || "User";

  // Automatically verify when the entered pin length matches the saved pin length
  useEffect(() => {
    if (pin.length === savedPin?.length && savedPin) {
      if (pin === savedPin) {
        // 🔥 SUCCESS: Save unlock state to sessionStorage
        sessionStorage.setItem("app_unlocked", "true");
        
        // 🔥 FORCE RELOAD: Add ?unlocked=true so App.jsx doesn't clear the session
        window.location.href = "/dashboard?unlocked=true"; 
      } else {
        // ❌ FAILED: Shake and clear
        setError("Incorrect PIN. Try again.");
        setTimeout(() => {
          setPin("");
          setError("");
        }, 600);
      }
    }
  }, [pin, savedPin]);

  const handleKeyPress = (num) => {
    if (pin.length < savedPin?.length) {
      setPin(pin + num);
      setError("");
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError("");
  };

  if (!savedPin) return null; // Don't render if somehow no PIN is set

  // Generate dots based on the saved PIN length (4 or 6)
  const dots = Array.from({ length: savedPin.length });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-main)] p-4 relative">
      
      <div className="text-center mb-10 animate-slide-in-left">
        <div className="h-20 w-20 bg-[var(--primary-light-bg)] text-[var(--primary-color)] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <FiUser size={40} />
        </div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Welcome back, {userName.split(" ")[0]}
        </h1>
        <p className="text-sm mt-1 font-medium" style={{ color: "var(--text-secondary)" }}>
          Enter your {savedPin.length}-digit PIN to unlock
        </p>
      </div>

      {/* PIN Dots */}
      <div className={`flex gap-4 mb-8 ${error ? "animate-shake" : ""}`}>
        {dots.map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full transition-all duration-200 ${
              pin.length > i 
                ? "bg-[var(--primary-color)] scale-110 shadow-[0_0_10px_var(--primary-color)]" 
                : "bg-[var(--border-color)]"
            }`}
          />
        ))}
      </div>

      {/* Error Message */}
      <div className="h-6 mb-4">
        {error && (
          <p className="text-[var(--danger-color)] font-semibold animate-pulse text-sm">
            {error}
          </p>
        )}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-4 max-w-[300px] w-full animate-slide-in-up">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleKeyPress(num.toString())}
            className="h-16 rounded-full text-2xl font-bold transition-all active:scale-90 hover:bg-[var(--bg-main)]"
            style={{ 
              backgroundColor: "var(--card-background)", 
              color: "var(--text-primary)", 
              border: "1px solid var(--border-color)",
              boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
            }}
          >
            {num}
          </button>
        ))}
        
        <div /> {/* Empty space for alignment */}
        
        <button
          onClick={() => handleKeyPress("0")}
          className="h-16 rounded-full text-2xl font-bold transition-all active:scale-90 hover:bg-[var(--bg-main)]"
          style={{ 
            backgroundColor: "var(--card-background)", 
            color: "var(--text-primary)", 
            border: "1px solid var(--border-color)",
            boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
          }}
        >
          0
        </button>
        
        <button
          onClick={handleDelete}
          className="h-16 rounded-full flex items-center justify-center transition-all active:scale-90 hover:opacity-70"
          style={{ backgroundColor: "transparent", color: "var(--text-secondary)" }}
        >
          <FiDelete size={28} />
        </button>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-10px); }
          80% { transform: translateX(10px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
        
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in-up { animation: slideInUp 0.4s ease-out; }

        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in-left { animation: slideInLeft 0.4s ease-out; }
      `}</style>
    </div>
  );
}