"use client";
import React from "react";

// 一筆書きダンジョン テーマ: ダンジョン/謎解き - 青/紫/シアン/金
const ORBS = [
  { color: "rgba(59,130,246,0.18)",  size: 320, left: "5%",  top: "3%",  dur: 9,  delay: 0   },
  { color: "rgba(124,58,237,0.16)",  size: 260, left: "75%", top: "10%", dur: 11, delay: 1.2 },
  { color: "rgba(6,182,212,0.18)",   size: 290, left: "40%", top: "55%", dur: 8,  delay: 0.7 },
  { color: "rgba(245,158,11,0.16)",  size: 210, left: "85%", top: "50%", dur: 7,  delay: 2.0 },
  { color: "rgba(59,130,246,0.14)",  size: 370, left: "3%",  top: "70%", dur: 12, delay: 0.4 },
  { color: "rgba(124,58,237,0.12)",  size: 190, left: "55%", top: "15%", dur: 6,  delay: 1.0 },
  { color: "rgba(6,182,212,0.14)",   size: 270, left: "25%", top: "35%", dur: 10, delay: 2.8 },
  { color: "rgba(245,158,11,0.12)",  size: 230, left: "65%", top: "78%", dur: 9,  delay: 0.5 },
];

export default function OrbBackground() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
        background: "linear-gradient(135deg,#0B0F1E 0%,#0d1220 40%,#0a1030 100%)",
      }}
      aria-hidden="true"
    >
      {ORBS.map((o, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: o.left,
            top: o.top,
            width: o.size,
            height: o.size,
            borderRadius: "50%",
            background: `radial-gradient(circle,${o.color} 0%,transparent 70%)`,
            filter: "blur(80px)",
            animation: `orbFloat ${o.dur}s ease-in-out ${o.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
