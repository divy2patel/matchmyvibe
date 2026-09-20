"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNav() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Discover", icon: "✨" },
    { href: "/chat", label: "AI Chat", icon: "💬" },
    { href: "/saved", label: "Saved", icon: "⭐" },
    { href: "/profile", label: "Profile", icon: "👤" },
  ];

  return (
    <nav className="mobile-bottom-bar" aria-label="Mobile Navigation">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "3px",
              padding: "6px 12px",
              textDecoration: "none",
              color: isActive ? "var(--primary-300)" : "var(--text-muted)",
              transition: "all 0.2s ease",
            }}
          >
            <span
              style={{
                fontSize: "18px",
                transform: isActive ? "scale(1.15)" : "scale(1)",
                transition: "transform 0.2s ease",
              }}
            >
              {link.icon}
            </span>
            <span
              style={{
                fontSize: "11px",
                fontWeight: isActive ? 700 : 500,
                letterSpacing: "-0.01em",
              }}
            >
              {link.label}
            </span>
            {isActive && (
              <span
                style={{
                  width: "4px",
                  height: "4px",
                  borderRadius: "50%",
                  background: "var(--primary-400)",
                  marginTop: "1px",
                }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
