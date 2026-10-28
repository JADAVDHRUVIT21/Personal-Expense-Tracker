import { useState, useRef, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { FiSun, FiMoon, FiMonitor, FiChevronDown, FiCheck } from "react-icons/fi";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close the dropdown if the user clicks outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options = [
    { value: "light", label: "Light", icon: FiSun },
    { value: "dark", label: "Dark", icon: FiMoon },
    { value: "system", label: "System", icon: FiMonitor },
  ];

  const activeOption = options.find((opt) => opt.value === theme) || options[0];
  const ActiveIcon = activeOption.icon;

  const handleSelect = (value) => {
    setTheme(value);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative", display: "inline-block" }}>
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          backgroundColor: "var(--card-background)",
          border: "1px solid var(--border-color)",
          borderRadius: "20px",
          padding: "6px 12px",
          color: "var(--text-primary)",
          fontSize: "14px",
          fontWeight: 500,
          cursor: "pointer",
          transition: "all 0.2s ease",
          boxShadow: "0 2px 5px rgba(0,0,0,0.02)",
        }}
      >
        <ActiveIcon size={16} style={{ color: "var(--text-secondary)" }} />
        <span>{activeOption.label}</span>
        <FiChevronDown
          size={16}
          style={{
            color: "var(--text-secondary)",
            transition: "transform 0.2s ease",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {/* Custom Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            minWidth: "140px",
            backgroundColor: "var(--card-background)",
            border: "1px solid var(--border-color)",
            borderRadius: "14px",
            padding: "6px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
            zIndex: 50,
            animation: "dropdownIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {options.map((option) => {
            const Icon = option.icon;
            const isSelected = theme === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  padding: "8px 12px",
                  border: "none",
                  borderRadius: "8px",
                  background: isSelected ? "var(--primary-light-bg)" : "transparent",
                  color: isSelected ? "var(--primary-color)" : "var(--text-primary)",
                  fontSize: "14px",
                  fontWeight: isSelected ? 600 : 400,
                  cursor: "pointer",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = "var(--bg-main)";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Icon size={16} />
                  <span>{option.label}</span>
                </div>
                {isSelected && <FiCheck size={16} />}
              </button>
            );
          })}
        </div>
      )}

      {/* Inline animation for smooth dropdown appearance */}
      <style>
        {`
          @keyframes dropdownIn {
            from {
              opacity: 0;
              transform: translateY(-8px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}
      </style>
    </div>
  );
}