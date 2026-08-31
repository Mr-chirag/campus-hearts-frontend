"use client";

/**
 * Last-resort boundary: catches errors in the ROOT layout itself, so it must
 * render its own <html> and <body> — nothing above it survived to do that.
 * Styles are inline for the same reason: the stylesheet may be what failed.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "1.5rem",
          textAlign: "center",
          background: "#FFF0F3",
          color: "#2D2D2D",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <span style={{ fontSize: "3rem" }}>💔</span>
        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Campus Hearts hit a snag</h1>
        <p style={{ margin: 0, maxWidth: "24rem", lineHeight: 1.6, color: "#6B6B6B" }}>
          Something broke badly enough that we couldn&apos;t load the page.
        </p>
        {error.digest && (
          <p style={{ margin: 0, fontFamily: "monospace", fontSize: "0.75rem", color: "#6B6B6B" }}>
            ref: {error.digest}
          </p>
        )}
        <button
          onClick={() => retry()}
          style={{
            marginTop: "0.5rem",
            padding: "0.875rem 2rem",
            fontSize: "1rem",
            fontWeight: 600,
            color: "#fff",
            background: "#FF4D6D",
            border: "none",
            borderRadius: "999px",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
