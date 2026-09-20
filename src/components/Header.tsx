"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const pathname = usePathname();
  const { user, isAdmin, signOut } = useAuth();

  const navLinks = [
    { href: "/", label: "Discover", icon: "✨" },
    { href: "/chat", label: "AI Chat", icon: "💬" },
    { href: "/saved", label: "Saved", icon: "⭐" },
    { href: "/profile", label: "Profile", icon: "👤" },
  ];

  if (isAdmin) {
    navLinks.push({ href: "/admin", label: "Admin", icon: "⚙️" });
  }

  return (
    <header
      className="floating-nav"
      style={{
        padding: "10px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: "14px",
        zIndex: 50,
      }}
    >
      {/* Brand & DDU Identity */}
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          textDecoration: "none",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #5B55F5, #7C5CFF, #FFAA2B)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            boxShadow: "0 4px 14px rgba(91, 85, 245, 0.4)",
            flexShrink: 0,
          }}
        >
          🎯
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontSize: "17px",
              fontWeight: 800,
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
              color: "#fff",
            }}
          >
            MatchMyVibe
          </span>
          <span
            style={{
              fontSize: "9.5px",
              color: "var(--accent-amber)",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            DDU Campus
          </span>
        </div>
      </Link>

      {/* Center Desktop Nav Links */}
      <nav className="desktop-nav-links" style={{ display: "flex", gap: "6px", alignItems: "center" }}>
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                padding: "6px 14px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 600,
                textDecoration: "none",
                color: isActive ? "#fff" : "var(--text-secondary)",
                background: isActive ? "rgba(91, 85, 245, 0.22)" : "transparent",
                border: isActive ? "1px solid rgba(124, 92, 255, 0.4)" : "1px solid transparent",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s ease",
              }}
            >
              <span style={{ fontSize: "12px" }}>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Right User & AI Status Area */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Link
              href="/profile"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "4px 10px",
                borderRadius: "16px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--border-subtle)",
                textDecoration: "none",
                color: "var(--text-primary)",
                fontSize: "12.5px",
                fontWeight: 600,
              }}
            >
              <span>🎓</span>
              <span style={{ maxWidth: "90px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.name.split(" ")[0]}
              </span>
              {isAdmin && (
                <span
                  style={{
                    fontSize: "9px",
                    padding: "1px 5px",
                    borderRadius: "4px",
                    background: "rgba(168, 85, 247, 0.3)",
                    color: "#d8b4fe",
                    fontWeight: 700,
                  }}
                >
                  ADMIN
                </span>
              )}
            </Link>

            <button
              onClick={() => signOut()}
              title="Sign Out"
              style={{
                padding: "5px 10px",
                borderRadius: "8px",
                border: "1px solid rgba(239, 68, 68, 0.25)",
                background: "rgba(239, 68, 68, 0.08)",
                color: "#fca5a5",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Link
              href="/login"
              style={{
                padding: "6px 14px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, var(--primary-500), #7C5CFF)",
                color: "#fff",
                fontSize: "12.5px",
                fontWeight: 600,
                textDecoration: "none",
                boxShadow: "0 2px 10px rgba(91, 85, 245, 0.35)",
              }}
            >
              Sign In
            </Link>
          </div>
        )}

        {/* AI Resilient Indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 10px",
            borderRadius: "16px",
            background: "rgba(91, 85, 245, 0.1)",
            border: "1px solid rgba(124, 92, 255, 0.25)",
            fontSize: "11px",
            color: "var(--primary-300)",
            fontWeight: 600,
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "var(--tier-high)",
              display: "inline-block",
              animation: "pulse-glow 2s ease-in-out infinite",
            }}
          />
          <span className="desktop-only">AI Resilient</span>
        </div>
      </div>
    </header>
  );
}
