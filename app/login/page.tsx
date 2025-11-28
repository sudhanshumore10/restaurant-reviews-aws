"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already logged in, go to home
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("user");
    if (stored) {
      router.push("/");
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Login failed");
        return;
      }

      // Save logged-in user locally (userId comes from DynamoDB)
      localStorage.setItem(
        "user",
        JSON.stringify({
          userId: data.userId,
          email: data.email,
          name: data.name,
        })
      );

      router.push("/");
    } catch (err) {
      setMessage("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #0f172a 0%, #020617 35%, #111827 100%)",
        color: "#e5e7eb",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: 380,
          borderRadius: "1rem",
          border: "1px solid rgba(148,163,184,0.4)",
          backgroundColor: "rgba(15,23,42,0.95)",
          padding: "1.5rem 1.75rem 1.75rem",
          boxShadow: "0 18px 40px rgba(15,23,42,0.9)",
        }}
      >
        <h1 style={{ fontSize: "1.4rem", marginBottom: "0.25rem" }}>
          Restaurant Review Login
        </h1>
        <p style={{ fontSize: "0.85rem", color: "#9ca3af", marginBottom: "1rem" }}>
          Enter your email to sign in or create an account.
        </p>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}
        >
          <div>
            <label style={{ fontSize: "0.8rem" }}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                marginTop: "0.2rem",
                padding: "0.45rem 0.6rem",
                borderRadius: "0.45rem",
                border: "1px solid rgba(148,163,184,0.7)",
                backgroundColor: "rgba(15,23,42,0.95)",
                color: "#e5e7eb",
                fontSize: "0.9rem",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.8rem" }}>Name (optional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: "100%",
                marginTop: "0.2rem",
                padding: "0.45rem 0.6rem",
                borderRadius: "0.45rem",
                border: "1px solid rgba(148,163,184,0.7)",
                backgroundColor: "rgba(15,23,42,0.95)",
                color: "#e5e7eb",
                fontSize: "0.9rem",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.8rem" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                marginTop: "0.2rem",
                padding: "0.45rem 0.6rem",
                borderRadius: "0.45rem",
                border: "1px solid rgba(148,163,184,0.7)",
                backgroundColor: "rgba(15,23,42,0.95)",
                color: "#e5e7eb",
                fontSize: "0.9rem",
              }}
            />
          </div>

          {message && (
            <div
              style={{
                marginTop: "0.3rem",
                fontSize: "0.8rem",
                color: "#fca5a5",
              }}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "0.3rem",
              padding: "0.55rem 0.6rem",
              borderRadius: "9999px",
              border: "none",
              backgroundColor: loading ? "#6b7280" : "#38bdf8",
              color: "#020617",
              fontWeight: 600,
              fontSize: "0.95rem",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Please wait..." : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}
