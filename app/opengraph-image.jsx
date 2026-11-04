import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/config/site";

export const alt = `${siteConfig.name}: ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b1f3a",
          color: "#ffffff",
          padding: 60,
        }}
      >
        <div style={{ display: "flex", fontSize: 104, letterSpacing: 18, color: "#c8a45d", fontWeight: 700 }}>
          {siteConfig.name}
        </div>
        <div style={{ display: "flex", width: 120, height: 3, background: "#c8a45d", marginTop: 34, marginBottom: 34 }} />
        <div style={{ display: "flex", fontSize: 32, letterSpacing: 8, textTransform: "uppercase", color: "#e8e2d4" }}>
          {siteConfig.services.replace(/\|/g, "·")}
        </div>
        <div style={{ display: "flex", fontSize: 38, marginTop: 40, color: "#ffffff" }}>{siteConfig.tagline}</div>
      </div>
    ),
    { ...size }
  );
}