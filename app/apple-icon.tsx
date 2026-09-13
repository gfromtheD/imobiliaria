import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "white",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <svg viewBox="0 0 64 64" fill="none" height="180" width="180">
          <path d="M6 32H22C29 32 31 18 40 18H58" stroke="#1c1c1c" strokeLinecap="square" strokeLinejoin="round" strokeWidth="6" />
          <path d="M6 32H22C29 32 31 46 40 46H58" stroke="#1c1c1c" strokeLinecap="square" strokeLinejoin="round" strokeWidth="6" />
        </svg>
      </div>
    ),
    size,
  );
}
