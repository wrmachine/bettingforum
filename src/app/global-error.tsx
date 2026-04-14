"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", textAlign: "center" }}>
        <h2>Something went wrong</h2>
        <p style={{ marginTop: "1rem", color: "#64748b" }}>
          A critical error occurred. Please try again.
        </p>
        {process.env.NODE_ENV === "development" && (
          <pre style={{ marginTop: "1rem", maxWidth: "100%", overflow: "auto", padding: "1rem", background: "#fef2f2", color: "#b91c1c", fontSize: "12px", textAlign: "left" }}>
            {error.message}
          </pre>
        )}
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: "1.5rem",
            padding: "0.5rem 1rem",
            backgroundColor: "#ff6154",
            color: "white",
            border: "none",
            borderRadius: 0,
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
