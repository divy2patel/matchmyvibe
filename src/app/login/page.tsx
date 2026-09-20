"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, loginAsDemo, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email.trim() || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setLoading(true);
    const res = await signIn(email, password);
    setLoading(false);

    if (res.success) {
      router.push("/");
    } else {
      setErrorMsg(res.error || "Invalid credentials. Please try again.");
    }
  };

  const handleDemo = async (role: "student" | "admin") => {
    setLoading(true);
    await loginAsDemo(role);
    setLoading(false);
    router.push("/");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px 80px 20px",
        }}
      >
        <div
          className="glass glow"
          style={{
            width: "100%",
            maxWidth: "460px",
            borderRadius: "24px",
            padding: "36px 32px",
            border: "1px solid rgba(255, 255, 255, 0.12)",
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                fontSize: "26px",
                marginBottom: "14px",
              }}
            >
              🎓
            </div>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: 800,
                fontFamily: "'Space Grotesk', sans-serif",
                marginBottom: "6px",
              }}
            >
              Welcome Back to <span className="gradient-text">MatchMyVibe</span>
            </h1>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
              Sign in with your DDU student account to access matches & chat.
            </p>
          </div>

          {errorMsg && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "12px",
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#fca5a5",
                fontSize: "13px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  marginBottom: "6px",
                  color: "var(--text-secondary)",
                }}
              >
                Student Email
              </label>
              <input
                type="email"
                required
                placeholder="student@ddu.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  border: "1px solid var(--border-subtle)",
                  background: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  marginBottom: "6px",
                  color: "var(--text-secondary)",
                }}
              >
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  border: "1px solid var(--border-subtle)",
                  background: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "6px",
                width: "100%",
                padding: "12px",
                borderRadius: "12px",
                border: "none",
                background: "linear-gradient(135deg, var(--primary-500), #a855f7)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "15px",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 14px rgba(99, 102, 241, 0.4)",
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Quick Demo Access */}
          <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border-subtle)" }}>
            <p
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--text-muted)",
                textAlign: "center",
                marginBottom: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Or Instant 1-Click Demo Login
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <button
                type="button"
                onClick={() => handleDemo("student")}
                style={{
                  padding: "10px",
                  borderRadius: "10px",
                  border: "1px solid rgba(99, 102, 241, 0.3)",
                  background: "rgba(99, 102, 241, 0.1)",
                  color: "var(--primary-300)",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                🎓 Student Demo
              </button>
              <button
                type="button"
                onClick={() => handleDemo("admin")}
                style={{
                  padding: "10px",
                  borderRadius: "10px",
                  border: "1px solid rgba(168, 85, 247, 0.3)",
                  background: "rgba(168, 85, 247, 0.1)",
                  color: "#d8b4fe",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                ⚙ Admin Demo
              </button>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: "24px" }}>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
              Don't have an account?{" "}
              <Link
                href="/signup"
                style={{
                  color: "var(--primary-400)",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Create Student Account
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
