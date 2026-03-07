import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Compensalo — Reconciliación financiera automática";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0A0A0A",
          padding: "60px 72px",
        }}
      >
        {/* Logo top-left */}
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span
            style={{
              color: "#FFFFFF",
              fontSize: 36,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            compensalo
          </span>
          <span
            style={{
              color: "#00C46A",
              fontSize: 36,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            .com
          </span>
        </div>

        {/* Center symbol + tagline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
          }}
        >
          <span
            style={{
              fontSize: 180,
              fontWeight: 700,
              color: "#00C46A",
              lineHeight: 1,
            }}
          >
            ≈
          </span>
          <span
            style={{
              color: "#FFFFFF",
              fontSize: 32,
              fontWeight: 500,
              marginTop: 16,
              letterSpacing: "-0.01em",
            }}
          >
            Reconciliación financiera automática
          </span>
        </div>

        {/* Bottom-right subtle text */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <span
            style={{
              color: "#666666",
              fontSize: 18,
              fontWeight: 400,
            }}
          >
            protocolo abierto
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
