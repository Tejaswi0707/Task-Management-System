"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const result = await api.login(email, password);
    setLoading(false);
    if (result.ok) {
      setMessage("Logged in");
      router.push("/tasks");
    } else {
      setMessage(result.error?.message || "Login failed");
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", padding: 24, borderRadius: 4, width: "100%", maxWidth: 400 }}>
        <h1 style={{ marginBottom: 16 }}>Login</h1>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label>
            <div style={{ marginBottom: 4 }}>Email</div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
              required
            />
          </label>
          <label>
            <div style={{ marginBottom: 4 }}>Password</div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
              required
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              padding: 8,
              borderRadius: 4,
              border: "none",
              backgroundColor: "#222",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        {message && <p style={{ marginTop: 12 }}>{message}</p>}
        <p style={{ marginTop: 12 }}>
          No account? <a href="/register">Register</a>
        </p>
      </div>
    </div>
  );
}


