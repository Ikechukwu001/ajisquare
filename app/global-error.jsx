"use client";

export default function GlobalError({ reset }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#faf9f6",
          color: "#24221f",
        }}
      >
        <div>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ color: "#6b665e", marginBottom: 24 }}>Please try again in a moment.</p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              background: "#24221f",
              color: "#fff",
              border: 0,
              padding: "12px 28px",
              fontSize: 13,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}