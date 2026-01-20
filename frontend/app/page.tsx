export default function Home() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", padding: 24, borderRadius: 4, width: "100%", maxWidth: 400 }}>
        <h1 style={{ marginBottom: 16 }}>Earnest Tasks</h1>
        <p style={{ marginBottom: 16 }}>Simple task manager with authentication.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <a href="/login">Login</a>
          <a href="/register">Register</a>
          <a href="/tasks">Go to tasks</a>
        </div>
      </div>
    </div>
  );
}
